/**
 * Cryptographic webhook signature verification (§3.4 — HMAC-SHA256).
 * Implements the exact algorithm specified in the whitepaper.
 */
'use strict';
const crypto = require('crypto');

const TIMESTAMP_TOLERANCE_SECONDS = 300; // 5 minutes (§3.4)

/**
 * @param {string|Buffer} payload  Raw request body
 * @param {string} timestamp       Value of X-AIACTA-Webhook-Timestamp header
 * @param {string} sigHeader       Value of X-AIACTA-Webhook-Signature header (sha256=<hex>)
 * @param {string} secret          Shared HMAC secret issued at enrollment
 * @returns {boolean}
 * @throws {Error} if timestamp is outside tolerance window
 */
function verifyWebhookSignature(payload, timestamp, sigHeader, secret) {
  if (!secret || typeof sigHeader !== 'string' || !sigHeader.startsWith('sha256=')) {
    return false;
  }

  const parsedTimestamp = parseInt(timestamp, 10);
  if (!Number.isFinite(parsedTimestamp)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parsedTimestamp) > TIMESTAMP_TOLERANCE_SECONDS) {
    throw new Error('Timestamp outside tolerance window — possible replay attack');
  }

  const received = sigHeader.slice('sha256='.length);
  if (!/^[0-9a-f]{64}$/i.test(received)) {
    return false;
  }

  const body = Buffer.isBuffer(payload) ? payload : Buffer.from(String(payload));
  const signedPayload = Buffer.concat([Buffer.from(`${timestamp}.`), body]);
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'));
}

module.exports = { verifyWebhookSignature, TIMESTAMP_TOLERANCE_SECONDS };
