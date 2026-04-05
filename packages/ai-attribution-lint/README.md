# ai-attribution-lint

> CLI validator for `ai-attribution.txt` files — the AIACTA open standard for AI content attribution (Proposal 4, §5.7).

[![npm version](https://img.shields.io/npm/v/ai-attribution-lint.svg)](https://www.npmjs.com/package/ai-attribution-lint)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../../LICENSE)
[![AIACTA Spec](https://img.shields.io/badge/spec-AIACTA%2F1.0-orange.svg)](../../docs/proposals/proposal-4-ai-attribution-txt.md)

---

## What is this?

`ai-attribution-lint` validates your `ai-attribution.txt` file — the plain-text file publishers place on their website to declare their preferences to AI systems. It checks syntax, required fields, valid values, SPDX licence identifiers, and webhook reachability.

Think of it as the `eslint` or `htmlhint` for the AIACTA standard.

---

## Install

```bash
# Run once without installing (recommended for quick checks)
npx ai-attribution-lint https://yourdomain.com

# Install globally
npm install -g ai-attribution-lint

# Install as a dev dependency in a project
npm install --save-dev ai-attribution-lint
```

---

## Usage

### Check a live website

```bash
npx ai-attribution-lint https://yourdomain.com
```

The linter automatically fetches `/.well-known/ai-attribution.txt` (and falls back to `/ai-attribution.txt`).

### Check a local file

```bash
npx ai-attribution-lint ./ai-attribution.txt
```

### JSON output (for CI pipelines)

```bash
npx ai-attribution-lint https://yourdomain.com --json
```

Output format:
```json
{
  "errors": [],
  "warnings": [
    "Schema-Version is missing — defaults to 1.0"
  ],
  "info": []
}
```

Exit codes:
- `0` — Passed (no errors)
- `1` — Failed (one or more errors, or warnings in `--strict` mode)
- `2` — Could not fetch or parse the file

### Strict mode (treat warnings as errors)

```bash
npx ai-attribution-lint https://yourdomain.com --strict
```

---

## What it checks

| Rule | Severity |
|------|----------|
| `Schema-Version` is present and is `"1.0"` | Warning if missing |
| `Contact` field is present | Warning if missing |
| `Allow-Purpose` / `Disallow-Purpose` values are valid enum values (`training`, `rag`, `index`, `quality-eval`) | Error |
| `Content-License` is a valid SPDX identifier or `All-Rights-Reserved` | Error |
| `Citation-Webhook` URL is reachable (HTTP HEAD request) | Warning if unreachable |
| `Reward-Tier` is a valid enum value | Error |
| `robots.txt` conflicts with `Allow-Purpose` | Warning |
| Unknown fields are silently ignored (forward-compatibility) | — |

---

## Use in CI/CD

Add to your GitHub Actions workflow to automatically validate your `ai-attribution.txt` on every deploy:

```yaml
- name: Validate ai-attribution.txt
  run: npx ai-attribution-lint https://yourdomain.com --json
```

Or validate a local file during build:

```yaml
- name: Validate ai-attribution.txt
  run: npx ai-attribution-lint ./public/.well-known/ai-attribution.txt
```

---

## Node.js API

```javascript
const { lint } = require('ai-attribution-lint');

const result = await lint('https://yourdomain.com');
// or: await lint('./ai-attribution.txt')

console.log(result.errors);   // string[] — blocking issues
console.log(result.warnings); // string[] — advisory issues
console.log(result.info);     // string[] — informational notes

if (result.errors.length > 0) {
  process.exit(1);
}
```

---

## Example ai-attribution.txt

```
Schema-Version: 1.0
Contact: ai-licensing@yourdomain.com
Preferred-Attribution: Your Publication Name (yourdomain.com)
Allow-Purpose: rag
Allow-Purpose: index
Disallow-Purpose: training
Require-Citation: true
Require-Source-Link: true
Citation-Format: title-and-url
Citation-Webhook: https://yourdomain.com/webhooks/ai-citations
Recrawl-After: 24h
Reward-Tier: standard
Content-License: All-Rights-Reserved
```

Place this file at `https://yourdomain.com/.well-known/ai-attribution.txt`.

---

## Related packages

| Package | Purpose |
|---------|---------|
| [`ai-citation-sdk`](../ai-citation-sdk) | Receive and verify citation webhook events |
| [`crawl-manifest-client`](../crawl-manifest-client) | Query AI providers' crawl history for your domain |

---

## License & Copyright

Copyright © 2026 Eric Michel, PhD. Licensed under the [Apache License 2.0](../../LICENSE).

AIACTA™ is a trademark of the AIACTA Foundation. This package is part of the [AIACTA open standard](https://github.com/aiacta-org/aiacta).
