// IMPORTANT: set env vars BEFORE requiring any modules.
// verify-provider-signature.js reads process.env.SIGNING_KEY_* at module-load
// time to populate PROVIDER_HMAC_KEYS. If the var is not set before require(),
// the key store will be empty and every signature check returns false (401).

const TEST_SIGNING_SECRET = 'test-signing-secret-gateway';
process.env.SIGNING_KEY_ANTHROPIC = TEST_SIGNING_SECRET;

process.env.AIACTA_SIGNING_SECRET    = 'test-aac-signing-secret';

jest.mock('axios', () => ({
  get: jest.fn(),
}));

jest.mock('../src/webhook-forwarder', () => ({
  forwardWebhook: jest.fn(() => Promise.resolve()),
}));

const request = require('supertest');
const crypto  = require('crypto');
const axios   = require('axios');
const { forwardWebhook } = require('../src/webhook-forwarder');
const app     = require('../src/index');

function sign(body, ts, secret) {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex');
}

beforeEach(() => {
  jest.clearAllMocks();
});

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

test('POST /gateway/dispatch holds events when no publisher destination can be resolved', async () => {
  axios.get.mockRejectedValue(new Error('not found'));

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
    .set('X-AIACTA-Signature', sign(body, ts, TEST_SIGNING_SECRET))
    .send(body);

  expect(res.status).toBe(202);
  expect(res.body.status).toBe('hold');
  expect(res.body.hold_reason).toMatch(/no webhook url registered/i);
  expect(forwardWebhook).not.toHaveBeenCalled();
});

test('POST /gateway/dispatch resolves publisher webhook from AAC server before forwarding', async () => {
  axios.get.mockResolvedValue({
    data: { webhook_url: 'https://publisher.example/webhooks/ai-citations' },
  });

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
    .set('X-AIACTA-Signature', sign(body, ts, TEST_SIGNING_SECRET))
    .send(body);

  expect(res.status).toBe(202);
  expect(res.body.status).toBe('dispatched');
  expect(axios.get).toHaveBeenCalledWith(
    'http://localhost:3100/internal/publishers/example.com/webhook',
    expect.objectContaining({ timeout: 3000 })
  );
  expect(forwardWebhook).toHaveBeenCalledWith(
    expect.objectContaining({
      _publisher_webhook_url: 'https://publisher.example/webhooks/ai-citations',
    }),
    'anthropic'
  );
});