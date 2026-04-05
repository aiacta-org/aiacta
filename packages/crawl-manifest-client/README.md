# crawl-manifest-client

> Query any AIACTA-compliant AI provider's Crawl Manifest API — see exactly which pages of yours were crawled, when, and for what purpose (Proposal 1, §2.2).

[![npm version](https://img.shields.io/npm/v/crawl-manifest-client.svg)](https://www.npmjs.com/package/crawl-manifest-client)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../../LICENSE)
[![AIACTA Spec](https://img.shields.io/badge/spec-AIACTA%2F1.0-orange.svg)](../../docs/proposals/proposal-1-crawl-manifests.md)

Available in **Node.js** and **Python**.

---

## What is this?

The Crawl Manifest API is what AI providers expose so publishers can see their crawl history — the AI equivalent of Google Search Console. This client handles the API query, automatic pagination, rate-limit backoff, and local caching so you get all your data without writing any plumbing.

---

## Install

**Node.js**
```bash
npm install crawl-manifest-client
```

**Python**
```bash
pip install crawl-manifest-client
```

---

## Quick Start

### Node.js

```javascript
const { CrawlManifestClient } = require('crawl-manifest-client');

// Create a client for one AI provider.
// Your API key comes from that provider's Publisher Portal (like Google Search Console).
const client = new CrawlManifestClient({
  provider: 'anthropic',
  apiKey:   process.env.ANTHROPIC_PUBLISHER_KEY,
});

// Fetch all crawl events for your domain in the last 30 days.
// The client automatically handles pagination — you just iterate.
for await (const entry of client.fetchAll({
  domain: 'yourdomain.com',
  from:   '2026-03-01T00:00:00Z',
  to:     '2026-03-31T23:59:59Z',
})) {
  console.log(entry.url);
  console.log('Last crawled:', entry.last_crawled);
  console.log('Purpose:', entry.purpose);        // ['rag', 'index', ...]
  console.log('HTTP status:', entry.http_status_at_crawl);
  console.log('Content hash:', entry.content_hash); // sha256:...
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

## Filtering by purpose

```javascript
// Only see pages that were crawled for AI training (not real-time query answering)
for await (const entry of client.fetchAll({
  domain:  'yourdomain.com',
  from:    '2026-01-01T00:00:00Z',
  to:      '2026-03-31T00:00:00Z',
  purpose: ['training'],  // filter to training crawls only
})) {
  console.log('Trained on:', entry.url);
}
```

Possible purpose values: `training` · `rag` · `index` · `quality-eval`

---

## Each result contains

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | The full URL that was crawled |
| `last_crawled` | ISO 8601 | When it was most recently crawled |
| `crawl_count_30d` | integer | How many times in the last 30 days |
| `purpose` | string[] | What the AI used it for |
| `http_status_at_crawl` | integer | HTTP status the crawler received (200, 404, etc.) |
| `content_hash` | string | SHA-256 of the page content at crawl time — lets you verify the AI received the correct version of your article |

---

## Rate limits & caching

The spec allows 60 API requests per hour per domain (§2.2). The client:
- Warns you when approaching the limit (55+ requests/hour)
- Respects `X-RateLimit-Reset` headers and waits automatically on 429 responses
- Caches responses in memory for 1 hour — repeated queries for the same date range return instantly

---

## Date range limits

The API allows a maximum of **90 days per request**. For longer ranges, split your query:

```javascript
// Query 6 months in two 90-day chunks
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

Requesting more than 90 days throws a `RangeError` immediately, before making any API calls.

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

## Verifying content integrity

The `content_hash` field lets you verify the AI provider crawled the correct version of your page:

```javascript
const { computeContentHash } = require('crawl-manifest-client/src/node/content-hash');
const fs = require('fs');

const yourPageHtml = fs.readFileSync('./your-article.html', 'utf-8');
const yourHash     = computeContentHash(yourPageHtml);

for await (const entry of client.fetchAll({ domain: 'yourdomain.com', from, to })) {
  if (entry.content_hash !== yourHash) {
    console.warn('Content mismatch — AI may have crawled an older version of', entry.url);
  }
}
```

---

## Related packages

| Package | Purpose |
|---------|---------|
| [`ai-attribution-lint`](../ai-attribution-lint) | Validate your `ai-attribution.txt` |
| [`ai-citation-sdk`](../ai-citation-sdk) | Receive citation webhook events |

---

## License & Copyright

Copyright © 2026 Eric Michel, PhD. Licensed under the [Apache License 2.0](../../LICENSE).

Part of the [AIACTA open standard](https://github.com/aiacta-org/aiacta).
