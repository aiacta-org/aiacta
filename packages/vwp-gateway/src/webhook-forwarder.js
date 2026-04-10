/**
 * Forwards a validated citation event to the publisher's Citation-Webhook
 * endpoint. Signs the outbound payload with the AAC HMAC key so publishers
 * can verify using the ai-citation-sdk (§3.4A).
 *
 * Implements the 10-second publisher timeout requirement (§3.5):
 *   "Publisher must respond HTTP 200 within 10 seconds."
 *
 * SECURITY: Validates the webhook URL to prevent SSRF attacks.
 * Only HTTPS URLs to public internet addresses are permitted.
 * Private IP ranges and localhost are explicitly blocked.
 */
'use strict';
const crypto = require('crypto');
const axios  = require('axios');
const { URL } = require('url');

const AAC_SIGNING_SECRET  = process.env.AAC_SIGNING_SECRET || 'aac-dev-secret-change-in-prod';
const PUBLISHER_TIMEOUT_MS = 10_000; // §3.5

// Private/reserved IP ranges that must never receive forwarded webhooks
const BLOCKED_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,       // 127.0.0.0/8 loopback
  /^10\.\d+\.\d+\.\d+$/,        // 10.0.0.0/8 private
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/, // 172.16.0.0/12 private
  /^192\.168\.\d+\.\d+$/,       // 192.168.0.0/16 private
  /^169\.254\.\d+\.\d+$/,       // 169.254.0.0/16 link-local (AWS metadata)
  /^::1$/,                      // IPv6 loopback
  /^fc00:/i,                    // IPv6 unique local
  /^fe80:/i,                    // IPv6 link-local
  /^0\.0\.0\.0$/,
  /^metadata\.google\.internal$/i,
  /^169\.254\.169\.254$/,       // AWS/GCP/Azure metadata service
];

/**
 * Validates a publisher webhook URL against SSRF attack vectors.
 * Throws if the URL is unsafe.
 *
 * @param {string} urlString  The webhook URL from the publisher's enrollment record
 * @throws {Error} if the URL is invalid, non-HTTPS, or targets a private address
 */
function validateWebhookUrl(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch (_) {
    throw new Error(`Invalid webhook URL: ${urlString}`);
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(`Webhook URL must use HTTPS. Got: ${parsed.protocol}`);
  }

  const hostname = parsed.hostname.toLowerCase();
  for (const pattern of BLOCKED_HOSTNAME_PATTERNS) {
    if (pattern.test(hostname)) {
      throw new Error(`Webhook URL targets a blocked address (SSRF protection): ${hostname}`);
    }
  }
}

/**
 * @param {object} event        Parsed, validated CitationEvent
 * @param {string} providerId   Registered provider ID (for logging)
 */
async function forwardWebhook(event, providerId) {
  const endpoint = event._publisher_webhook_url;
  if (!endpoint) return; // publisher has no registered webhook

  // Validate before making any outbound request
  validateWebhookUrl(endpoint);

  const payload   = JSON.stringify(event);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const sig = 'sha256=' + crypto
    .createHmac('sha256', AAC_SIGNING_SECRET)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  try {
    await axios.post(endpoint, payload, {
      headers: {
        'Content-Type':           'application/json',
        'X-AI-Webhook-Sig':       sig,
        'X-AI-Webhook-Timestamp': timestamp,
      },
      timeout: PUBLISHER_TIMEOUT_MS,
      // Disable redirects — a redirect could bypass the URL validation above
      maxRedirects: 0,
    });
  } catch (err) {
    console.error(`[vwp-gateway] forward to ${endpoint} failed: ${err.message}`);
    throw err;
  }
}

module.exports = { forwardWebhook, validateWebhookUrl, PUBLISHER_TIMEOUT_MS };
