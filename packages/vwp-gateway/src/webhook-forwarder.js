/**
 * Forwards a validated citation event to the publisher's Citation-Webhook
 * endpoint.  Signs the outbound payload with the AAC HMAC key so publishers
 * can verify using the ai-citation-sdk (§3.4A).
 *
 * Implements the 10-second publisher timeout requirement (§3.5):
 *   "Publisher must respond HTTP 200 within 10 seconds."
 */
'use strict';
const crypto = require('crypto');
const axios  = require('axios');

const AAC_SIGNING_SECRET = process.env.AAC_SIGNING_SECRET || 'aac-dev-secret-change-in-prod';
const PUBLISHER_TIMEOUT_MS = 10_000; // §3.5

/**
 * @param {object} event        Parsed, validated CitationEvent
 * @param {string} providerId   Registered provider ID (for logging)
 */
async function forwardWebhook(event, providerId) {
  const endpoint = event._publisher_webhook_url;
  if (!endpoint) return; // publisher has no registered webhook

  const payload   = JSON.stringify(event);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const sig = 'sha256=' + crypto
    .createHmac('sha256', AAC_SIGNING_SECRET)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  try {
    await axios.post(endpoint, payload, {
      headers: {
        'Content-Type':             'application/json',
        'X-AI-Webhook-Sig':         sig,
        'X-AI-Webhook-Timestamp':   timestamp,
      },
      timeout: PUBLISHER_TIMEOUT_MS,
    });
  } catch (err) {
    // Log and let the retry queue handle re-delivery (§3.5)
    console.error(`[vwp-gateway] forward to ${endpoint} failed: ${err.message}`);
    throw err; // bubble up so caller can enqueue for retry
  }
}

module.exports = { forwardWebhook, PUBLISHER_TIMEOUT_MS };
