/**
 * Mock AI provider server for the AIACTA test harness.
 *
 * Implements all provider-side endpoints from the whitepaper:
 *  GET  /crawl-manifest/v1   — Crawl Manifest API (§2.2)
 *  POST /citations/dispatch  — Fires citation webhook to publisher (§3.4)
 *  GET  /citations/v1        — Pull API for publishers (§3.7)
 *  GET  /health
 *
 * Rate limits are simulated: X-RateLimit-Remaining starts at 59 (of 60/hour).
 */
'use strict';
const http   = require('http');
const crypto = require('crypto');
const { URL } = require('url');

const SECRET       = process.env.WEBHOOK_HMAC_SECRET || 'test-secret-do-not-use-in-prod';
const PUBLISHER_URL= process.env.PUBLISHER_URL       || 'http://localhost:8081';

// ── Fixtures ──────────────────────────────────────────────────────────────
const CRAWL_MANIFEST = {
  provider: 'mock-provider', domain: 'example.com', schema_version: '1.0',
  period: { from: '2026-01-01T00:00:00Z', to: '2026-03-24T00:00:00Z' },
  total_crawled_urls: 3, next_cursor: null,
  urls: [
    { url: 'https://example.com/articles/how-transformers-work',
      last_crawled: '2026-03-10T14:22:05Z', crawl_count_30d: 3,
      purpose: ['rag'], http_status_at_crawl: 200, content_hash: 'sha256:4f7e3abc11223344' },
    { url: 'https://example.com/articles/gradient-descent',
      last_crawled: '2026-03-15T09:00:00Z', crawl_count_30d: 1,
      purpose: ['training'], http_status_at_crawl: 200, content_hash: 'sha256:9a1b2c3d44556677' },
    { url: 'https://example.com/about',
      last_crawled: '2026-02-01T00:00:00Z', crawl_count_30d: 0,
      purpose: ['index'], http_status_at_crawl: 200, content_hash: 'sha256:deadbeefcafebabe' },
  ],
};

const SAMPLE_CITATION_EVENT = {
  schema_version: '1.0', provider: 'mock-provider',
  event_type: 'citation.generated',
  event_id: 'evt_01TEST000000000000000000',
  idempotency_key: 'idem_01TEST_fixture',
  timestamp: new Date(Math.floor(Date.now() / 60000) * 60000).toISOString().replace(/\.\d{3}Z$/, ':00Z'), // minute precision §3.2
  citation: {
    url: 'https://example.com/articles/how-transformers-work',
    citation_type: 'factual_source',
    context_summary: 'Used to answer question about self-attention mechanism',
    query_category_l1: 'technology', query_category_l2: 'machine_learning',
    model: 'mock-model-v1', response_locale: 'en-US', user_country: 'US',
  },
  attribution: { display_type: 'inline_link', user_interface: 'chat' },
};

// Stored citation events for the pull API (§3.7)
const citationStore = [SAMPLE_CITATION_EVENT];

// ── Helpers ───────────────────────────────────────────────────────────────
function readBody(req) {
  return new Promise(resolve => {
    let data = '';
    req.on('data', c => data += c);
    req.on('end', () => resolve(data));
  });
}

function json(res, statusCode, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'X-AIACTA-Version': '1.0',
    'X-RateLimit-Remaining': '59',
    'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600),
  });
  res.end(body);
}

async function dispatchWebhook(url, event) {
  const payload   = JSON.stringify(event);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const sig = 'sha256=' + crypto.createHmac('sha256', SECRET).update(`${timestamp}.${payload}`).digest('hex');
  return new Promise((resolve, reject) => {
    const u   = new URL(url);
    const req = http.request({
      hostname: u.hostname, port: u.port || 80, path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'X-AIACTA-Webhook-Signature': sig,
        'X-AIACTA-Webhook-Timestamp': timestamp,
      },
    }, res => { res.resume(); res.on('end', resolve); });
    req.setTimeout(10_000, () => reject(new Error('Publisher webhook timeout (§3.5: 10s limit)')));
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── Route handlers ────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // GET /crawl-manifest/v1  — §2.2
  if (req.method === 'GET' && url.pathname === '/crawl-manifest/v1') {
    const domain  = url.searchParams.get('domain');
    const from    = url.searchParams.get('from');
    const to      = url.searchParams.get('to');
    const purpose = url.searchParams.get('purpose')?.split(',');

    if (!domain || !from || !to) {
      return json(res, 400, { error: 'domain, from, and to are required' });
    }
    // Enforce 90-day range limit (§2.2)
    const rangeDays = (new Date(to) - new Date(from)) / 86400_000;
    if (rangeDays > 90) {
      return json(res, 400, { error: 'Date range exceeds 90-day maximum (§2.2)' });
    }

    let filtered = { ...CRAWL_MANIFEST, domain };
    if (purpose) {
      filtered.urls = CRAWL_MANIFEST.urls.filter(u => u.purpose.some(p => purpose.includes(p)));
      filtered.total_crawled_urls = filtered.urls.length;
    }
    return json(res, 200, filtered);
  }

  // POST /citations/dispatch  — fire webhook to publisher (test helper)
  if (req.method === 'POST' && url.pathname === '/citations/dispatch') {
    const body  = await readBody(req);
    const event = body ? { ...SAMPLE_CITATION_EVENT, ...JSON.parse(body) } : SAMPLE_CITATION_EVENT;
    const dest  = `${PUBLISHER_URL}/webhooks/ai-citations`;
    citationStore.push(event);
    try {
      await dispatchWebhook(dest, event);
      return json(res, 202, { status: 'dispatched', event_id: event.event_id });
    } catch (e) {
      return json(res, 502, { error: `Failed to dispatch to publisher: ${e.message}` });
    }
  }

  // GET /citations/v1  — Pull API §3.7
  if (req.method === 'GET' && url.pathname === '/citations/v1') {
    const domain = url.searchParams.get('domain');
    const since  = url.searchParams.get('since');
    const cursor = url.searchParams.get('cursor');
    const limit  = Math.min(parseInt(url.searchParams.get('limit') || '1000', 10), 1000);

    if (!domain) return json(res, 400, { error: 'domain is required' });

    let events = citationStore
      .filter(e => !since || e.timestamp >= since)
      .filter(e => e.citation.url.includes(domain));

    let startIdx = 0;
    if (cursor) {
      const idx = events.findIndex(e => e.event_id === cursor);
      if (idx !== -1) startIdx = idx + 1;
    }

    const page   = events.slice(startIdx, startIdx + limit);
    const hasMore= startIdx + limit < events.length;

    return json(res, 200, {
      schema_version: '1.0',
      domain,
      events: page,
      next_cursor: hasMore ? page[page.length - 1].event_id : null,
      count: page.length,
      retention_note: 'Events retained for 90 days (standard) or 365 days (enterprise tier) per §3.7',
    });
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    return json(res, 200, { status: 'ok', proposals_implemented: ['1', '2', '3'] });
  }

  json(res, 404, { error: 'Not found' });
});

server.listen(3000, () => console.log('[mock-provider] Listening on :3000'));
module.exports = server; // for testing
