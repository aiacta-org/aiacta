const axios = require('axios');
const PROVIDER_URL = process.env.PROVIDER_URL || 'http://localhost:8082';
test('crawl manifest returns correct schema', async () => {
  const res = await axios.get(`${PROVIDER_URL}/crawl-manifest/v1`, {
    params: { domain: 'example.com', from: '2026-01-01T00:00:00Z', to: '2026-03-24T00:00:00Z' },
    headers: { Authorization: 'Bearer test-key' },
  });
  expect(res.status).toBe(200);
  expect(res.data.schema_version).toBe('1.0');
  expect(Array.isArray(res.data.urls)).toBe(true);
  expect(res.headers['x-ratelimit-remaining']).toBeDefined();
});
