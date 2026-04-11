const request = require('supertest');
const crypto  = require('crypto');
const app     = require('../src/index');

function sign(body, ts, secret) {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex');
}

test('GET /health returns ok', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
});

test('POST /gateway/dispatch rejects missing signature', async () => {
  const res = await request(app)
    .post('/gateway/dispatch')
    .set('Content-Type', 'application/json')
    .set('X-AIACTA-Provider', 'anthropic')
    .set('X-AIACTA-Timestamp', String(Math.floor(Date.now() / 1000)))
    .send('{"event_type":"citation.generated"}');
  expect([401, 400]).toContain(res.status);
});

test('POST /gateway/dispatch rejects events without a publisher destination', async () => {
  const body = JSON.stringify({
    event_type: 'citation.generated',
    citation: { url: 'https://example.com/article' },
  });
  const ts = String(Math.floor(Date.now() / 1000));

  const res = await request(app)
    .post('/gateway/dispatch')
    .set('Content-Type', 'application/json')
    .set('X-AIACTA-Provider', 'anthropic')
    .set('X-AIACTA-Timestamp', ts)
    .set('X-AIACTA-Signature', sign(body, ts, process.env.SIGNING_KEY_ANTHROPIC || 'dev-hmac-key-anthropic'))
    .send(body);

  expect(res.status).toBe(422);
  expect(res.body.error).toMatch(/destination missing/i);
});
