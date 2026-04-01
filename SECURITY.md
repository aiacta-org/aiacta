# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Active  |

## Reporting a Vulnerability

**Please do not report security vulnerabilities via GitHub Issues.**

Email: **security@aiacta.org**

Include:
- Description of the vulnerability and its potential impact
- Steps to reproduce
- Which package(s) are affected (e.g. `ai-citation-sdk`, `vwp-gateway`)
- Any suggested mitigations

You will receive an acknowledgement within 72 hours. We aim to triage and
release a fix within 14 days for critical issues.

## Security Design Principles

The AIACTA framework is built with the following security properties:

### Webhook Authentication (§3.4A)
- All outbound webhook events are signed with HMAC-SHA256 or Ed25519
- Signature covers `${timestamp}.${body}` to prevent payload substitution
- Timestamp tolerance window of ±5 minutes prevents replay attacks
- `crypto.timingSafeEqual` (Node.js) / `hmac.compare_digest` (Python) used
  throughout to prevent timing oracle attacks

### Anti-Replay
- `X-AI-Webhook-Timestamp` header required on every event
- Server rejects events with timestamps outside ±5-minute window
- Idempotency keys prevent duplicate processing even if replayed within window

### Privacy by Design (§3.3, GDPR Art. 25)
- User IDs, session IDs, and full query text are **never** included in events
- Geographic data limited to country-level only
- Event timestamps truncated to **minute precision** to prevent timing attacks

### Anti-Fraud (§3.4C, §3.4D)
- Citation velocity throttling at both gateway and AAC server levels
- Graph-based Citation Ring detection in the FPA engine
- Honeypot Verification Nodes cross-check claimed crawl purposes (§2.4.1)

### Dependency Policy
- All packages use pinned major versions
- `npm audit` runs in CI on every push
- No telemetry or tracking in any SDK

## Known Limitations

- `X-AI-Crawl-Purpose` is self-reported by crawlers and cannot be
  cryptographically verified at the HTTP level. Mitigation is through
  regulatory exposure and Honeypot Verification (§2.4.1). This limitation
  is explicitly disclosed per §2.4.

- The reference AAC server uses SQLite. SQLite's WAL mode provides
  reasonable concurrency but should be replaced with PostgreSQL for any
  deployment handling more than ~100 req/s.
