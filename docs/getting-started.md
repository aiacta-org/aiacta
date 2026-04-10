# Getting Started with AIACTA

## For Publishers

### 1. Create your `ai-attribution.txt`

Place it at `https://yourdomain.com/.well-known/ai-attribution.txt`:

```
Schema-Version: 1.0
Contact: licensing@yourdomain.com
Preferred-Attribution: Your Site Name (yourdomain.com)
Allow-Purpose: rag
Allow-Purpose: index
Disallow-Purpose: training
Require-Citation: true
Require-Source-Link: true
Citation-Webhook: https://yourdomain.com/webhooks/ai-citations
Reward-Tier: standard
Content-License: CC-BY-SA-4.0
```

### 2. Validate it

```bash
npx @aiacta-org/ai-attribution-lint https://yourdomain.com
```

> You must install first, type 'y' + enter.

### 3. Set up your webhook receiver

```bash
npm install ai-citation-sdk
```

```js
const { createExpressMiddleware } = require('ai-citation-sdk');
app.use(express.raw({ type: 'application/json' }));
app.post('/webhooks/ai-citations', createExpressMiddleware({
  secret: process.env.AIACTA_WEBHOOK_SECRET,
  store:  myIdempotencyStore,
  onEvent: async (event) => {
    console.log('Citation from', event.provider, ':', event.citation.url);
  },
}));
```

### 4. Query crawl manifests

```js
const { CrawlManifestClient } = require('crawl-manifest-client');
const client = new CrawlManifestClient({ provider: 'anthropic', apiKey: process.env.CRAWL_API_KEY });
for await (const url of client.fetchAll({ domain: 'yourdomain.com', from: '2026-01-01T00:00:00Z', to: '2026-04-01T00:00:00Z' })) {
  console.log(url.url, url.purpose, url.crawl_count_30d);
}
```

---

## For AI Providers

See the [Compliance Tiers](./compliance-tiers.md) document for implementation requirements.

Start with **Tier Bronze** (referrer headers + ai-attribution.txt parsing) — it takes a single sprint.
