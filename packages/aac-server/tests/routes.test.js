/**
 * AAC Server route tests.
 * better-sqlite3 uses an in-memory DB (:memory:) during tests via AAC_DB_PATH env.
 */
process.env.AAC_DB_PATH = ':memory:';
const request = require('supertest');
const { app, initDb } = require('../src/index');

beforeAll(() => { initDb(); });

describe('Health', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.spec).toBe('AIACTA/1.0');
  });
});

describe('Enrollment — providers', () => {
  test('creates a provider with PCF contribution mode', async () => {
    const res = await request(app)
      .post('/v1/enrollment/providers')
      .send({ name: 'Test Provider', contribution_mode: 'pcf', pcf_rate: 0.001 });
    expect([200, 201]).toContain(res.status);
    expect(res.body.provider_id).toBeDefined();
    expect(res.body.status).toBe('active');
  });

  test('creates a provider with RPA contribution mode', async () => {
    const res = await request(app)
      .post('/v1/enrollment/providers')
      .send({ name: 'RPA Provider', contribution_mode: 'rpa', rpa_rate: 0.01 });
    expect([200, 201]).toContain(res.status);
  });

  test('rejects invalid contribution_mode', async () => {
    const res = await request(app)
      .post('/v1/enrollment/providers')
      .send({ name: 'Bad', contribution_mode: 'invalid' });
    expect(res.status).toBe(400);
  });

  test('requires name field', async () => {
    const res = await request(app)
      .post('/v1/enrollment/providers')
      .send({ contribution_mode: 'pcf' });
    expect(res.status).toBe(400);
  });
});

describe('Enrollment — publishers', () => {
  test('creates a publisher', async () => {
    const res = await request(app)
      .post('/v1/enrollment/publishers')
      .send({ domain: 'test-pub.com', reward_tier: 'standard', content_license: 'CC-BY-SA-4.0' });
    expect([200, 201]).toContain(res.status);
    expect(res.body.publisher_id).toBeDefined();
    expect(res.body.status).toBe('pending');
    expect(res.body.verification_txt_record).toBeDefined();
  });
});

describe('Citations', () => {
  test('ingests a single citation event', async () => {
    const event = {
      schema_version: '1.0', provider: 'test-provider',
      event_type: 'citation.generated',
      event_id: 'evt_test_001', idempotency_key: 'idem_test_001',
      timestamp: '2026-03-24T09:14:00Z',
      citation: { url: 'https://test-pub.com/article', citation_type: 'factual_source',
                  query_category_l1: 'technology', model: 'test-model', user_country: 'US' },
      attribution: { display_type: 'inline_link', user_interface: 'chat' },
    };
    const res = await request(app).post('/v1/citations/ingest').send(event);
    expect([200, 202]).toContain(res.status);
  });

  test('returns 400 if from/to missing in summary', async () => {
    const res = await request(app).get('/v1/citations/summary');
    expect(res.status).toBe(400);
  });
});
