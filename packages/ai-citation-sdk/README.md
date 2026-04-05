# ai-citation-sdk

> Webhook receiver SDK for AIACTA citation events — verifies signatures, handles idempotency, and provides ready-to-use middleware (Proposal 2, §3.4).

[![npm version](https://img.shields.io/npm/v/ai-citation-sdk.svg)](https://www.npmjs.com/package/ai-citation-sdk)
[![PyPI version](https://img.shields.io/pypi/v/ai-citation-sdk.svg)](https://pypi.org/project/ai-citation-sdk/)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../../LICENSE)
[![AIACTA Spec](https://img.shields.io/badge/spec-AIACTA%2F1.0-orange.svg)](../../docs/proposals/proposal-2-citation-webhooks.md)

Available in **Node.js**, **Python**, and **Go**.

---

## What is this?

When an AI provider (Anthropic, OpenAI, Google, etc.) cites your content in a response, they send a signed HTTP POST to your `Citation-Webhook` endpoint. This SDK handles the security and plumbing so you can focus on what to do with the data.

It provides:
- **Signature verification** — HMAC-SHA256 constant-time comparison (prevents timing attacks)
- **Replay attack prevention** — timestamps validated within ±5-minute window
- **Idempotency** — events with duplicate `idempotency_key` are safely ignored
- **Express middleware** — drop-in handler for Node.js web servers
- **Retry schedule** — implements the §3.5 six-attempt delivery retry

---

## Install

**Node.js**
```bash
npm install ai-citation-sdk
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
const { createExpressMiddleware } = require('ai-citation-sdk');

const app = express();

// IMPORTANT: use express.raw() before the middleware — signature
// verification requires the raw bytes, not parsed JSON.
app.post(
  '/webhooks/ai-citations',
  express.raw({ type: 'application/json' }),
  createExpressMiddleware({
    // Your HMAC secret from the AI provider's Publisher Portal
    secret: process.env.WEBHOOK_SECRET,

    // Idempotency store — prevents processing the same event twice.
    // Replace with your database in production.
    store: {
      exists: async (key) => await db.citations.exists({ idempotency_key: key }),
      set:    async (key) => await db.citations.markProcessed(key),
    },

    // Called once per unique event after signature verification
    onEvent: async (event) => {
      console.log('Citation received:', event.citation.url);
      // Save to your database, update analytics, send a notification...
      await db.citations.insert(event);
    },
  })
);

app.listen(3000);
```

### Node.js — manual verification

```javascript
const { verifyWebhookSignature, processEvent } = require('ai-citation-sdk');

// Verify a single incoming request
app.post('/webhooks/ai-citations', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const valid = verifyWebhookSignature(
      req.body,                                    // raw Buffer
      req.headers['x-ai-webhook-timestamp'],       // UNIX seconds
      req.headers['x-ai-webhook-sig'],             // 'sha256=<hex>'
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
    timestamp = request.headers.get('X-AI-Webhook-Timestamp')
    sig       = request.headers.get('X-AI-Webhook-Sig')
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
    timestamp := r.Header.Get("X-AI-Webhook-Timestamp")
    sig       := r.Header.Get("X-AI-Webhook-Sig")
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

Each event your webhook receives looks like this:

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

**Privacy note:** The spec prohibits AI providers from including user IDs, full query text, or sub-country geodata in citation events. `user_country` is always country-level only.

---

## Security Details

The HMAC-SHA256 signature is computed over:

```
signed_payload = timestamp + "." + raw_json_body
signature = HMAC-SHA256(shared_secret, signed_payload)
header = "sha256=" + hex(signature)
```

The SDK uses `crypto.timingSafeEqual()` (Node.js), `hmac.compare_digest()` (Python), and `hmac.Equal()` (Go) — never plain string comparison — to prevent timing oracle attacks.

---

## API Reference

### Node.js

| Export | Signature | Description |
|--------|-----------|-------------|
| `verifyWebhookSignature` | `(payload, timestamp, sigHeader, secret) → boolean` | Verifies HMAC-SHA256 signature. Throws if timestamp is outside ±300s window. |
| `processEvent` | `(event, store, onEvent) → Promise<void>` | Processes an event with idempotency check. |
| `createExpressMiddleware` | `({ secret, store, onEvent }) → middleware` | Drop-in Express route handler. |

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
| [`ai-attribution-lint`](../ai-attribution-lint) | Validate your `ai-attribution.txt` |
| [`crawl-manifest-client`](../crawl-manifest-client) | Query AI providers' crawl history |

---

## License & Copyright

Copyright © 2026 Eric Michel, PhD. Licensed under the [Apache License 2.0](../../LICENSE).

Part of the [AIACTA open standard](https://github.com/aiacta-org/aiacta).
