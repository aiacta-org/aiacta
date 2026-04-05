# referrer-middleware

> Express and Python WSGI middleware that sets `Referrer-Policy: origin`, making AI-referred traffic visible in your analytics (Proposal 3, §4.2–4.4).

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../../LICENSE)
[![AIACTA Spec](https://img.shields.io/badge/spec-AIACTA%2F1.0-orange.svg)](../../docs/proposals/proposal-3-referrer-headers.md)

---

## What is this?

When users click links in AI responses and arrive at your site, the `Referer` header tells you where they came from. Without a policy, this header is either missing or contains the full AI conversation URL (a privacy risk).

This middleware sets `Referrer-Policy: origin` — the browser sends only the AI platform's base URL — making AI-referred traffic visible in your analytics while protecting user privacy.

It also optionally appends UTM parameters for publishers who have opted in via `Allow-UTM-Append: true` in their `ai-attribution.txt`.

---

## Install

**Node.js**
```bash
npm install referrer-middleware
```

**Python**
```bash
pip install referrer-middleware
```

---

## Usage

### Express (Node.js)

```javascript
const express = require('express');
const { createReferrerMiddleware } = require('referrer-middleware');

const app = express();

// Basic — just sets Referrer-Policy: origin on all responses
app.use(createReferrerMiddleware({ provider: 'anthropic' }));

// With UTM appending for opted-in publishers
app.use(createReferrerMiddleware({
  provider:     'anthropic',
  appendUtm:    true,
  isUtmEnabled: async (domain) => {
    // Return true if this publisher has Allow-UTM-Append: true
    return await checkPublisherOptIn(domain);
  },
}));
```

### Python (WSGI / Flask / Django)

```python
from referrer_middleware import ReferrerMiddleware

# Flask
app.wsgi_app = ReferrerMiddleware(app.wsgi_app, provider='anthropic')

# Django (wsgi.py)
application = ReferrerMiddleware(get_wsgi_application(), provider='anthropic')
```

---

## What analytics see

After this middleware, your traffic analytics will correctly show AI referrals:

| AI Platform | Referer in analytics |
|-------------|---------------------|
| Anthropic Claude | `https://claude.ai` |
| OpenAI ChatGPT | `https://chat.openai.com` |
| Google Gemini | `https://gemini.google.com` |
| Perplexity | `https://www.perplexity.ai` |

---

## Without a server

For static sites, set the policy at the CDN:

```html
<!-- HTML meta tag -->
<meta name="referrer" content="origin" />
```

```nginx
# nginx
add_header Referrer-Policy "origin" always;
```

```json
// Vercel vercel.json
{
  "headers": [
    { "source": "/(.*)", "headers": [{ "key": "Referrer-Policy", "value": "origin" }] }
  ]
}
```

---

## License & Copyright

Copyright © 2026 Eric Michel, PhD. Licensed under the [Apache License 2.0](../../LICENSE).

Part of the [AIACTA open standard](https://github.com/aiacta-org/aiacta).
