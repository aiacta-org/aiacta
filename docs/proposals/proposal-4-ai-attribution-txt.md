# Proposal 4 — The ai-attribution.txt Standard

**Status:** Open Specification v1.0
**Section:** §5

## Summary

A machine-readable, file-based standard for publishers to declare AI content preferences, attribution requirements, and licensing contact information.

## File Location

```
https://example.com/.well-known/ai-attribution.txt  (preferred)
https://example.com/ai-attribution.txt              (fallback)
```

## Full Field Reference

See [`shared/schemas/ai-attribution-txt.schema.json`](../../shared/schemas/ai-attribution-txt.schema.json) and §5.4 of the whitepaper.

## Validation

```bash
npx @aiacta-org/ai-attribution-lint https://example.com
npx @aiacta-org/ai-attribution-lint ./path/to/ai-attribution.txt --json --strict
```

Source: [`packages/ai-attribution-lint`](../../packages/ai-attribution-lint)

## Precedence Rules

1. `robots.txt` Disallow > `ai-attribution.txt` Allow-Purpose
2. `ai-attribution.txt` Disallow-Purpose restricts even when `robots.txt` allows the bot
3. If absent, all defaults apply (all purposes allowed, no citation required)

## Versioning

- Semantic versioning (MAJOR.MINOR)
- Compliant systems must support current and immediately prior MAJOR versions
- Unknown fields must be silently ignored (forward compatibility)
