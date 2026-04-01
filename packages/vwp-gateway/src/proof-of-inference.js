/**
 * Proof-of-Inference (PoI) — §3.4B.
 *
 * Validates that a citation event corresponds to a real inference by
 * checking the content_hash in the event against the provider's audit store.
 *
 * The spot-audit rule: a random 1-in-N sample is checked synchronously;
 * all others are queued for async verification.
 */
'use strict';

const SPOT_AUDIT_RATE = 0.05; // 5% of events checked synchronously

/**
 * @param {object} event  Parsed CitationEvent
 * @returns {{ valid: boolean, reason?: string, audited: boolean }}
 */
async function checkPoI(event) {
  const doAudit = Math.random() < SPOT_AUDIT_RATE;

  if (!doAudit) {
    // Queue async verification — implemented by the provider's audit endpoint
    queueAsyncAudit(event).catch(() => {}); // fire-and-forget
    return { valid: true, audited: false };
  }

  // Synchronous spot check: verify the content_hash exists in provider audit store
  const hash = event.citation?.content_hash;
  if (!hash) {
    // No hash provided — flag as unverifiable but not outright rejected in v1.0
    return { valid: true, audited: true, warning: 'No content_hash in citation — consider adding for stronger PoI' };
  }

  // In production: call provider's audit endpoint to verify hash
  // const verified = await callProviderAuditEndpoint(event.provider, hash);
  const verified = true; // stub — always passes in reference implementation
  if (!verified) return { valid: false, reason: 'PoI hash not found in provider audit store', audited: true };

  return { valid: true, audited: true };
}

async function queueAsyncAudit(event) {
  // TODO: push to a message queue (e.g., SQS, Redis Streams) for background processing
  // The AAC audit worker consumes this queue and flags non-compliant providers
}

module.exports = { checkPoI };
