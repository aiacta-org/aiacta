/**
 * E2E scenario: Proposal 2 — Citation Webhook signature and idempotency.
 * Uses the ai-citation-sdk's signature verifier directly against the fixture.
 */
const { verifyWebhookSignature } = require('../../ai-citation-sdk/src/node/signature');
const { processEvent }           = require('../../ai-citation-sdk/src/node/processor');
const fixture = require('../fixtures/citation-webhooks/sample-event.json');
const crypto  = require('crypto');

const SECRET = 'test-secret';

function makeSig(payload, ts) {
  return 'sha256=' + crypto.createHmac('sha256', SECRET).update(`${ts}.${payload}`).digest('hex');
}

test('fixture event passes HMAC verification', () => {
  const ts      = String(Math.floor(Date.now() / 1000));
  const payload = JSON.stringify(fixture);
  const sig     = makeSig(payload, ts);
  expect(verifyWebhookSignature(payload, ts, sig, SECRET)).toBe(true);
});

test('fixture event is processed and marked as idempotent', async () => {
  const processed = new Set();
  let count = 0;
  for (let i = 0; i < 3; i++) {
    await processEvent(fixture, {
      isProcessed:   k => processed.has(k),
      markProcessed: k => processed.add(k),
      onEvent:       async () => { count++; },
    });
  }
  expect(count).toBe(1); // processed exactly once despite 3 calls
});
