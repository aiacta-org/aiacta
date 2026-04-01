# AIACTA: AI Architecture for Content Transparency and Attribution

> **Open Specification · Apache 2.0** · Founding Author: Eric Michel, PhD · Contact: contact@aiacta.org

> **Current AIACTA Version: v1.0**

[![CI](https://github.com/aiacta-org/aiacta/actions/workflows/ci.yml/badge.svg)](https://github.com/aiacta-org/aiacta/actions)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./LICENSE)
[![Spec Version](https://img.shields.io/badge/spec-AIACTA%2F1.0-orange.svg)](./docs/proposals/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](./CONTRIBUTING.md)
---
## The Open Specification Standard for Global AI Content Transparency and Attribution 


**Welcome to The AI Architecture for Content Transparency and Attribution (AIACTA) Framework**  

AIACTA is an open, decentralised technical standard that bridges the gap between
AI inference engines and original content creators through **verifiable origin
recognition** and **automated attribution**. It is the Open Standard that makes content used by AI systems traceable, attributable, and economically accountable.

---

## Why this matters

AI systems use web content without standardized attribution.

AIACTA introduces a simple, interoperable way to:

- Identify and declare content origin and ownership
- Provide attribution metadata to enable fair AI attribution
- Enable AI usage tracking and analytics signals.

This document is released for public comment and industry distribution.

---

## The AIACTA Specification

This monorepo contains the complete reference implementation of all five proposals
from the [AIACTA v1.0 whitepaper](./publications/AIACTA_FrameworkV1_0_EricMichel_2026March24.pdf):


| # | Proposal | Implementation Cost |
|---|----------|---------------------|
| 1 | Structured Crawl Manifests (`X-AI-Crawl-Purpose` + pull API) | ~6–12 weeks |
| 2 | Standardised Publisher Citation Webhook API | ~12–20 weeks |
| 3 | Referrer Header Standardisation | Near-zero (config change) |
| 4 | `ai-attribution.txt` Open Standard | Low (spec adoption + parser) |
| 5 | Fair Reward & Incentivised Attribution Framework (AAC) | Organisational + legal |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AI Provider                                 │
│  ┌─────────────┐   X-AI-Crawl-Purpose    ┌──────────────────────┐   │
│  │  AI Crawler │ ──────────────────────▶ │  Publisher Site      │   │
│  └─────────────┘                         │  .well-known/ai-     │   │
│  ┌─────────────┐                         │  attribution.txt     │   │
│  │  Crawl Log  │ ◀── logs purpose ──     └──────────────────────┘   │
│  └──────┬──────┘                                                    │
│         │ builds                                                    │
│  ┌──────▼──────────┐      pull API (§2.2)                           │
│  │ Crawl Manifest  │ ◀────────────────────── Publisher              │
│  │     API         │                                                │
│  └──────┬──────────┘                                                │
│         │ cites                                                     │
│  ┌──────▼────────┐  citation event   ┌─────────────────────┐        │
│  │  AI Inference │ ────────────────▶ │   VWP Gateway       │        │
│  │  Engine       │                   │ (sign+verify+route) │        │
│  └───────────────┘                   └──────────┬──────────┘        │
└─────────────────────────────────────────────────┼───────────────────┘
                                                  │ signed webhook POST
                                    ┌─────────────▼───────────────┐
                                    │  Publisher Webhook Endpoint │
                                    │  (ai-citation-sdk)          │
                                    └─────────────────────────────┘
                                                  │
                                    ┌─────────────▼───────────────┐
                                    │      AAC Server             │
                                    │  citation ledger            │
                                    │  distribution engine        │
                                    │  provenance API (LE)        │
                                    └─────────────────────────────┘
```

---

## Packages

| Package | Lang | Spec Section | Description |
|---------|------|-------------|-------------|
| [`ai-attribution-lint`](./packages/ai-attribution-lint) | Node.js | §5.7 | CLI validator for `ai-attribution.txt` |
| [`ai-citation-sdk`](./packages/ai-citation-sdk) | Node / Python / Go | §3.4 | Webhook receiver SDK |
| [`crawl-manifest-client`](./packages/crawl-manifest-client) | Node / Python | §2.2 | Crawl Manifest API client |
| [`aac-dashboard-lite`](./packages/aac-dashboard-lite) | React | §3.7, §9.4 | No-code citation analytics dashboard |
| [`attribution-test-harness`](./packages/attribution-test-harness) | Docker | §12.1 | E2E sandbox for AI providers |
| [`aac-server`](./packages/aac-server) | Node.js | §7.3–7.5 | AAC Reference Server |
| [`vwp-gateway`](./packages/vwp-gateway) | Node.js | §3.4A-D | Verifiable Webhook Protocol gateway |
| [`referrer-middleware`](./packages/referrer-middleware) | Node / Python | §4 | Referrer-Policy enforcement middleware |
| [`honeypot-verifier`](./packages/honeypot-verifier) | Node.js | §2.4.1 | Crawl-purpose audit verification nodes |

---

## Quick Start

### For Publishers

**Step 1 — Create your `ai-attribution.txt`**

```bash
# Minimal valid file
cat > .well-known/ai-attribution.txt << 'EOF'
AIACTA-Version: 1.0
Contact: licensing@yourdomain.com
Preferred-Attribution: Your Site (yourdomain.com)
Allow-Purpose: rag
Allow-Purpose: index
Disallow-Purpose: training
Require-Citation: true
Require-Source-Link: true
Citation-Webhook: https://yourdomain.com/webhooks/ai-citations
Reward-Tier: standard
Content-License: CC-BY-SA-4.0
EOF
```

**Step 2 — Validate it**

```bash
npx ai-attribution-lint https://yourdomain.com
# or from a local file:
npx ai-attribution-lint ./path/to/ai-attribution.txt --strict
```

**Step 3 — Receive citation webhooks**

```bash
npm install ai-citation-sdk
```

```js
const express = require('express');
const { createExpressMiddleware } = require('ai-citation-sdk');

const app = express();
app.use(express.raw({ type: 'application/json' })); // raw body required for HMAC

app.post('/webhooks/ai-citations',
  createExpressMiddleware({
    secret:  process.env.AIACTA_WEBHOOK_SECRET,
    store:   myRedisOrDbStore,   // { exists(key), set(key) }
    onEvent: async (event) => {
      console.log(`Citation from ${event.provider}: ${event.citation.url}`);
      // → store in your analytics DB
    },
  })
);
```

**Step 4 — Query crawl history**

```js
const { CrawlManifestClient } = require('crawl-manifest-client');

const client = new CrawlManifestClient({
  provider: 'anthropic',
  apiKey:   process.env.CRAWL_API_KEY,
});

for await (const url of client.fetchAll({
  domain: 'yourdomain.com',
  from:   '2026-01-01T00:00:00Z',
  to:     '2026-03-31T00:00:00Z', // max 90-day range
})) {
  console.log(url.url, url.purpose, url.crawl_count_30d);
}
```

---

### For AI Providers

See the [Compliance Tiers guide](./docs/compliance-tiers.md) for full
implementation requirements. The fastest path to Tier Bronze:

1. Set `Referrer-Policy: origin` on all outbound link responses.
2. Fetch and parse `/.well-known/ai-attribution.txt` at crawl time.
3. Send `X-AI-Crawl-Purpose` and `X-AI-Crawl-Session` headers with every crawl.

To test your implementation end-to-end before deploying:

```bash
cd packages/attribution-test-harness
npm run up            # starts mock publisher + mock provider in Docker
npm run test:e2e      # runs all 4 proposal scenarios
```

---

### For Developers / Contributors

```bash
git clone https://github.com/aiacta-org/aiacta.git
cd aiacta
npm install           # installs all workspace packages
npm test              # runs all test suites

# Run the AAC server locally
cd packages/aac-server
cp .env.example .env  # fill in values
npm start             # listens on :3100
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the contribution guide.
High-priority areas: **Go SDK**, **CMS plugins**, **PostgreSQL adapter**,
**ML query classifier**.

---

## Compliance Tiers

| Tier | Badge | Requirements |
|------|-------|-------------|
| 🥉 Bronze | `AIACTA-Bronze` | Referrer headers + `ai-attribution.txt` parsing |
| 🥈 Silver | `AIACTA-Silver` | Bronze + Crawl Manifest API + `X-AI-Crawl-Purpose` |
| 🥇 Gold   | `AIACTA-Gold`   | Silver + Citation Webhook API |
| 💎 Platinum | `AIACTA-Platinum` | Gold + AAC participation + annual audit |

Full requirements: [docs/compliance-tiers.md](./docs/compliance-tiers.md)

---

## Community & Governance

- 📧 Contact the Author: contact@aiacta.org
- 🐛 Issues: [github.com/aiacta-org/aiacta/issues](https://github.com/aiacta-org/aiacta/issues)
- 💬 Discussions: [github.com/aiacta-org/aiacta/discussions](https://github.com/aiacta-org/aiacta/discussions)
- 🔒 Security: security@aiacta.org (see [SECURITY.md](https://github.com/aiacta-org/aiacta/SECURITY.md))
- 📋 Governance: [docs/governance/aac-governance.md](https://github.com/aiacta-org/aiacta/docs/governance/aac-governance.md)

The AIACTA Foundation is being formed as a neutral non-profit to govern
the specification, certification, and AAC distributions. 

Founding Partners, Sponsors, and Board member advisors are welcome and encouraged at: foundation@aiacta.org

---

## License and Intellectual Property  

Apache License 2.0 · Copyright © 2026 Eric Michel, PhD

The AIACTA name and associated certification marks are trademarks of the
Author. Any "AIACTA-compliant" designation requires explicit authorization
from the Author or the future governance body.

## How to cite this work:
```
The AI Architecture for Content Transparency and Attribution (AIACTA) Framewok
Author: Eric Michel, PhD
Date: March, 2026
Copyright © 2026 Eric Michel  
Licensed under the Apache License, Version 2.0
```
---
