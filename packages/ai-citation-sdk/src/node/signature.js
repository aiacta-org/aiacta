/**
 * Cryptographic webhook signature verification (§3.4 — HMAC-SHA256).
 * Implements the exact algorithm specified in the whitepaper.
 */
'use strict';
const crypto = require('crypto');

const TIMESTAMP_TOLERANCE_SECONDS = 300; // 5 minutes (§3.4)

/**
 * @param {string|Buffer} payload  Raw request body
 * @param {string} timestamp       Value of X-AI-Webhook-Timestamp header
 * @param {string} sigHeader       Value of X-AI-Webhook-Sig header (sha256=<hex>)
 * @param {string} secret          Shared HMAC secret issued at enrollment
 * @returns {boolean}
 * @throws {Error} if timestamp is outside tolerance window
 */
function verifyWebhookSignature(payload, timestamp, sigHeader, secret) {
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > TIMESTAMP_TOLERANCE_SECONDS) {
    throw new Error('Timestamp outside tolerance window — possible replay attack');
  }
  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  const received  = sigHeader.replace('sha256=', '');
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'));
}

module.exports = { verifyWebhookSignature, TIMESTAMP_TOLERANCE_SECONDS };
