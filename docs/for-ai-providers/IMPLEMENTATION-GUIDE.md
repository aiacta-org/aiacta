# AIACTA Implementation Guide for AI Providers

> **Audience:** Engineering leads, product managers, and developer relations
> teams at AI companies implementing the AIACTA framework.
>
> **Goal:** Give your team everything needed to implement AIACTA from a
> one-sprint Tier Bronze deployment through Tier Platinum AAC participation.

---

## Table of Contents

1. [Why Implement AIACTA?](#1-why-implement-aiacta)
2. [What You Are Implementing](#2-what-you-are-implementing)
3. [Tier Bronze — Start Here (1 Sprint)](#3-tier-bronze--start-here-1-sprint)
4. [Tier Silver — Crawl Transparency (6–12 Weeks)](#4-tier-silver--crawl-transparency)
5. [Tier Gold — Citation Webhooks (12–20 Weeks)](#5-tier-gold--citation-webhooks)
6. [Tier Platinum — AAC Participation](#6-tier-platinum--aac-participation)
7. [Security Requirements](#7-security-requirements)
8. [Privacy and GDPR Compliance](#8-privacy-and-gdpr-compliance)
9. [Testing Your Implementation](#9-testing-your-implementation)
10. [Failure Modes and How to Handle Them](#10-failure-modes-and-how-to-handle-them)
11. [Integration with Existing Crawl Infrastructure](#11-integration-with-existing-crawl-infrastructure)
12. [Regulatory Alignment](#12-regulatory-alignment)
13. [FAQ for Engineering Teams](#13-faq-for-engineering-teams)

---

## 1. Why Implement AIACTA?

Before writing a line of code, your team needs to understand the business case.

### The Risk of Not Implementing

**Litigation exposure.** The NYT v. OpenAI litigation class illustrates a new
category of legal risk: AI providers may face discovery orders requiring them to
reconstruct crawl and training data logs ad hoc. That reconstruction is expensive
and uncontrolled. Maintaining structured crawl logs proactively converts this from
an uncontrolled liability into a bounded, manageable compliance cost.

**Regulatory pressure.** The EU AI Act's GPAI provisions include transparency and
documentation requirements for training data provenance. Maximum penalty: 3% of
global annual revenue. AIACTA compliance provides auditable evidence of good-faith
compliance. Similar frameworks are developing in the UK (Online Safety Act),
Australia (News Media Bargaining Code), and the US.

**Publisher relations.** Publishers whose content AI systems cite most produce the
highest-quality authoritative responses. Publishers who receive fair compensation
will preferentially allow deeper access to their best content — a direct quality
feedback loop.

### The Competitive Advantage of Moving First

Standards consolidate around the first credible implementation. The AI provider
that implements AIACTA first shapes the standard's evolution, earns substantial
publisher goodwill, and establishes itself as a trustworthy partner — all at
near-zero marginal cost at the Bronze tier.

This is the playbook Google ran with structured data in 2009. Google built it,
published the spec, and the ecosystem followed.

---

## 2. What You Are Implementing

AIACTA has four technical proposals and one economic proposal, all built on
standard HTTP infrastructure your teams already operate.

### The Four Technical Proposals

```
Proposal 1 — Crawl Manifests
  Your crawler logs events with purpose classification.
  You expose: GET /crawl-manifest/v1
  You send:   X-AI-Crawl-Purpose headers during crawling.

Proposal 2 — Citation Webhooks
  Your inference engine generates citation events.
  You sign events with HMAC-SHA256 or Ed25519.
  You deliver events to publisher webhook endpoints.
  You expose: GET /citations/v1 (pull API fallback)

Proposal 3 — Referrer Headers
  You set Referrer-Policy: origin on all outbound link responses.

Proposal 4 — ai-attribution.txt
  Your crawler fetches /.well-known/ai-attribution.txt before crawling.
  You respect Allow-Purpose / Disallow-Purpose directives.
  You honour Require-Citation and Require-Source-Link preferences.
```

### Effort Summary

| Tier | Proposals | Engineering Effort | Risk Level |
|------|-----------|-------------------|-----------|
| Bronze | 3 + 4 | 1 sprint (~1 week) | Near-zero |
| Silver | 1 + 3 + 4 | 6–12 weeks | Low |
| Gold | All 4 | 12–20 weeks | Moderate |
| Platinum | All 4 + AAC | Organisational + legal | Executive decision required |

---

## 3. Tier Bronze — Start Here (1 Sprint)

Bronze is the minimum viable AIACTA implementation. It requires no new APIs,
no new infrastructure, and can be deployed in a single sprint.

### Bronze Requirement 1: Referrer Headers (Proposal 3)

When a user clicks a link in your AI response, the HTTP Referer header must
identify your platform as the traffic source.

**What to implement:** Set `Referrer-Policy: origin` on responses serving your
chat/search interface. This causes the browser to send
`Referer: https://your-domain.com/chat` when users click outbound links.

```html
<!-- Option A: Meta tag in your HTML -->
<meta name="referrer" content="origin">

<!-- Option B: Per-link policy -->
<a href="https://publisher.com/article" referrerpolicy="origin">Source</a>
```

Or as a response header:
```
Referrer-Policy: origin
```

**Standard referrer URL format:**

| Platform | Correct Referrer URL |
|----------|---------------------|
| OpenAI ChatGPT | `https://chat.openai.com/chat` |
| Google Gemini | `https://gemini.google.com/app` |
| Anthropic Claude | `https://claude.ai/chat` |
| xAI Grok | `https://grok.xai.com/chat` |
| Perplexity | `https://www.perplexity.ai/search` |

**Optional UTM Parameter Appending (§4.3):**

If a publisher has set `Allow-UTM-Append: true` in their `ai-attribution.txt`,
you may append UTM parameters to outbound links:

```
utm_source=anthropic
utm_medium=ai-chat
utm_campaign=citation       (for cited sources)
utm_campaign=recommendation (for suggested but not cited links)
utm_campaign=tool-result    (from a tool/plugin call)
```

**Critical: This is opt-in only.** Never modify URLs by default.
Check the publisher's `ai-attribution.txt` first.

---

### Bronze Requirement 2: Parse ai-attribution.txt (Proposal 4)

Before crawling any domain, your crawler must fetch and parse
`/.well-known/ai-attribution.txt` (falling back to `/ai-attribution.txt`).

**What a file looks like:**
```
Schema-Version: 1.0
Contact: licensing@example.com
Preferred-Attribution: Example Media (example.com)
Allow-Purpose: rag
Allow-Purpose: index
Disallow-Purpose: training
Require-Citation: true
Require-Source-Link: true
Citation-Webhook: https://example.com/webhooks/ai-citations
Recrawl-After: 24h
Reward-Tier: standard
Content-License: CC-BY-SA-4.0
```

**Directives you must honour at Bronze tier:**

`Allow-Purpose` / `Disallow-Purpose` — Respect the publisher's stated preferences
for how their content may be used. If `Disallow-Purpose: training` is set, do not
use that domain's content for model training. Note: `robots.txt` Disallow takes
precedence over `Allow-Purpose` — if robots.txt blocks your crawler, the
ai-attribution.txt directive does not override it.

`Require-Citation` — If `true`, your inference engine must cite this source when
using its content in responses.

`Require-Source-Link` — If `true`, citations must include a clickable hyperlink.

`Preferred-Attribution` — Use this exact string when attributing the source.
Default to the domain name if not present.

`Recrawl-After` — Minimum interval before recrawling (e.g., `24h`, `7d`).

`Content-License` — SPDX licence identifier. Store this — it determines AAC
distribution multipliers at Tier Platinum.

**Caching requirements:**
- Respect `Cache-Control` and `Expires` response headers
- Default TTL if no cache headers: 24 hours
- Minimum TTL to honour: 1 hour (never re-fetch more often)

**Parsing rules:**
- Unknown fields must be silently ignored (forward-compatibility requirement §5.6)
- Field names are case-insensitive
- If the file is missing, apply all defaults (all purposes allowed, no citation required)
- If the file has parse errors in some fields, apply the valid fields and skip the invalid ones

**Reference parser:** `packages/ai-attribution-lint/src/parser.js`

---

### Validating Your Bronze Implementation

```bash
# Validate your ai-attribution.txt parsing
npx @aiacta-org/ai-attribution-lint https://your-domain.com

# Test referrer headers in browser DevTools:
# Open DevTools → Network tab → Click a link → Inspect Referer header
```

---

## 4. Tier Silver — Crawl Transparency

Silver adds two major components: crawl-time purpose headers and a publisher-queryable
crawl manifest API.

### Silver Requirement 1: X-AI-Crawl-Purpose Headers

Your crawler must send two additional HTTP headers with every crawl request:

```
X-AI-Crawl-Purpose: rag
X-AI-Crawl-Session: f3a9b2c1-0041-4d88-a7e2-8bd9f10cc321
```

**Allowed values for X-AI-Crawl-Purpose:**

| Value | When to Use |
|-------|------------|
| `training` | Content consumed for model training |
| `rag` | Content retrieved for a specific user query (RAG) |
| `index` | General index update; purpose to be determined later |
| `quality-eval` | Content used for benchmark or RLHF evaluation |

**X-AI-Crawl-Session** must be a UUID v4, unique per crawl session (not per URL).

**Security note:** These headers are self-reported. The AAC Honeypot Verification
system (§2.4.1) provides technical oversight, but the primary enforcement is
regulatory. Deliberately misreporting crawl purpose is a compliance violation.

---

### Silver Requirement 2: Crawl Manifest API

You must expose a pull API that publishers query to see their crawl history.

**Endpoint:**
```
GET https://api.YOUR-DOMAIN.com/crawl-manifest/v1
  ?domain=example.com
  &from=2026-01-01T00:00:00Z
  &to=2026-03-24T00:00:00Z    (max 90 days from 'from')
  &purpose=training,rag       (optional filter)
  &format=json
  &cursor=eyJwYWdlIjogMn0=    (pagination)
Authorization: Bearer {publisher_api_key}
```

**Response Schema:**
```json
{
  "provider": "your-provider-name",
  "domain": "example.com",
  "schema_version": "1.0",
  "period": {
    "from": "2026-01-01T00:00:00Z",
    "to": "2026-03-24T00:00:00Z"
  },
  "total_crawled_urls": 4821,
  "next_cursor": "eyJwYWdlIjogMn0=",
  "urls": [
    {
      "url": "https://example.com/articles/how-transformers-work",
      "last_crawled": "2026-03-10T14:22:05Z",
      "crawl_count_30d": 3,
      "purpose": ["rag"],
      "http_status_at_crawl": 200,
      "content_hash": "sha256:4f7e3abc..."
    }
  ]
}
```

**`content_hash` specification:** SHA-256 of UTF-8 body text after stripping
all HTML tags (including `<script>` and `<style>` blocks) and collapsing all
whitespace sequences to single spaces, then trimming.

**Rate Limit Headers (required):**
```
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1711234567
```

Rate limit: 60 requests per hour per domain. Max date range: 90 days per request.

**Publisher Verification Portal (required for Silver):**
Build a portal where publishers can verify domain ownership (DNS TXT record),
generate API keys, and view crawl history via a no-code interface.

---

### Data Storage for Silver

Log these fields per crawl event:

| Field | Notes |
|-------|-------|
| `url` | Full URL crawled |
| `domain` | Extracted from URL |
| `crawled_at` | Timestamp |
| `purpose` | Enum: training/rag/index/quality-eval |
| `http_status` | HTTP status at crawl time |
| `content_hash` | SHA-256 of normalised body |
| `session_id` | UUID from your X-AI-Crawl-Session header |

Minimum retention: 90 days (365 days for Platinum).

---

## 5. Tier Gold — Citation Webhooks

Gold is the most transformative tier. It directly addresses the core information
asymmetry: publishers currently have no way of knowing when their content is cited.

### Citation Event Schema

**HTTP Request you send to the publisher:**
```
POST https://publisher.com/webhooks/ai-citations
Content-Type: application/json
X-AI-Webhook-Sig: sha256=<hmac_signature>
X-AI-Webhook-Timestamp: 1711234567
```

**Request Body:**
```json
{
  "schema_version": "1.0",
  "provider": "your-provider-name",
  "event_type": "citation.generated",
  "event_id": "evt_01J4KXQN2QP7HBW8FMYRC3T5VZ",
  "idempotency_key": "idem_01J4KXQN_f3a9b2c1",
  "timestamp": "2026-03-24T09:14:00Z",
  "citation": {
    "url": "https://publisher.com/articles/machine-learning-basics",
    "citation_type": "factual_source",
    "context_summary": "Used to answer question about gradient descent",
    "query_category_l1": "technology",
    "query_category_l2": "machine_learning",
    "model": "your-model-identifier",
    "response_locale": "en-US",
    "user_country": "US"
  },
  "attribution": {
    "display_type": "inline_link",
    "user_interface": "chat"
  }
}
```

**Critical field rules:**

| Field | Requirement |
|-------|-------------|
| `timestamp` | **Minute precision only** — always `HH:MM:00Z`, never seconds or milliseconds |
| `user_country` | **Country-level only** — two-letter ISO 3166-1 alpha-2 code |
| `idempotency_key` | Must be stable — redeliveries use the same key |
| `citation_type` | `factual_source`, `recommendation`, or `tool-result` |

**Fields you must never include (privacy — §3.3):**

| Never Include | Reason |
|---------------|--------|
| User ID or session ID | Re-identification risk |
| Full query text | Quasi-identifier |
| Full response text | Copyright/IP exposure |
| City, ZIP, or coordinates | Re-identification (GDPR Art. 5(1)(c)) |
| Sub-minute timestamps | Timing attack re-identification |

---

### Signature Generation

Every event must be HMAC-SHA256 signed. The algorithm:

```
1. signed_payload = timestamp + "." + raw_json_body
2. signature = HMAC-SHA256(shared_secret, signed_payload)
3. Header: X-AI-Webhook-Sig: sha256=<hex_signature>
         : X-AI-Webhook-Timestamp: <unix_seconds>
```

**Node.js:**
```javascript
const crypto = require('crypto');
const timestamp = String(Math.floor(Date.now() / 1000));
const rawBody   = JSON.stringify(event, null, 0);
const signed    = `${timestamp}.${rawBody}`;
const sig = 'sha256=' + crypto.createHmac('sha256', publisherSecret).update(signed).digest('hex');
```

**Python:**
```
import hashlib, hmac as hmac_lib, time, json
timestamp = str(int(time.time()))
raw_body  = json.dumps(event, separators=(',', ':'))
signed    = f"{timestamp}.{raw_body}"
sig = 'sha256=' + hmac_lib.new(
    publisher_secret.encode('utf-8'),
    signed.encode('utf-8'),
    hashlib.sha256
).hexdigest()
```

**HMAC Secret Management:**
- Generate a unique secret per publisher (minimum 32 bytes, cryptographically random)
- Store in a dedicated secrets manager (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault)
- Never log secrets, never transmit in plaintext, never store in source code
- Support secret rotation with a grace period (both old and new valid simultaneously)

---

### Delivery Requirements

**Timeout:** Publisher must respond HTTP 200 within 10 seconds. Treat non-200
or timeout as failure.

**Retry schedule:**

| Attempt | Delay After Previous Failure |
|---------|------------------------------|
| 1 | Immediately |
| 2 | 30 seconds |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5 | 2 hours |
| 6 | 12 hours |
| Dead-letter | Retained in pull API for 30 days |

**Batch Delivery** (for publishers receiving >100 events/minute):

```json
{
  "batch_id": "batch_01J4KXQN2Q...",
  "schema_version": "1.0",
  "events": [
    { "idempotency_key": "...", "event_type": "citation.generated", "..." : "..." },
    { "idempotency_key": "...", "event_type": "citation.generated", "..." : "..." }
  ]
}
```

Deliver when batch reaches 100 events or 60 seconds have elapsed, whichever comes first.

---

### Pull API (Fallback for Publishers Without Webhook Endpoints)

For publishers who cannot expose a public HTTPS endpoint:

```
GET https://api.YOUR-DOMAIN.com/citations/v1
  ?domain=example.com
  &since=2026-03-24T00:00:00Z
  &cursor=eyJpZCI6IjEyMyJ9
  &limit=1000
Authorization: Bearer {publisher_api_key}
```

Response: same CitationEvent schema, paginated.
Retention: 90 days (standard), 365 days (enterprise tier).

---

## 6. Tier Platinum — AAC Participation

Platinum requires an organisational decision — a contractual commitment to
contribute to the AAC pool.

### Requirements

1. All four technical proposals implemented (Gold status)
2. Enrolment with the AI Attribution Collective (AAC)
3. Selection of contribution modality (RPA or PCF)
4. Citation event feeds submitted to the AAC server
5. Annual third-party compliance audit

### Contribution Models

**Revenue-Proportional Allocation (RPA):** A percentage of gross revenue from
content-dependent AI queries. Proposed baseline: 0.5–2.0%.

**Per-Citation Fee (PCF):** Event-based fee per citation. Proposed baseline:
$0.0001–$0.001 per citation, tiered by query commercial value.

Both models apply only to **content-dependent queries** — those where your
response draws on specific publisher content. Logical/utility queries (code
generation, translation, pure math) are explicitly excluded.

### The Platinum Safe Harbour

By contributing to the AAC pool, your company receives a Collective Licensing
Safe Harbour — a proactive, non-exclusive licence to crawl and cite participating
publishers. This functions as an affirmative defence against copyright litigation
from those publishers, converting a copyright risk into a bounded operating cost.

### Enrolment

Contact the AAC at licensing@aiacta.org or register via:
```
POST https://aac.aiacta.org/v1/enrollment/providers
{
  "name": "Your Company",
  "contribution_mode": "pcf",
  "pcf_rate": 0.001
}
```

---

## 7. Security Requirements

These are non-negotiable at all tiers.

### Constant-Time Signature Comparison

Never use string equality to compare HMAC signatures. Always use constant-time
comparison to prevent timing oracle attacks:

```javascript
// CORRECT (Node.js)
crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))

// WRONG — leaks information through timing
expected === received
```

```python
# CORRECT (Python)
hmac.compare_digest(expected, received)

# WRONG
expected == received
```

### Timestamp Replay Prevention

The ±300 second (5 minute) tolerance window is exact. Reject any event
whose timestamp is outside this window even if the signature is valid.
Replay attacks submit previously captured valid events — the timestamp
check is the only defence.

### Input Validation

Validate every field before processing. Do not assume publishers' webhook
endpoints are sending well-formed data. Check for: required fields present,
values within expected enums, URL format validity, timestamp parseable as UNIX int.

### Publisher Webhook Domain Verification

Before activating a `Citation-Webhook` URL:
1. Check that the URL's hostname is on the same verified domain as the publisher
2. Require DNS TXT record verification (same mechanism as Google Search Console)
3. Never send citation events to an unverified endpoint

---

## 8. Privacy and GDPR Compliance

### Data Minimisation (GDPR Art. 5(1)(c))

| Include | Never Include |
|---------|---------------|
| `user_country` (country-level only) | City, region, ZIP, coordinates |
| `timestamp` (minute precision) | Second or millisecond precision |
| `query_category_l1` / `l2` | Full query text |
| `model` identifier | Session ID or user ID |
| Citation `url` | Full response text |

### Retention

- Citation events in your systems: 90 days minimum (365 days for enterprise)
- Dead-lettered events in pull API: 30 days after final delivery attempt
- Crawl logs: 90 days minimum (365 days for Platinum)

### Publisher Notice

Include this in your developer documentation for publishers receiving webhooks:

> "Publishers receiving citation webhook data act as independent data controllers
> for the information they receive and store. Publishers should review their
> privacy policies, ensure a lawful basis for processing (likely legitimate
> interests under Article 6(1)(f) GDPR), and implement appropriate retention
> limits. Webhook data must not be combined with other datasets in ways that
> could enable user re-identification."

---

## 9. Testing Your Implementation

### Use the AIACTA Test Harness

```bash
git clone https://github.com/aiacta-org/aiacta.git
cd aiacta/packages/attribution-test-harness
docker compose up --build
PROVIDER_URL=https://your-api.yourdomain.com npm run test:e2e
```

### Pre-Production Checklist

**Tier Bronze**
```
[ ] Referrer-Policy: origin set on chat/search interface pages
[ ] ai-attribution.txt fetched before first crawl of each domain
[ ] Cache-Control on ai-attribution.txt responses respected
[ ] Unknown fields silently ignored
[ ] Allow-Purpose / Disallow-Purpose directives enforced
[ ] Preferred-Attribution used in citations when available
```

**Tier Silver (adds)**
```
[ ] X-AI-Crawl-Purpose sent with every crawl request
[ ] X-AI-Crawl-Session UUID sent with every crawl request
[ ] Crawl events logged with all required fields
[ ] GET /crawl-manifest/v1 endpoint live
[ ] 90-day date range limit enforced (returns 400 if exceeded)
[ ] Rate limit headers returned
[ ] Publisher domain verification portal working
[ ] content_hash computed correctly (SHA-256 of stripped/collapsed body)
```

**Tier Gold (adds)**
```
[ ] Citation events generated for every cited URL
[ ] Timestamp truncated to minute precision (HH:MM:00Z)
[ ] HMAC-SHA256 signature correct (verify with test vectors below)
[ ] Timestamp tolerance window ±300 seconds
[ ] Retry schedule implemented (6 attempts per spec)
[ ] Dead-lettered events in pull API for 30 days
[ ] Batch delivery implemented (≤100 events/batch, ≤60 second window)
[ ] Pull API GET /citations/v1 available
[ ] Privacy: no user IDs, no sub-country geo, no full query text
[ ] HMAC secrets in dedicated secrets manager
[ ] Webhook domain verification before activation
```

### Test Vectors for HMAC Signature Verification

Use these test vectors to verify your signature implementation matches the spec:

```
Secret:    test-secret-aiacta-v1
Timestamp: 1711234567
Body:      {"schema_version":"1.0","event_type":"citation.generated"}
Signed:    1711234567.{"schema_version":"1.0","event_type":"citation.generated"}
Expected:  sha256=<compute this with your implementation and compare>
```

The AIACTA validator can verify your implementation:
```bash
# From the attribution-test-harness:
npm run verify-signatures -- --provider-url https://your-api.yourdomain.com
```

---

## 10. Failure Modes and How to Handle Them

### Publisher Webhook Endpoint Down

- Detect: HTTP 5xx or connection timeout (> 10 seconds)
- Action: Follow the retry schedule, then dead-letter
- Do not: Drop silently; do not alert the publisher until after dead-lettering

### Publisher ai-attribution.txt Conflicts with robots.txt

- Rule: `robots.txt` Disallow always takes precedence over `ai-attribution.txt`
  Allow-Purpose
- If robots.txt blocks your crawler, you cannot crawl regardless of ai-attribution.txt

### Publisher Sets Citation-Webhook to a Domain They Do Not Own

- Attack: Routes your citation data to a competitor's endpoint
- Mitigation: Verify webhook URL is on the same DNS-verified domain before activating

### Content Hash Discrepancy

If a publisher disputes a content hash:
1. Content may have changed between your crawl and their check (normal)
2. Verify your hash algorithm: SHA-256 of text with HTML stripped and whitespace collapsed
3. Check for CDN-delivered geo-variants or A/B test variants

Reference implementation: `packages/crawl-manifest-client/src/node/content-hash.js`

### Batch Delivery Partial Failure

If a publisher's endpoint returns 5xx during a batch delivery:
- Retry the entire batch
- Use the `batch_id` for the publisher to identify duplicates via `idempotency_key` deduplication

---

## 11. Integration with Existing Crawl Infrastructure

### Adding Headers to Your Crawler

```python
# Python — add to your existing crawl request function
def crawl_url(url, purpose, session_id):
    headers = {
        'User-Agent': 'YourBotName/1.0 (+https://yourdomain.com/bot)',
        'X-AI-Crawl-Purpose': purpose,
        'X-AI-Crawl-Session': session_id,
    }
    return requests.get(url, headers=headers, timeout=30)
```

```javascript
// Node.js — add to your existing HTTP client
const headers = {
  'User-Agent': 'YourBotName/1.0 (+https://yourdomain.com/bot)',
  'X-AI-Crawl-Purpose': purpose,   // 'training' | 'rag' | 'index' | 'quality-eval'
  'X-AI-Crawl-Session': sessionId, // UUID v4, same for the whole crawl session
};
```

### Logging Crawl Events

Add these fields to your existing crawl logging pipeline:
```json
{
  "url": "https://example.com/article",
  "domain": "example.com",
  "crawled_at": "2026-03-24T09:14:23Z",
  "purpose": "rag",
  "session_id": "f3a9b2c1-0041-4d88-a7e2-8bd9f10cc321",
  "http_status": 200,
  "content_hash": "sha256:4f7e3abc..."
}
```

### Generating Citation Events from Your Inference Pipeline

**RAG architecture:** When your retrieval system returns a document and the
model uses it in the response, emit a citation event with that document's URL.

**Search-augmented generation:** When you fetch a URL and include its content
in the prompt, that URL is a citation source.

The citation event is generated at inference time, immediately before or
after the response is sent to the user.

---

## 12. Regulatory Alignment

| Regulation | Jurisdiction | How AIACTA Helps |
|------------|-------------|-----------------|
| EU AI Act (GPAI) | European Union | Crawl manifests provide training data provenance logs. Max penalty: 3% global revenue. |
| EU Copyright Directive Art. 17 | European Union | Citation webhooks provide attribution records for licensing negotiations |
| GDPR | European Union | Privacy-preserving schema (§3.3) satisfies Art. 5 data minimisation |
| UK Online Safety Act | United Kingdom | Transparency logs satisfy algorithmic system documentation requirements |
| Australian News Media Bargaining Code | Australia | AAC pool provides scalable commercial negotiation mechanism |
| NYT v. OpenAI and related | United States | Structured crawl logs convert litigation discovery from reconstruction exercise to database query |

---

## 13. FAQ for Engineering Teams

**Q: Do we need to implement all four proposals at once?**
No. The compliance tiers are incremental. Implement Bronze in your next sprint
and build from there.

**Q: What if a publisher's ai-attribution.txt is missing or malformed?**
Apply defaults (all purposes allowed, no citation required). Never fail a crawl
because of the publisher's configuration error. Silently skip malformed fields.

**Q: How do we handle syndicated content appearing on multiple domains?**
Attribute to the domain you actually crawled. For v1.0, honouring `rel=canonical`
tags is best practice. A `Canonical-URL` field is planned for v1.2.

**Q: Our inference pipeline does not always know which specific URL was used.**
For RAG architectures, you should be able to trace retrieved chunks back to their
source URL. For fine-tuned models, use `citation_type: index` to indicate general
content influence without URL attribution.

**Q: What engineering team size is needed for Gold implementation?**
Based on spec complexity estimates: Bronze = 1 engineer, 1 week.
Silver = 2–3 engineers, 6–10 weeks. Gold = 3–5 engineers, 12–20 weeks.
Actual effort varies substantially with existing infrastructure.

**Q: Can we use the reference implementation directly?**
The publisher-side tools (ai-citation-sdk, crawl-manifest-client) can be used
directly. For provider-side implementations, you build the API server — the
`aac-server` reference shows the data models and algorithms to adapt.

---

*Questions? Contact contact@aiacta.org or open a Discussion at
github.com/aiacta-org/aiacta/discussions*
