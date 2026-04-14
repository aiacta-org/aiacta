/**
 * E2E scenario: Proposal 3 — Referrer header standardisation.
 * Verifies that the referrer middleware injects the correct policy header.
 */
const express  = require('express');
const request  = require('supertest');
const { createReferrerMiddleware, STANDARD_REFERRERS } = require('../../referrer-middleware/src/node/index');

function makeApp(provider) {
  const app = express();
  app.use(createReferrerMiddleware({ provider }));
  app.get('/', (_, res) => res.json({ ok: true }));
  return app;
}

test('standard referrer URLs are defined for all major providers', () => {
  ['openai', 'google', 'anthropic', 'xai', 'perplexity', 'microsoft','meta'].forEach(p => {
    expect(STANDARD_REFERRERS[p]).toMatch(/^https:\/\//);
  });
});

test('middleware sets Referrer-Policy: origin', async () => {
  const res = await request(makeApp('anthropic')).get('/');
  expect(res.headers['referrer-policy']).toBe('origin');
});
