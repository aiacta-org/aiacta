# attribution-test-harness

> Docker sandbox for end-to-end testing of all four AIACTA technical proposals against a simulated publisher and AI provider ecosystem (§12.1).

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../../LICENSE)

---

## What is this?

A self-contained Docker environment that spins up a mock AI provider and mock publisher, then runs automated tests verifying each AIACTA proposal works end-to-end. Use it to:

- **Test your implementation** before integrating with real AI providers
- **Validate AI provider compliance** before going live
- **Run integration tests** during development

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

---

## Quick Start

```bash
cd packages/attribution-test-harness

# Start mock provider + publisher
docker compose up --build

# In another terminal — trigger a test citation event:
curl -X POST http://localhost:8082/citations/dispatch

# Verify the publisher received it:
curl http://localhost:8081/received-events
```

---

## Services

| Service | Port | Description |
|---------|------|-------------|
| Mock Provider | 8082 | Simulates an AI company API (Crawl Manifest + Webhook dispatch) |
| Mock Publisher | 8081 | Test webhook receiver that logs incoming citation events |

---

## Mock Provider endpoints

```
GET  /crawl-manifest/v1?domain=&from=&to=
  Returns sample crawl history for example.com

POST /citations/dispatch
  Fires a signed citation webhook to the mock publisher

GET  /citations/v1?domain=&since=
  Pull API with stored citation events

GET  /health
```

---

## Run automated E2E tests

```bash
# With containers running:
npm run test:e2e
```

Four test suites — one per proposal:

| Suite | Tests |
|-------|-------|
| `proposal1-crawl-manifest.test.js` | Crawl Manifest API (§2.2) — range limits, pagination, purpose filtering |
| `proposal2-citation-webhook.test.js` | Citation Webhooks (§3.4) — signature verification, idempotency, retry |
| `proposal3-referrer-headers.test.js` | Referrer Headers (§4) — policy enforcement, UTM opt-in |
| `proposal4-linter.test.js` | ai-attribution.txt (§5) — parsing, field validation, robots.txt conflict |

---

## Test against your own AI provider implementation

```bash
PROVIDER_URL=https://your-api.yourcompany.com npm run test:e2e
```

The test suite will run the same scenario tests against your live API.

---

## Environment Variables

See `.env.example`:

```
PROVIDER_URL=http://localhost:8082
PUBLISHER_URL=http://localhost:8081
WEBHOOK_HMAC_SECRET=test-secret-do-not-use-in-prod
```

**Never use these secrets outside of local testing.**

---

## License & Copyright

Copyright © 2026 Eric Michel, PhD. Licensed under the [Apache License 2.0](../../LICENSE).

Part of the [AIACTA open standard](https://github.com/aiacta-org/aiacta).
