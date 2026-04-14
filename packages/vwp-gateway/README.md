# vwp-gateway

> Verifiable Webhook Protocol (VWP) gateway — validates, signs, and routes citation events from AI providers to publishers (§3.4A–D).

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../../LICENSE)
[![AIACTA Spec](https://img.shields.io/badge/spec-AIACTA%2F1.0-orange.svg)](../../docs/proposals/proposal-2-citation-webhooks.md)

---

## What is this?

The VWP Gateway sits between AI providers and publishers. It receives citation events from AI companies, validates them through a multi-step security pipeline, and forwards verified events to each publisher's webhook endpoint.

**Security pipeline (in order):**
1. Provider identity verification — HMAC-SHA256 or Ed25519 signature check
2. Replay attack prevention — timestamp within ±5 minutes
3. Proof-of-Inference check — spot-audit that the citation is genuine
4. Anti-Sybil velocity throttle — rate-limits citations per domain
5. Fraud pattern scan — detects citation rings (async)
6. Forward to publisher — signs the event and delivers it

---

## Quick Start

```bash
cd packages/vwp-gateway
cp .env.example .env
# Edit .env — at minimum set AIACTA_SIGNING_SECRET
npm start
```

Gateway starts at **http://localhost:3200**.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Port (default: `3200`) |
| `AIACTA_SIGNING_SECRET` | HMAC secret for signing events forwarded to publishers |
| `AAC_SERVER_URL` | AAC server URL (default: `http://localhost:3100`) |
| `SIGNING_KEY_ANTHROPIC` | HMAC key for verifying events from Anthropic |
| `SIGNING_KEY_OPENAI` | HMAC key for verifying events from OpenAI |
| `SIGNING_KEY_GOOGLE` | HMAC key for verifying events from Google |
| `SIGNING_KEY_XAI` | HMAC key for verifying events from xAI |
| `SIGNING_KEY_PERPLEXITY` | HMAC key for verifying events from Perplexity |
| `SIGNING_KEY_MICROSOFT` | HMAC key for verifying events from Microsoft |
| `SIGNING_KEY_META` | HMAC key for verifying events from Meta |


---

## API

```
POST /gateway/dispatch
  Headers required:
    X-AIACTA-Provider:  openai
    X-AIACTA-Timestamp: 1711234567
    X-AIACTA-Signature: sha256=<hex>   (or ed25519=<hex>)
  Body: CitationEvent JSON

  Response 202: { "status": "dispatched" }
  Response 401: { "error": "Provider signature invalid" }
  Response 422: { "error": "PoI check failed: ..." }

GET /health
  Returns: { "status": "ok" }
```

---

## Signature formats supported

**HMAC-SHA256** (standard, symmetric):
```
X-AIACTA-Signature: sha256=<64 hex chars>
```

**Ed25519** (asymmetric — provider holds private key):
```
X-AIACTA-Signature: ed25519=<128 hex chars>
```

---

## Known limitations (v1.0)

- Rate limiting is in-memory — for multi-server deployments, replace with Redis
- Proof-of-Inference is a stub that always passes — full implementation in v1.1

---

## License & Copyright

Copyright © 2026 Eric Michel, PhD. Licensed under the [Apache License 2.0](../../LICENSE).

Part of the [AIACTA open standard](https://github.com/aiacta-org/aiacta).
