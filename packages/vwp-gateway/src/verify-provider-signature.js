/**
 * Provider identity verification — supports both HMAC-SHA256 and Ed25519 (§3.4A).
 *
 * Mechanism:
 *   HMAC-SHA256 — symmetric key issued at enrollment (simpler, suitable for most providers)
 *   Ed25519     — asymmetric: provider holds private key; AAC/publishers hold public key.
 *                 More secure; provider can sign without sharing secrets.
 *
 * The signature covers: `${timestamp}.${rawBody}` (same as the publisher-facing webhook).
 *
 * Security: timestamp tolerance window of ±5 minutes prevents replay attacks.
 */
'use strict';
const crypto = require('crypto');

const TIMESTAMP_TOLERANCE_SECONDS = 300; // §3.4A

// ── Key store ─────────────────────────────────────────────────────────────
// In production: fetch from a KMS or secure DB keyed by providerId.
// Keys are set via environment variables or populated at enrollment.
const PROVIDER_HMAC_KEYS = {
  'anthropic': process.env.SIGNING_KEY_ANTHROPIC || 'dev-hmac-key-anthropic',
  'openai':    process.env.SIGNING_KEY_OPENAI    || 'dev-hmac-key-openai',
  'google':    process.env.SIGNING_KEY_GOOGLE    || 'dev-hmac-key-google',
};

// Ed25519 public keys (PEM or hex) — populated at enrollment
const PROVIDER_ED25519_PUBKEYS = {
  // Example: 'anthropic': '302a300506032b6570032100...'  (DER hex)
};

/**
 * Verify a provider signature.
 *
 * @param {Buffer|string} rawBody     Raw request body
 * @param {string}        timestamp   X-AIACTA-Timestamp header value (UNIX seconds)
 * @param {string}        sigHeader   X-AIACTA-Signature header: "sha256=<hex>" or "ed25519=<hex>"
 * @param {string}        providerId  X-AIACTA-Provider header value
 * @returns {boolean}
 * @throws {Error} if timestamp is outside tolerance window or algorithm is unknown
 */
function verifyProviderSignature(rawBody, timestamp, sigHeader, providerId) {
  if (!sigHeader || !timestamp || !providerId) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > TIMESTAMP_TOLERANCE_SECONDS) {
    throw new Error('Timestamp outside tolerance window — possible replay attack');
  }

  const signedPayload = Buffer.isBuffer(rawBody)
    ? Buffer.concat([Buffer.from(`${timestamp}.`), rawBody])
    : Buffer.from(`${timestamp}.${rawBody}`);

  if (sigHeader.startsWith('sha256=')) {
    return _verifyHmac(signedPayload, sigHeader, providerId);
  }
  if (sigHeader.startsWith('ed25519=')) {
    return _verifyEd25519(signedPayload, sigHeader, providerId);
  }
  throw new Error(`Unknown signature algorithm in header: ${sigHeader.split('=')[0]}`);
}

function _verifyHmac(signedPayload, sigHeader, providerId) {
  const secret = PROVIDER_HMAC_KEYS[providerId];
  if (!secret) return false;
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sigHeader));
  } catch { return false; }
}

function _verifyEd25519(signedPayload, sigHeader, providerId) {
  const pubKeyHex = PROVIDER_ED25519_PUBKEYS[providerId];
  if (!pubKeyHex) return false;
  try {
    const pubKey    = crypto.createPublicKey({ key: Buffer.from(pubKeyHex, 'hex'), format: 'der', type: 'spki' });
    const sigBytes  = Buffer.from(sigHeader.replace('ed25519=', ''), 'hex');
    return crypto.verify(null, signedPayload, pubKey, sigBytes);
  } catch { return false; }
}

/**
 * Register a provider's HMAC key at runtime (used by enrollment flow).
 * @param {string} providerId
 * @param {string} hmacKey
 */
function registerProviderHmacKey(providerId, hmacKey) {
  PROVIDER_HMAC_KEYS[providerId] = hmacKey;
}

/**
 * Register a provider's Ed25519 public key at runtime.
 * @param {string} providerId
 * @param {string} pubKeyHex   DER-encoded SubjectPublicKeyInfo in hex
 */
function registerProviderEd25519Key(providerId, pubKeyHex) {
  PROVIDER_ED25519_PUBKEYS[providerId] = pubKeyHex;
}

module.exports = {
  verifyProviderSignature,
  registerProviderHmacKey,
  registerProviderEd25519Key,
  TIMESTAMP_TOLERANCE_SECONDS,
};
