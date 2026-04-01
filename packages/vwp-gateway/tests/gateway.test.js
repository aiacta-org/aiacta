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
