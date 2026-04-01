const express = require('express');
const request = require('supertest');
const { createReferrerMiddleware } = require('../src/node/index');

function makeApp(opts) {
  const app = express();
  app.use(createReferrerMiddleware(opts));
  app.get('/test', (_, res) => res.json({ ok: true }));
  return app;
}

test('sets Referrer-Policy: origin', async () => {
  const res = await request(makeApp({ provider: 'anthropic' })).get('/test');
  expect(res.headers['referrer-policy']).toBe('origin');
});

test('does not append UTM when disabled', async () => {
  const app = makeApp({ provider: 'anthropic', appendUtm: false });
  const res = await request(app).get('/test');
  expect(res.headers['referrer-policy']).toBe('origin');
});
