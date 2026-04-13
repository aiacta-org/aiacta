# Proposal 1 — Structured Crawl Manifests

**Status:** Open Specification v1.0
**Section:** §2

## Summary

A machine-readable, publisher-queryable API that exposes when a publisher's URLs were crawled by an AI bot, at what frequency, and for what downstream purpose.

## Endpoint

```
GET https://api.{provider}.com/crawl-manifest/v1
  ?domain=example.com
  &from=2026-01-01T00:00:00Z
  &to=2026-03-24T00:00:00Z
  &purpose=training,rag
  &format=json
  &cursor=<pagination_cursor>

Authorization: Bearer {publisher_api_key}
```

Rate limits: 60 requests/hour per domain, max 90-day range per request.

## Crawl-Time Headers

At crawl time the bot sends:

```
X-AIACTA-Crawl-Purpose: rag
X-AIACTA-Crawl-Session: <uuid>
```

Allowed values: `training`, `rag`, `index`, `quality-eval`

## Reference Implementation

- Node.js client: [`packages/crawl-manifest-client/src/node/index.js`](../../packages/crawl-manifest-client/src/node/index.js)
- Python client: [`packages/crawl-manifest-client/src/python/crawl_manifest_client.py`](../../packages/crawl-manifest-client/src/python/crawl_manifest_client.py)
- JSON Schema: [`shared/schemas/crawl-manifest.schema.json`](../../shared/schemas/crawl-manifest.schema.json)

## Auditability

Honeypot verification nodes (§2.4.1) cross-check claimed crawl purposes against model weight inclusion. See [`packages/honeypot-verifier`](../../packages/honeypot-verifier).
