# Changelog

All notable changes to the AIACTA reference implementation are documented here.

Every time you merge something to main, the release-please workflow reads your commit messages and opens (or updates) a "Release PR" automatically. The PR contains the updated CHANGELOG.md and bumped version numbers. When you're ready to release, merge that PR. It creates the git tag, which triggers your existing release.yml, which publishes to npm and PyPI.
Commit message format matters. See CONTRIBUTING.md(§5.2) for details.


---

## [1.0.12](https://github.com/aiacta-org/aiacta/compare/v1.0.11...v1.0.12) (2026-04-14)


### Bug Fixes

* **tests:** sync test env var and header names ([#80](https://github.com/aiacta-org/aiacta/issues/80)) ([d66af70](https://github.com/aiacta-org/aiacta/commit/d66af70bb3646dc1f8943d6f6cfc81df956dd5f6))

## [1.0.11](https://github.com/aiacta-org/aiacta/compare/v1.0.10...v1.0.11) (2026-04-13)


### Bug Fixes

* **headers:** standardize all custom HTTP headers to X-AIACTA- prefix ([#78](https://github.com/aiacta-org/aiacta/issues/78)) ([7646a4c](https://github.com/aiacta-org/aiacta/commit/7646a4ccf2c40c338dee75e023621cc4146f4e9f))

## [1.0.10](https://github.com/aiacta-org/aiacta/compare/v1.0.9...v1.0.10) (2026-04-11)


### Bug Fixes

* **webhook:** provenance SQL columns, INSERT OR IGNORE transparency, auth middleware, gateway webhook resolution, fail-closed signing keys ([#76](https://github.com/aiacta-org/aiacta/issues/76)) ([62b252a](https://github.com/aiacta-org/aiacta/commit/62b252ab9bf503ac80a8f4d59d09a4651bd0b80a))

## [1.0.9](https://github.com/aiacta-org/aiacta/compare/v1.0.8...v1.0.9) (2026-04-11)


### Bug Fixes

* **ci:** changed from npm install to npm ci for faster workflow ([#74](https://github.com/aiacta-org/aiacta/issues/74)) ([c1e539f](https://github.com/aiacta-org/aiacta/commit/c1e539f03b50b44d4f33ba0c643e87b7e1b5297e))

## [1.0.8](https://github.com/aiacta-org/aiacta/compare/v1.0.7...v1.0.8) (2026-04-11)


### Bug Fixes

* **ct:** replace HTTP_CODE grep separator with separate curl calls to fix exit code 2 ([#60](https://github.com/aiacta-org/aiacta/issues/60)) ([fae570e](https://github.com/aiacta-org/aiacta/commit/fae570e196952977beaf325ce2f4175c1791d796))
* **query:** provenance and cleaner citation routes ([#64](https://github.com/aiacta-org/aiacta/issues/64)) ([43c5e41](https://github.com/aiacta-org/aiacta/commit/43c5e418359c7790a0a5c036473904dd630db27d))
* **stale:** not_planned instead of 'non planned' ([#62](https://github.com/aiacta-org/aiacta/issues/62)) ([00f2505](https://github.com/aiacta-org/aiacta/commit/00f25053fec1bfc44e70ff5f9d339f48308f6c23))

## [1.0.7](https://github.com/aiacta-org/aiacta/compare/v1.0.6...v1.0.7) (2026-04-09)


### Bug Fixes

* **release:** aac dashboard released as asset artifact in Actions run, with release notes updated ([#56](https://github.com/aiacta-org/aiacta/issues/56)) ([ef08b2d](https://github.com/aiacta-org/aiacta/commit/ef08b2d8c03348a55e72a27c79b343314734bcb8))

## [1.0.6](https://github.com/aiacta-org/aiacta/compare/v1.0.5...v1.0.6) (2026-04-08)


### Bug Fixes

* **release:** delete immutable release and recreate with asset, bypasses HTTP 422 permanently ([#54](https://github.com/aiacta-org/aiacta/issues/54)) ([46919df](https://github.com/aiacta-org/aiacta/commit/46919df8cd26b83fcb6048c5cb9cb7ad6cb31a20))

## [1.0.5](https://github.com/aiacta-org/aiacta/compare/v1.0.4...v1.0.5) (2026-04-08)


### Bug Fixes

* **release:** create draft releases so dashboard asset can be uploaded before publishing ([#52](https://github.com/aiacta-org/aiacta/issues/52)) ([9c9374d](https://github.com/aiacta-org/aiacta/commit/9c9374d0f031647688821292e5d41637aef699ad))

## [1.0.4](https://github.com/aiacta-org/aiacta/compare/v1.0.3...v1.0.4) (2026-04-08)


### Bug Fixes

* **release:** inject version from release tag into setup.py and package.json at build time — eliminates race condition with version-sync workflow ([#50](https://github.com/aiacta-org/aiacta/issues/50)) ([7bd636d](https://github.com/aiacta-org/aiacta/commit/7bd636d670b7982ad669b1f08917688264c69730))

## [1.0.3](https://github.com/aiacta-org/aiacta/compare/v1.0.2...v1.0.3) (2026-04-08)


### Bug Fixes

* **release:** upload dashboard asset to existing release using gh CLI instead of softprops ([#48](https://github.com/aiacta-org/aiacta/issues/48)) ([96dca3d](https://github.com/aiacta-org/aiacta/commit/96dca3dd41c6bfd3c56b5a488834256f6e2fa219))

## [1.0.2](https://github.com/aiacta-org/aiacta/compare/v1.0.1...v1.0.2) (2026-04-08)


### Bug Fixes

* **sync:** enable new release ([#40](https://github.com/aiacta-org/aiacta/issues/40)) ([eaaddaa](https://github.com/aiacta-org/aiacta/commit/eaaddaa7b51f9de4aef5ce9362b1ff6d0dc2a079))

## [1.0.1](https://github.com/aiacta-org/aiacta/compare/v1.0.0...v1.0.1) (2026-04-07)


### Bug Fixes

* **ci:** dashboard vitest --passWithNoTests, jest --forceExit for Express packages; update READMEs to scoped names ([#28](https://github.com/aiacta-org/aiacta/issues/28)) ([6322e10](https://github.com/aiacta-org/aiacta/commit/6322e10e9e9f78b04c008552931401417df87709))
* **npm:** add keywords, homepage, repository, and bugs fields to published packages ([#30](https://github.com/aiacta-org/aiacta/issues/30)) ([830bb80](https://github.com/aiacta-org/aiacta/commit/830bb806af4eb3498231df215393c6e004028fb1))
* **release:** linked versioning — release-please now syncs all package versions together ([#32](https://github.com/aiacta-org/aiacta/issues/32)) ([193fe3b](https://github.com/aiacta-org/aiacta/commit/193fe3be5f4302c402b86ad38ba211a99c5ea2f4))
* **release:** point Python test step at crawl-manifest-client where tests actually exist ([#29](https://github.com/aiacta-org/aiacta/issues/29)) ([849b69d](https://github.com/aiacta-org/aiacta/commit/849b69d7e7be249ed2d701901ecf712418360e8b))
* **release:** scope npm packages to [@aiacta-org](https://github.com/aiacta-org), fix release.yml trigger ([#26](https://github.com/aiacta-org/aiacta/issues/26)) ([49662b6](https://github.com/aiacta-org/aiacta/commit/49662b6047787ba59705fc86bd7b2c201516c58b))
* **release:** sync all package.json versions from root before test ([#35](https://github.com/aiacta-org/aiacta/issues/35)) ([7a037b7](https://github.com/aiacta-org/aiacta/commit/7a037b7515bb5bc0d20e3ab257c8b1d41eb8346c))

## 1.0.0 (2026-04-05)


### Bug Fixes

* resolve 10 bugs blocking CI and production release ([#18](https://github.com/aiacta-org/aiacta/issues/18)) ([981cc01](https://github.com/aiacta-org/aiacta/commit/981cc014812c551c7c7728d536de7c8eea00ce2a))
* updated versions for package for successful CI workflow ([#19](https://github.com/aiacta-org/aiacta/issues/19)) ([3eb65a2](https://github.com/aiacta-org/aiacta/commit/3eb65a2d5c60fc7360e6f05eb72d5c86a8cd8f45))


## 1.0.0 (2026-04-03)

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

## 1.0.0 (2026-03-29)

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
