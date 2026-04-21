# @aiacta-org/ai-attribution-lint

> CLI validator for `ai-attribution.txt` files, the AIACTA open standard for AI content attribution and publisher rights (Proposal 4, §5.7).

[![npm version](https://img.shields.io/npm/v/@aiacta-org/ai-attribution-lint.svg)](https://www.npmjs.com/package/@aiacta-org/ai-attribution-lint)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../../LICENSE)
[![AIACTA Spec](https://img.shields.io/badge/spec-AIACTA%2F1.0-orange.svg)](../../docs/proposals/proposal-4-ai-attribution-txt.md)

---

## What is this?

`@aiacta-org/ai-attribution-lint` validates your `ai-attribution.txt` file, the plain-text file publishers place on their website to declare their preferences to AI systems. It checks every field line by line and tells you exactly what passed, what needs attention, and what is broken.

Think of it as `eslint` for the AIACTA standard.

---

## Install

```bash
# Run once without installing (recommended for quick checks)
npx @aiacta-org/ai-attribution-lint https://yourdomain.com

# Install globally
npm install -g @aiacta-org/ai-attribution-lint

# Install as a dev dependency in a project
npm install --save-dev @aiacta-org/ai-attribution-lint
```

---

## Usage

### Check a live website

```bash
npx @aiacta-org/ai-attribution-lint https://yourdomain.com
```

The linter automatically fetches `/.well-known/ai-attribution.txt` from the domain root. You do not need to include the path, just the domain is enough.

### Check a local file

```bash
npx @aiacta-org/ai-attribution-lint ./ai-attribution.txt
npx @aiacta-org/ai-attribution-lint ./public/.well-known/ai-attribution.txt
```

### JSON output (for CI pipelines and scripts)

```bash
npx @aiacta-org/ai-attribution-lint https://yourdomain.com --json
```

### Strict mode (treat warnings as errors, exit 1)

```bash
npx @aiacta-org/ai-attribution-lint https://yourdomain.com --strict
```

---

## Example output

Running the linter against a well-configured domain produces per-field results
for every field checked, exactly as described in the AIACTA whitepaper (§5.7):

```
ai-attribution.txt validator v1.0.12

Fetching: https://example.com/.well-known/ai-attribution.txt ... OK
Schema-Version: 1.0 ... OK
Contact: licensing@example.com ... OK (valid email)
Contact: https://example.com/ai-licensing ... OK (valid URL)
Allow-Purpose: rag ... OK (real-time retrieval-augmented generation)
Allow-Purpose: index ... OK (general search indexing)
Disallow-Purpose: training ... OK (use for model training)
Content-License: CC-BY-SA-4.0 ... OK (valid SPDX identifier)
Reward-Tier: standard ... OK (opt-in to AAC distributions)
Citation-Webhook: https://example.com/webhooks/ai-citations ... WARN (endpoint not reachable)
robots.txt: no AI-bot Disallow rules ... OK (no conflicts with Allow-Purpose)

Result: 1 warning, 0 errors
```

**Colour coding in terminal:**
- `OK` - green - field is present and valid
- `WARN` - yellow - advisory issue; does not fail the build unless `--strict` is used
- `ERROR` - red - blocking issue; always exits with code 1

---

## What it checks

### Required field

| Field | Rule |
|-------|------|
| `Schema-Version` | Must be present. Must equal `"1.0"`. Missing = warning (defaults to 1.0). Unknown version = warning. |

### Strongly recommended fields

| Field | Rule |
|-------|------|
| `Contact` | Should be present. Each value must be a valid email address or `https://` URL. |
| `Content-License` | Should be present. Must be a full SPDX identifier (e.g. `CC-BY-SA-4.0`, not `CC-BY-SA`) or `All-Rights-Reserved`. Affects your AAC distribution multiplier. |

### Optional fields with validation

| Field | Rule |
|-------|------|
| `Allow-Purpose` | Each value must be one of: `training`, `rag`, `index`, `quality-eval`. Case-insensitive. |
| `Disallow-Purpose` | Same enum values as `Allow-Purpose`. |
| `Reward-Tier` | Must be one of: `standard`, `premium`, `licensing-only`, `none`. |
| `Citation-Webhook` | Must be a valid `https://` URL. A HEAD request is sent to check reachability - unreachable = warning, not error. Cross-domain webhooks trigger a warning (DNS verification required by AAC). |

### Conflict detection

| Check | Rule |
|-------|------|
| `robots.txt` conflicts | If `robots.txt` has `Disallow: /` for known AI bots, a warning is shown because `robots.txt` takes precedence over `Allow-Purpose` (§5.5). |

---

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Passed - no errors. Warnings present but not in strict mode. |
| `1` | Failed - one or more errors, or warnings in `--strict` mode. |
| `2` | Fetch/parse failure - the file could not be retrieved or read. |

---

## JSON output format

The `--json` flag produces a machine-readable result suitable for CI scripts:

```json
{
  "fetchedUrl": "https://example.com/.well-known/ai-attribution.txt",
  "errors": [],
  "warnings": [
    "Citation-Webhook endpoint not reachable: https://example.com/webhooks/ai-citations (connection refused)"
  ],
  "info": [],
  "findings": [
    { "field": "Schema-Version", "value": "1.0", "status": "ok" },
    { "field": "Contact", "value": "licensing@example.com", "status": "ok", "detail": "valid email" },
    { "field": "Allow-Purpose", "value": "rag", "status": "ok", "detail": "real-time retrieval-augmented generation" },
    { "field": "Content-License", "value": "CC-BY-SA-4.0", "status": "ok", "detail": "valid SPDX identifier" },
    { "field": "Citation-Webhook", "value": "https://example.com/webhooks/ai-citations", "status": "warn", "detail": "endpoint not reachable (connection refused)" }
  ]
}
```

Each entry in `findings` has:
- `field` - the `ai-attribution.txt` field name
- `value` - the value found in the file
- `status` - `"ok"`, `"warn"`, or `"error"`
- `detail` - optional human-readable explanation

---

## Use in CI/CD

### GitHub Actions - validate before deploying

```yaml
- name: Validate ai-attribution.txt
  run: npx @aiacta-org/ai-attribution-lint ./public/.well-known/ai-attribution.txt
```

### GitHub Actions - validate against live site after deploy

```yaml
- name: Validate live ai-attribution.txt
  run: npx @aiacta-org/ai-attribution-lint https://yourdomain.com --json
```

### GitHub Actions - strict mode (warnings fail the build)

```yaml
- name: Validate ai-attribution.txt (strict)
  run: npx @aiacta-org/ai-attribution-lint https://yourdomain.com --strict
```

---

## Node.js API

```javascript
const { lint } = require('@aiacta-org/ai-attribution-lint');

// Validate a live domain
const result = await lint('https://yourdomain.com');

// Validate a local file
const result = await lint('./ai-attribution.txt');

// result shape:
console.log(result.errors);    // string[] - blocking issues
console.log(result.warnings);  // string[] - advisory issues
console.log(result.info);      // string[] - informational notes
console.log(result.findings);  // { field, value, status, detail? }[] - per-field results
console.log(result.fetchedUrl); // string | null - the URL actually fetched

if (result.errors.length > 0) {
  process.exit(1);
}
```

---

## Example ai-attribution.txt file

```
# ai-attribution.txt - AIACTA Publisher Preferences
# Spec: https://aiacta.org/spec/v1.0
# Validate: npx @aiacta-org/ai-attribution-lint https://yourdomain.com

Schema-Version: 1.0

Contact: ai-licensing@yourdomain.com
Contact: https://yourdomain.com/ai-licensing

Preferred-Attribution: Your Publication Name (yourdomain.com)

# What AI uses you permit
Allow-Purpose: rag
Allow-Purpose: index

# Block training without a separate licence
Disallow-Purpose: training

# Require citation when your content is used
Require-Citation: true
Require-Source-Link: true
Citation-Format: title-and-url

# Real-time citation notifications
Citation-Webhook: https://yourdomain.com/webhooks/ai-citations

# How often crawlers should re-visit
Recrawl-After: 24h

# AAC reward framework
Reward-Tier: standard

# Content licence (full SPDX identifier - not short form)
Content-License: All-Rights-Reserved
```

Place this file at `https://yourdomain.com/.well-known/ai-attribution.txt`.

---

## Common errors and how to fix them

**`Content-License "CC-BY" is not a valid SPDX identifier`**
Short-form SPDX names are not valid. Use the full versioned identifier:
- ❌ `CC-BY` → ✅ `CC-BY-4.0`
- ❌ `CC-BY-SA` → ✅ `CC-BY-SA-4.0`
- ❌ `CC0` → ✅ `CC0-1.0`

**`Allow-Purpose value "RAG" is invalid`**
Purpose values are validated as lowercase. Write them in lowercase in the file:
- ❌ `Allow-Purpose: RAG` → ✅ `Allow-Purpose: rag`

**`Could not fetch ai-attribution.txt`**
The file is not accessible. Check:
1. The file exists at `/.well-known/ai-attribution.txt` on your server
2. Your server is not blocking the path (check `.htaccess` or CDN rules)
3. The file is served with `Content-Type: text/plain`

**`Citation-Webhook ... WARN (endpoint not reachable)`**
The linter sends a HEAD request to your webhook endpoint. A warning here means:
- The server is down or the URL is wrong, check the URL is correct and the server is running
- The server blocks HEAD requests, this is fine at runtime since AI providers send POST, but the linter cannot verify it

---

## Related packages

| Package | Purpose |
|---------|---------|
| [`@aiacta-org/ai-citation-sdk`](https://www.npmjs.com/package/@aiacta-org/ai-citation-sdk) | Receive and verify citation webhook events in your server |
| [`@aiacta-org/crawl-manifest-client`](https://www.npmjs.com/package/@aiacta-org/crawl-manifest-client) | Query AI providers' crawl history for your domain |

---

## License & Copyright

Copyright © 2026 Eric Michel, PhD. Licensed under the [Apache License 2.0](../../LICENSE).

Part of the [AIACTA open standard](https://github.com/aiacta-org/aiacta).
