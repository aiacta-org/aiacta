# aac-server

> Reference server for the AI Attribution Collective (AAC) — manages provider and publisher enrollment, the citation event ledger, distribution weight calculation, and payout scheduling (§7.3–7.5).

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../../LICENSE)
[![AIACTA Spec](https://img.shields.io/badge/spec-AIACTA%2F1.0-orange.svg)](../../docs/proposals/proposal-5-reward-framework.md)

> **Note:** This is the reference implementation. It uses SQLite for simplicity. For production AAC deployments, swap for PostgreSQL (see [Production Setup](#production-setup)).

---

## What is this?

The AAC server is the economic backbone of the AIACTA framework — what the AI Attribution Collective runs as its core API. It handles:

- **Provider enrollment** — AI companies register their contribution mode (per-citation fees or revenue-proportional)
- **Publisher enrollment** — Content creators register and verify their domain via DNS TXT record
- **Citation ingestion** — Receives events from the VWP Gateway and classifies them as content-dependent or logical-utility
- **Distribution calculation** — Runs the §7.5 weighted formula: citation count × licence multiplier × query value weight × freshness bonus
- **Fraud detection** — Velocity throttling and citation ring detection
- **Provenance API** — Law enforcement and fact-checker audit trail queries (§9.5.1)

---

## Quick Start (development)

```bash
cd packages/aac-server
cp .env.example .env
npm install
npm start
```

Server starts at **http://localhost:3100**.

```bash
curl http://localhost:3100/health
# {"status":"ok","version":"1.0.0","spec":"AIACTA/1.0"}
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Port (default: `3100`) |
| `AAC_DB_PATH` | No | SQLite file path (default: `./aac.db`). Use `:memory:` for tests. |
| `PROVENANCE_API_KEY` | **Yes in prod** | Secret key for law enforcement Provenance API access (§9.5.1) |
| `API_JWT_SECRET` | **Yes in prod** | JWT signing secret |

Generate secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## API Endpoints

### Enrollment

```
POST /v1/enrollment/providers
  Register an AI provider.
  Body: { name, contribution_mode: 'pcf'|'rpa', pcf_rate|rpa_rate }

POST /v1/enrollment/publishers
  Register a publisher domain. Returns a DNS TXT record to add for verification.

POST /v1/enrollment/publishers/:domain/verify
  Confirm ownership after adding the DNS TXT record.
```

### Citations

```
POST /v1/citations/ingest
  Ingest a single event or batch (up to 100 events per §3.6).

GET  /v1/citations/summary?from=&to=
  Aggregated citation stats. Content-dependent queries only by default.

GET  /v1/citations/pull?domain=&since=
  Pull API fallback for publishers without a webhook endpoint.
```

### Distribution

```
POST /v1/distribution/calculate
  Preview payout calculation (non-binding).
  Body: { period_from, period_to, pool_balance }

POST /v1/distribution/commit
  Persist and commit a distribution run.

GET  /v1/distribution/:run_id
  Retrieve results of a past run.
```

### Provenance (restricted)

```
POST /v1/provenance/query
  Requires X-AIACTA-Provenance-Key header.

GET  /v1/provenance/audit-trail/*url
  Full citation audit trail for a content URL.
```

---

## Running Tests

```bash
npm test
```

Tests use in-memory SQLite and are fully isolated.

---

## Production Setup

For production AAC operations:

1. Replace SQLite with PostgreSQL (install `pg`, update `src/db/database.js`)
2. Use a dedicated secrets manager for `PROVENANCE_API_KEY` and `API_JWT_SECRET`
3. Run behind a load balancer with HTTPS termination
4. Enable automated hourly database backups

See `docs/for-admins/SOURCE-CODE-MANAGEMENT.md` for the complete production guide.

---

## License & Copyright

Copyright © 2026 Eric Michel, PhD. Licensed under the [Apache License 2.0](../../LICENSE).

Part of the [AIACTA open standard](https://github.com/aiacta-org/aiacta).
