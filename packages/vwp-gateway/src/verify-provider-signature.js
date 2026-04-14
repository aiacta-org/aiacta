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
// Keys are loaded from environment variables only.
//
// FIX: Previous version fell back to hardcoded dev defaults when env vars were
// missing. This means anyone who knows the repo's default strings could forge
// valid provider signatures in production. Now we fail closed:
//   - If an env var is set to the default dev value, we reject at startup.
//   - If no key is configured for a provider, we return false (not throw).
//
// In production, fetch keys from a KMS. The env vars are the minimum viable
// configuration for a single-server reference deployment.

const DEV_DEFAULT_KEYS = new Set([
  'dev-hmac-key-anthropic',
  'dev-hmac-key-openai',
  'dev-hmac-key-google',
  'dev-hmac-key-xai',
  'dev-hmac-key-perplexity',
  'dev-hmac-key-microsoft',
  'dev-hmac-key-meta',
]);

// Validate at module load time — fails the process before accepting any traffic
if (process.env.NODE_ENV === 'production') {
  for (const [envVar, devDefault] of [
    ['SIGNING_KEY_ANTHROPIC', 'dev-hmac-key-anthropic'],
    ['SIGNING_KEY_OPENAI',    'dev-hmac-key-openai'],
    ['SIGNING_KEY_GOOGLE',    'dev-hmac-key-google'],
    ['SIGNING_KEY_XAI',       'dev-hmac-key-xai'],
    ['SIGNING_KEY_PERPLEXITY', 'dev-hmac-key-perplexity'],
    ['SIGNING_KEY_MICROSOFT', 'dev-hmac-key-microsoft'],
    ['SIGNING_KEY_META',      'dev-hmac-key-meta'],
  ]) {
    const val = process.env[envVar];
    if (val === devDefault || val === undefined) {
      throw new Error(
        `[vwp-gateway] FATAL: ${envVar} is not configured or uses the dev default. ` +
        `Set real signing keys before starting in production.`
      );
    }
  }
}

// Only load keys that are explicitly configured — no fallback to dev defaults
const PROVIDER_HMAC_KEYS = {};
if (process.env.SIGNING_KEY_ANTHROPIC) PROVIDER_HMAC_KEYS['anthropic'] = process.env.SIGNING_KEY_ANTHROPIC;
if (process.env.SIGNING_KEY_OPENAI)    PROVIDER_HMAC_KEYS['openai']    = process.env.SIGNING_KEY_OPENAI;
if (process.env.SIGNING_KEY_GOOGLE)    PROVIDER_HMAC_KEYS['google']    = process.env.SIGNING_KEY_GOOGLE;
if (process.env.SIGNING_KEY_XAI)       PROVIDER_HMAC_KEYS['xai']       = process.env.SIGNING_KEY_XAI;
if (process.env.SIGNING_KEY_PERPLEXITY) PROVIDER_HMAC_KEYS['perplexity'] = process.env.SIGNING_KEY_PERPLEXITY;
if (process.env.SIGNING_KEY_MICROSOFT) PROVIDER_HMAC_KEYS['microsoft'] = process.env.SIGNING_KEY_MICROSOFT;
if (process.env.SIGNING_KEY_META)      PROVIDER_HMAC_KEYS['meta']      = process.env.SIGNING_KEY_META;


// Ed25519 public keys (PEM or hex) — populated at enrollment
const PROVIDER_ED25519_PUBKEYS = {
  // Example: 'perplexity': '302a300506032b6570032100...'  (DER hex)
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
