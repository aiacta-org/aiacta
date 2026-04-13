# @aiacta-org/ai-citation-sdk

> Webhook receiver SDK for [AIACTA](https://github.com/mobeloper/aiacta/blob/main/publications/AIACTA_FrameworkV1_0_EricMichel_2026March24.pdf) citation events. Verifies signatures, handles idempotency, and provides ready-to-use Express middleware (Proposal 2, §3.4).

[![npm version](https://img.shields.io/npm/v/@aiacta-org/ai-citation-sdk.svg)](https://www.npmjs.com/package/@aiacta-org/ai-citation-sdk)
[![PyPI version](https://img.shields.io/pypi/v/ai-citation-sdk.svg)](https://pypi.org/project/ai-citation-sdk/)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../../LICENSE)
[![AIACTA Spec](https://img.shields.io/badge/spec-AIACTA%2F1.0-orange.svg)](../../docs/proposals/proposal-2-citation-webhooks.md)

Available in **Node.js**, **Python**, and **Go**.

---

## What is this?

When an AI provider (Anthropic, OpenAI, Google, etc.) cites your content in a response, they POST a signed event to your `Citation-Webhook` endpoint. This SDK handles the security and plumbing so you can focus on what to do with the data.

It provides:
- **Signature verification** — HMAC-SHA256 with constant-time comparison (prevents timing attacks)
- **Replay attack prevention** — timestamps validated within a ±5-minute window
- **Idempotency** — duplicate events are safely ignored
- **Express middleware** — drop-in handler for Node.js servers
- **Retry schedule** — implements the §3.5 six-attempt delivery retry

---

## Install

**Node.js**
```bash
npm install @aiacta-org/ai-citation-sdk
```

**Python**
```bash
pip install ai-citation-sdk
```

**Go**
```bash
go get github.com/aiacta-org/aiacta/ai-citation-sdk
```

---

## Quick Start

### Node.js — Express middleware (recommended)

```javascript
const express = require('express');
const { createExpressMiddleware } = require('@aiacta-org/ai-citation-sdk');

const app = express();

// IMPORTANT: express.raw() must come before the middleware.
// Signature verification requires the raw bytes, not parsed JSON.
app.post(
  '/webhooks/ai-citations',
  express.raw({ type: 'application/json' }),
  createExpressMiddleware({
    secret: process.env.WEBHOOK_SECRET,

    // Idempotency store — prevents processing the same event twice.
    // Replace with your database in production.
    store: {
      exists: async (key) => await db.citations.exists({ idempotency_key: key }),
      set:    async (key) => await db.citations.markProcessed(key),
    },

    // Called once per unique, verified event
    onEvent: async (event) => {
      console.log('Citation received:', event.citation.url);
      await db.citations.insert(event);
    },
  })
);

app.listen(3000);
```

### Node.js — manual verification

```javascript
const { verifyWebhookSignature } = require('@aiacta-org/ai-citation-sdk');

app.post('/webhooks/ai-citations', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const valid = verifyWebhookSignature(
      req.body,                                    // raw Buffer
      req.headers['X-AIACTA-Webhook-Timestamp'],       // UNIX seconds string
      req.headers['X-AIACTA-Webhook-Signature'],             // 'sha256=<hex>'
      process.env.WEBHOOK_SECRET
    );
    if (!valid) return res.status(401).json({ error: 'Invalid signature' });
  } catch (err) {
    // Timestamp outside ±5 min window — possible replay attack
    return res.status(400).json({ error: err.message });
  }

  res.status(200).json({ status: 'accepted' });

  const event = JSON.parse(req.body.toString());
  console.log('Provider:', event.provider);
  console.log('Cited URL:', event.citation.url);
});
```

### Python

```python
from aiacta import verify_webhook_signature

@app.route('/webhooks/ai-citations', methods=['POST'])
def citation_webhook():
    raw_body  = request.get_data()
    timestamp = request.headers.get('X-AIACTA-Webhook-Timestamp')
    sig       = request.headers.get('X-AIACTA-Webhook-Signature')
    secret    = os.environ['WEBHOOK_SECRET']

    try:
        valid = verify_webhook_signature(raw_body, timestamp, sig, secret)
    except ValueError as e:
        return {'error': str(e)}, 400

    if not valid:
        return {'error': 'Invalid signature'}, 401

    event = request.get_json(force=True)
    print(f"Citation: {event['citation']['url']} via {event['provider']}")
    return {'status': 'accepted'}, 200
```

### Go

```go
import "github.com/aiacta-org/aiacta/ai-citation-sdk"

func webhookHandler(w http.ResponseWriter, r *http.Request) {
    body, _ := io.ReadAll(r.Body)
    timestamp := r.Header.Get("X-AIACTA-Webhook-Timestamp")
    sig       := r.Header.Get("X-AIACTA-Webhook-Signature")
    secret    := os.Getenv("WEBHOOK_SECRET")

    ok, err := aiacta.VerifyWebhookSignature(body, timestamp, sig, secret)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    if !ok {
        http.Error(w, "Invalid signature", http.StatusUnauthorized)
        return
    }

    w.WriteHeader(http.StatusOK)
    // process event...
}
```

---

## Citation Event Schema

```json
{
  "schema_version": "1.0",
  "provider": "anthropic",
  "event_type": "citation.generated",
  "event_id": "evt_01J4KXQN2QP7HBW8FMYRC3T5VZ",
  "idempotency_key": "idem_01J4KXQN_f3a9b2c1",
  "timestamp": "2026-03-24T09:14:00Z",
  "citation": {
    "url": "https://yourdomain.com/articles/your-article",
    "citation_type": "factual_source",
    "context_summary": "Used to answer question about ...",
    "query_category_l1": "technology",
    "model": "claude-3-5-sonnet",
    "user_country": "US"
  },
  "attribution": {
    "display_type": "inline_link",
    "user_interface": "chat"
  }
}
```

**Privacy note:** `user_country` is always country-level only. AI providers are prohibited from including user IDs or sub-country geodata (§3.3).

---

## Security Details

The signature covers: `timestamp + "." + raw_json_body`

```
signature = HMAC-SHA256(shared_secret, signed_payload)
header    = "sha256=" + hex(signature)
```

The SDK uses `crypto.timingSafeEqual()` (Node.js), `hmac.compare_digest()` (Python), and `hmac.Equal()` (Go) to prevent timing oracle attacks.

---

## API Reference

### Node.js

| Export | Description |
|--------|-------------|
| `verifyWebhookSignature(payload, timestamp, sigHeader, secret)` | Returns `boolean`. Throws `Error` if timestamp is outside ±300s. |
| `processEvent(event, store, onEvent)` | Processes with idempotency check. |
| `createExpressMiddleware({ secret, store, onEvent })` | Drop-in Express route handler. |

### Python

| Function | Description |
|----------|-------------|
| `verify_webhook_signature(payload, timestamp, sig_header, secret)` | Returns `True` if valid. Raises `ValueError` on timestamp violation. |

### Go

| Function | Description |
|----------|-------------|
| `VerifyWebhookSignature(rawBody, timestamp, sigHeader, secret)` | Returns `(bool, error)`. Error if timestamp outside window. |
| `ProcessEvent(events, store, handler)` | Idempotent batch processing. |
| `TruncateToMinute(t time.Time)` | Timestamp formatting per §3.2. |

---

## Related packages

| Package | Purpose |
|---------|---------|
| [`@aiacta-org/ai-attribution-lint`](https://www.npmjs.com/package/@aiacta-org/ai-attribution-lint) | Validate your `ai-attribution.txt` |
| [`@aiacta-org/crawl-manifest-client`](https://www.npmjs.com/package/@aiacta-org/crawl-manifest-client) | Query AI providers' crawl history |

---

## License & Copyright

Copyright © 2026 Eric Michel, PhD. Licensed under the [Apache License 2.0](../../LICENSE).

Part of the [AIACTA open standard](https://github.com/aiacta-org/aiacta).
