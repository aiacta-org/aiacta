const nock = require('nock');
const { CrawlManifestClient } = require('../src/node/index');

const BASE = 'https://api.testprovider.com';
const FIXTURE = {
  provider: 'testprovider', domain: 'example.com', schema_version: '1.0',
  period: { from: '2026-01-01T00:00:00Z', to: '2026-03-01T00:00:00Z' },
  total_crawled_urls: 1, next_cursor: null,
  urls: [{ url: 'https://example.com/article', last_crawled: '2026-02-01T00:00:00Z',
           crawl_count_30d: 2, purpose: ['rag'], http_status_at_crawl: 200,
           content_hash: 'sha256:abc123' }],
};

test('fetches a single page and yields URLs', async () => {
  nock(BASE).get('/crawl-manifest/v1').query(true).reply(200, FIXTURE);
  const client = new CrawlManifestClient({ provider: 'testprovider', apiKey: 'key', baseUrl: `${BASE}/crawl-manifest/v1` });
  const results = [];
  for await (const url of client.fetchAll({ domain: 'example.com', from: '2026-01-01T00:00:00Z', to: '2026-03-01T00:00:00Z' })) {
    results.push(url);
  }
  expect(results).toHaveLength(1);
  expect(results[0].url).toBe('https://example.com/article');
});
