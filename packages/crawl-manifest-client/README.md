# @aiacta-org/crawl-manifest-client

> Query any AIACTA-compliant AI provider's Crawl Manifest API — see exactly which of your pages were crawled, when, and for what purpose (Proposal 1, §2.2).

[![npm version](https://img.shields.io/npm/v/@aiacta-org/crawl-manifest-client.svg)](https://www.npmjs.com/package/@aiacta-org/crawl-manifest-client)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../../LICENSE)
[![AIACTA Spec](https://img.shields.io/badge/spec-AIACTA%2F1.0-orange.svg)](../../docs/proposals/proposal-1-crawl-manifests.md)

Available in **Node.js** and **Python**.

---

## What is this?

The Crawl Manifest API is what AI providers expose so publishers can audit their crawl history — the AI equivalent of Google Search Console. This client handles the API query, automatic pagination, rate-limit backoff, and local caching.

---

## Install

**Node.js**
```bash
npm install @aiacta-org/crawl-manifest-client
```

**Python**
```bash
pip install crawl-manifest-client
```

---

## Quick Start

### Node.js

```javascript
const { CrawlManifestClient } = require('@aiacta-org/crawl-manifest-client');

const client = new CrawlManifestClient({
  provider: 'anthropic',
  apiKey:   process.env.ANTHROPIC_PUBLISHER_KEY,
});

// Fetch all crawl events for your domain — pagination handled automatically
for await (const entry of client.fetchAll({
  domain: 'yourdomain.com',
  from:   '2026-03-01T00:00:00Z',
  to:     '2026-03-31T23:59:59Z',
})) {
  console.log(entry.url);
  console.log('Last crawled:', entry.last_crawled);
  console.log('Purpose:',     entry.purpose);           // ['rag', 'index', ...]
  console.log('HTTP status:', entry.http_status_at_crawl);
  console.log('Content hash:', entry.content_hash);     // sha256:...
}
```

### Python

```python
from crawl_manifest_client import CrawlManifestClient

client = CrawlManifestClient(
    provider='anthropic',
    api_key=os.environ['ANTHROPIC_PUBLISHER_KEY']
)

for entry in client.fetch_all(
    domain='yourdomain.com',
    from_date='2026-03-01T00:00:00Z',
    to_date='2026-03-31T23:59:59Z'
):
    print(entry['url'], entry['purpose'])
```

---

## Filter by purpose

```javascript
// See only pages crawled for model training
for await (const entry of client.fetchAll({
  domain:  'yourdomain.com',
  from:    '2026-01-01T00:00:00Z',
  to:      '2026-03-31T00:00:00Z',
  purpose: ['training'],
})) {
  console.log('Trained on:', entry.url);
}
```

Valid purpose values: `training` · `rag` · `index` · `quality-eval`

---

## Each result contains

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | The full URL that was crawled |
| `last_crawled` | ISO 8601 | When most recently crawled |
| `crawl_count_30d` | integer | How many times in the last 30 days |
| `purpose` | string[] | What the AI used the content for |
| `http_status_at_crawl` | integer | HTTP status received (200, 404, etc.) |
| `content_hash` | string | SHA-256 of the page content at crawl time |

---

## Date range limits

The API allows a maximum of **90 days per request** (§2.2). For longer periods, split your query:

```javascript
// Query 6 months across two requests
const ranges = [
  { from: '2025-10-01T00:00:00Z', to: '2025-12-30T00:00:00Z' },
  { from: '2026-01-01T00:00:00Z', to: '2026-03-31T00:00:00Z' },
];
for (const range of ranges) {
  for await (const entry of client.fetchAll({ domain: 'yourdomain.com', ...range })) {
    // process entry
  }
}
```

Requesting more than 90 days throws a `RangeError` before making any API calls.

---

## Rate limits & caching

- The spec allows 60 requests/hour per domain (§2.2)
- The client warns when you approach the limit
- Automatically waits on `429` responses, respecting `X-RateLimit-Reset`
- Caches responses in memory for 1 hour — repeated queries return instantly

---

## API Reference

### `new CrawlManifestClient({ provider, apiKey, baseUrl? })`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `provider` | string | Yes | Provider identifier, e.g. `'anthropic'`, `'openai'`, `'google'` |
| `apiKey` | string | Yes | Bearer token from the provider's Publisher Portal |
| `baseUrl` | string | No | Override the API base URL (for testing) |

### `client.fetchAll({ domain, from, to, purpose? })`

Returns an async generator yielding `CrawlManifestUrl` objects. Handles all pagination automatically.

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `domain` | string | Yes | Your domain, e.g. `'yourdomain.com'` |
| `from` | ISO 8601 | Yes | Start of query window |
| `to` | ISO 8601 | Yes | End of query window (max 90 days from `from`) |
| `purpose` | string[] | No | Filter to specific purpose values |

---

## Verify content integrity

```javascript
const { computeContentHash } = require('@aiacta-org/crawl-manifest-client/src/node/content-hash');

const yourPageHtml = fs.readFileSync('./article.html', 'utf-8');
const yourHash     = computeContentHash(yourPageHtml);

for await (const entry of client.fetchAll({ domain: 'yourdomain.com', from, to })) {
  if (entry.content_hash !== yourHash) {
    console.warn('Content mismatch on', entry.url, '— AI may have crawled an older version');
  }
}
```

---

## Related packages

| Package | Purpose |
|---------|---------|
| [`@aiacta-org/ai-attribution-lint`](https://www.npmjs.com/package/@aiacta-org/ai-attribution-lint) | Validate your `ai-attribution.txt` |
| [`@aiacta-org/ai-citation-sdk`](https://www.npmjs.com/package/@aiacta-org/ai-citation-sdk) | Receive citation webhook events |

---

## License & Copyright

Copyright © 2026 Eric Michel, PhD. Licensed under the [Apache License 2.0](../../LICENSE).

Part of the [AIACTA open standard](https://github.com/aiacta-org/aiacta).
