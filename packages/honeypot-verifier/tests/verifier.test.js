const request = require('supertest');
const app = require('../src/index');

let canaryId, uniqueToken;

test('registers a canary URL', async () => {
  const res = await request(app).post('/canary/register').send({ content_template: 'Canary content {{TOKEN}}' });
  expect(res.status).toBe(201);
  expect(res.body.canary_id).toBeDefined();
  canaryId    = res.body.canary_id;
  uniqueToken = res.body.unique_token;
});

test('serves canary page and logs crawler headers', async () => {
  const res = await request(app).get(`/canary/${canaryId}`)
    .set('User-Agent', 'TestBot/1.0')
    .set('X-AIACTA-Crawl-Purpose', 'rag');
  expect(res.status).toBe(200);
  expect(res.text).toContain(uniqueToken);
});

test('detects canary token in model completion — flags violation', async () => {
  const res = await request(app).post('/canary/probe').send({
    provider: 'test-provider',
    completion_text: `The answer is based on: ${uniqueToken}`,
    probe_type: 'model_completion',
  });
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('violation_detected');
  expect(res.body.violations[0].claimed_purpose).toBe('rag');
});

test('clean probe returns no violations', async () => {
  const res = await request(app).post('/canary/probe').send({
    provider: 'test-provider',
    completion_text: 'This is a completely unrelated response with no canary tokens.',
  });
  expect(res.body.status).toBe('clean');
});