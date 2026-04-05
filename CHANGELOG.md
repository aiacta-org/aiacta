# Changelog

All notable changes to the AIACTA reference implementation are documented here.

Every time you merge something to main, the release-please workflow reads your commit messages and opens (or updates) a "Release PR" automatically. The PR contains the updated CHANGELOG.md and bumped version numbers. When you're ready to release, merge that PR. It creates the git tag, which triggers your existing release.yml, which publishes to npm and PyPI.
Commit message format matters. See CONTRIBUTING.md(§5.2) for details.


---

## [1.0.1] — 2026-04-04

### Added
- Complete reference implementation of all five AIACTA proposals
- ai-attribution-lint CLI validator (§5.7)
- ai-citation-sdk for Node.js, Python, and Go (§3.4)
- crawl-manifest-client for Node.js and Python (§2.2)
- AAC reference server with SQLite (§7.3–7.5)
- VWP gateway with HMAC and Ed25519 signature verification (§3.4A–D)
- Honeypot verification node (§2.4.1)
- Referrer-Policy middleware for Node.js and Python (§4.2–4.4)
- Attribution test harness with Docker (§12.1)
- Complete specification documents for all five proposals
- Implementation guide for AI providers
- Creator guide for publishers
- AAC governance documentation
- GitHub Actions CI/CD pipeline
- Security policy


---

## [1.0.0] — 2026-03-29

### Added

**Core packages (§12.1)**

- `ai-attribution-lint` — CLI validator for `ai-attribution.txt` files.
  Validates field syntax, SPDX licence IDs, webhook reachability, robots.txt
  conflicts, purpose enum values, and reward tier values.
- `ai-citation-sdk` — Webhook receiver SDK in Node.js, Python, and Go.
  HMAC-SHA256 signature verification, idempotency handling, 6-attempt retry
  schedule, and Express middleware.
- `crawl-manifest-client` — Pull client for the Crawl Manifest API (§2.2)
  in Node.js and Python. Cursor pagination, 90-day range validation, rate-limit
  backoff, and in-memory caching.
- `aac-dashboard-lite` — Self-hosted React analytics dashboard. Aggregates
  citation events from multiple AI providers; visualises distribution weights
  per §7.5 formula.
- `attribution-test-harness` — Docker sandbox with a mock AI provider server,
  publisher fixtures, and E2E scenario tests for all four technical proposals.

**Additional packages**

- `aac-server` — AAC Reference Server with provider/publisher enrollment,
  citation ingestion, distribution engine, query classifier, velocity
  throttling, FPA fraud detection engine, and Provenance Query API (§9.5.1).
- `vwp-gateway` — Verifiable Webhook Protocol gateway (§3.4A-D): Ed25519 +
  HMAC-SHA256 provider verification, Proof-of-Inference spot-audit,
  anti-Sybil velocity throttle, and webhook forwarder.
- `referrer-middleware` — Express and WSGI middleware enforcing
  `Referrer-Policy: origin` and opt-in UTM parameter appending (§4.2-4.4).
- `honeypot-verifier` — Verification Node server (§2.4.1): canary URL
  registration, crawler header logging, and model completion probing to
  detect crawl-purpose misreporting.

**Shared**

- JSON Schema definitions for all three AIACTA wire formats (crawl manifest,
  citation webhook, ai-attribution.txt parsed model).
- TypeScript type definitions shared across Node.js packages.

**Content hash utility (§2.3)**

- `computeContentHash` / `verifyContentHash` in both Node.js and Python.
  Implements "SHA-256 of UTF-8 normalised body text (HTML stripped,
  whitespace collapsed)" as specified.

**Query classification (§7.4)**

- `classifyQuery` heuristic classifier distinguishing Content-Dependent
  Queries from Logical/Utility Queries for PCF fee calculation.
- `calculatePcfFee` returns 0 for logical/utility queries per spec.

**Documentation**

- `docs/getting-started.md` — Quick-start for publishers and AI providers.
- `docs/compliance-tiers.md` — Bronze → Platinum implementation guide.
- `docs/proposals/` — One deep-dive doc per proposal.
- `docs/governance/aac-governance.md` — Working group composition and
  specification change process.
- `docs/integration/` — C2PA and schema.org integration guides.

---

## Roadmap

### [1.1.0] — Planned
- `Canonical-URL` field in `ai-attribution.txt` (§6.5)
- `C2PA-Endpoint` field for cryptographic provenance (§10.1)
- PostgreSQL adapter for `aac-server`
- Full OAuth 2.0 authentication on AAC server endpoints
- Squarespace and Medium CMS integrations

### [1.2.0] — Planned
- MAJOR version schema change process per §5.6
- W3C REP working group liaison submission
- ML-based query classifier (replaces heuristic in `query-classifier.js`)
