# honeypot-verifier

> Verification node for auditing `X-AI-Crawl-Purpose` accuracy — detects when AI providers misreport crawl purposes (§2.4.1).

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../../LICENSE)
[![AIACTA Spec](https://img.shields.io/badge/spec-AIACTA%2F1.0-orange.svg)](../../docs/proposals/proposal-1-crawl-manifests.md)

> **This is an AAC governance tool** run by the AI Attribution Collective's audit team, not by individual publishers.

---

## What is this?

AI providers self-report their crawl purpose via `X-AI-Crawl-Purpose`. A provider claiming `rag` (real-time query answering) should not train on that content. This verifier creates "canary" pages with unique embedded tokens — if a token from a `rag`-labelled crawl later appears in the model's completions, the provider has misreported their purpose.

---

## Quick Start

```bash
cd packages/honeypot-verifier
cp .env.example .env
npm start
```

Starts at **http://localhost:3300**.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Port (default: `3300`) |
| `AUDIT_LOG_API_KEY` | Secret key protecting the audit log endpoint |

---

## API (AAC audit team only)

```
POST /canary/register
  Create a canary page with a unique embedded token.
  Body: { content_template?: "Text with {{TOKEN}} placeholder" }
  Returns: { canary_id, url, unique_token }

GET  /canary/:id
  Serve the canary page. Logs X-AI-Crawl-Purpose and User-Agent.

POST /canary/probe
  Check if a model completion contains any canary tokens.
  Body: { provider, completion_text, probe_type }
  Returns: { status: "clean" | "violation_detected", violations?: [...] }

GET  /canary/audit-log
  Requires X-AIACTA-Audit-Key header.
  Returns full crawl log and violations list.

GET  /health
```

---

## How the audit process works

1. Audit team POSTs to `/canary/register` → gets a unique URL and token
2. AI provider crawls the canary URL, logging their claimed `X-AI-Crawl-Purpose`
3. After sufficient time (weeks/months for training), audit team sends probe completions to `/canary/probe`
4. If the model returns the unique token in its output, the provider's claimed purpose was false

---

## Known limitations (v1.0)

- In-memory storage — canary records reset on server restart. Production deployments should use a persistent database.

---

## License & Copyright

Copyright © 2026 Eric Michel, PhD. Licensed under the [Apache License 2.0](../../LICENSE).

Part of the [AIACTA open standard](https://github.com/aiacta-org/aiacta).
