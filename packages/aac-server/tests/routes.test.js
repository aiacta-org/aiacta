/**
 * AAC Server route tests.
 * better-sqlite3 uses an in-memory DB (:memory:) during tests via AAC_DB_PATH env.
 */
process.env.AAC_DB_PATH        = ':memory:';
process.env.PROVENANCE_API_KEY = 'test-provenance-key';
// Set the API key so requireApiKey middleware passes in tests.
// Name matches whatever env var apiKey.js reads — update if you renamed it.
process.env.AIACTA_API_KEY     = 'test-api-key';

const request = require('supertest');
const { app, initDb } = require('../src/index');

// Attach the API key header to any request that hits a protected route.
// Uses X-AIACTA-API-Key — the renamed header from X-AAC-API-Key.
function withApiKey(req) {
  return req.set('X-AIACTA-API-Key', process.env.AIACTA_API_KEY);
}

beforeAll(() => { initDb(); });

describe('Health', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.spec).toBe('AIACTA/1.0');
  });
});

describe('Auth middleware', () => {
  test('enrollment requires X-AIACTA-API-Key header', async () => {
    const res = await request(app)
      .post('/v1/enrollment/providers')
      .send({ name: 'Unauthed', contribution_mode: 'pcf', pcf_rate: 0.001 });
    expect([401, 503]).toContain(res.status);
  });
});

describe('Enrollment — providers', () => {
  test('creates a provider with PCF contribution mode', async () => {
    const res = await withApiKey(request(app)
      .post('/v1/enrollment/providers'))
      .send({ name: 'Test Provider', contribution_mode: 'pcf', pcf_rate: 0.001 });
    expect([200, 201]).toContain(res.status);
    expect(res.body.provider_id).toBeDefined();
    expect(res.body.status).toBe('active');
  });

  test('creates a provider with RPA contribution mode', async () => {
    const res = await withApiKey(request(app)
      .post('/v1/enrollment/providers'))
      .send({ name: 'RPA Provider', contribution_mode: 'rpa', rpa_rate: 0.01 });
    expect([200, 201]).toContain(res.status);
  });

  test('rejects invalid contribution_mode', async () => {
    const res = await withApiKey(request(app)
      .post('/v1/enrollment/providers'))
      .send({ name: 'Bad', contribution_mode: 'invalid' });
    expect(res.status).toBe(400);
  });

  test('requires name field', async () => {
    const res = await withApiKey(request(app)
      .post('/v1/enrollment/providers'))
      .send({ contribution_mode: 'pcf' });
    expect(res.status).toBe(400);
  });
});

describe('Enrollment — publishers', () => {
  test('creates a publisher', async () => {
    const res = await withApiKey(request(app)
      .post('/v1/enrollment/publishers'))
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
    expect(res.body.accepted).toBe(1);
    expect(res.body.duplicates).toBe(0);
    expect(res.body.total_received).toBe(1);
  });

  test('returns 400 if from/to missing in summary', async () => {
    const res = await request(app).get('/v1/citations/summary');
    expect(res.status).toBe(400);
  });

  test('reports duplicate ingests honestly', async () => {
    const event = {
      schema_version: '1.0',
      provider: 'test-provider',
      event_type: 'citation.generated',
      event_id: 'evt_duplicate_001',
      idempotency_key: 'idem_duplicate_001',
      timestamp: '2026-03-24T09:14:00Z',
      citation: {
        url: 'https://test-pub.com/duplicate',
        citation_type: 'factual_source',
        query_category_l1: 'technology',
      },
    };

    const first  = await request(app).post('/v1/citations/ingest').send(event);
    const second = await request(app).post('/v1/citations/ingest').send(event);

    expect(first.status).toBe(202);
    expect(first.body.accepted).toBe(1);
    expect(first.body.duplicates).toBe(0);
    expect(first.body.total_received).toBe(1);
    expect(first.body.classifications[0].status).toBe('inserted');

    expect(second.status).toBe(202);
    expect(second.body.accepted).toBe(0);
    expect(second.body.duplicates).toBe(1);
    expect(second.body.total_received).toBe(1);
    expect(second.body.classifications[0].status).toBe('duplicate');
  });

  test('pull API applies since filtering', async () => {
    // Enrollment requires auth — use withApiKey()
    await withApiKey(request(app)
      .post('/v1/enrollment/publishers'))
      .send({ domain: 'since-filter.com', reward_tier: 'standard' });

    const oldEvent = {
      schema_version: '1.0',
      provider: 'test-provider',
      event_type: 'citation.generated',
      event_id: 'evt_since_old',
      idempotency_key: 'idem_since_old',
      timestamp: '2026-03-10T00:00:00Z',
      citation: {
        url: 'https://since-filter.com/old',
        citation_type: 'factual_source',
        query_category_l1: 'technology',
      },
    };
    const newEvent = {
      schema_version: '1.0',
      provider: 'test-provider',
      event_type: 'citation.generated',
      event_id: 'evt_since_new',
      idempotency_key: 'idem_since_new',
      timestamp: '2026-03-25T00:00:00Z',
      citation: {
        url: 'https://since-filter.com/new',
        citation_type: 'factual_source',
        query_category_l1: 'technology',
      },
    };

    await request(app).post('/v1/citations/ingest').send(oldEvent);
    await request(app).post('/v1/citations/ingest').send(newEvent);

    const res = await request(app)
      .get('/v1/citations/pull')
      .query({ domain: 'since-filter.com', since: '2026-03-20T00:00:00Z' });

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.events[0].idempotency_key).toBe('idem_since_new');
  });
});

describe('Provenance', () => {
  test('query returns stored event rows using valid schema columns', async () => {
    const event = {
      schema_version: '1.0',
      provider: 'test-provider',
      event_type: 'citation.generated',
      event_id: 'evt_prov_001',
      idempotency_key: 'poi_lookup_key_001',
      timestamp: '2026-03-26T09:14:00Z',
      citation: {
        url: 'https://test-pub.com/provenance',
        citation_type: 'factual_source',
        query_category_l1: 'technology',
        model: 'test-model',
      },
    };

    await request(app).post('/v1/citations/ingest').send(event);

    const res = await request(app)
      .post('/v1/provenance/query')
      .set('X-AIACTA-Provenance-Key', process.env.PROVENANCE_API_KEY)
      .send({ poi_token: 'poi_lookup_key_001' });

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.matched_events[0].id).toBeDefined();
    expect(res.body.matched_events[0].idempotency_key).toBe('poi_lookup_key_001');
  });

  test('audit trail includes idempotency_key for event correlation', async () => {
    const event = {
      schema_version: '1.0',
      provider: 'test-provider',
      event_type: 'citation.generated',
      event_id: 'evt_prov_002',
      idempotency_key: 'audit_lookup_key_001',
      timestamp: '2026-03-27T09:14:00Z',
      citation: {
        url: 'https://test-pub.com/audit-trail',
        citation_type: 'factual_source',
        query_category_l1: 'technology',
        model: 'test-model',
      },
    };

    await request(app).post('/v1/citations/ingest').send(event);

    const encodedUrl = encodeURIComponent('https://test-pub.com/audit-trail');
    const res = await request(app)
      .get(`/v1/provenance/audit-trail/${encodedUrl}`)
      .set('X-AIACTA-Provenance-Key', process.env.PROVENANCE_API_KEY);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.audit_trail[0].id).toBeDefined();
    expect(res.body.audit_trail[0].idempotency_key).toBe('audit_lookup_key_001');
  });
});