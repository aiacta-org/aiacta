# AIACTA Compliance Tiers (§8.4)

| Tier | Requirements | Estimated Effort |
|---|---|---|
| **Bronze** | Referrer-Policy: origin on outbound links + parse ai-attribution.txt | ~1 week |
| **Silver** | Bronze + Crawl Manifest API + X-AIACTA-Crawl-Purpose headers | ~6–10 weeks |
| **Gold** | Silver + Citation Webhook API (push or pull) | ~14–22 weeks |
| **Platinum** | Gold + AAC participation + annual independent audit | Organisational |

## Bronze

- Set `Referrer-Policy: origin` (or `strict-origin`) on all outbound link responses.
- Parse `ai-attribution.txt` / `.well-known/ai-attribution.txt` at crawl time.
- Respect `Allow-Purpose` / `Disallow-Purpose` directives.
- Honour `Require-Citation` and `Require-Source-Link` preferences.

## Silver

- Implement `GET /crawl-manifest/v1` with pagination, rate limiting, and domain verification.
- Send `X-AIACTA-Crawl-Purpose` and `X-AIACTA-Crawl-Session` headers at crawl time.
- Maintain crawl logs for at least 90 days.

## Gold

- Implement the Citation Webhook push API (§3.2) with HMAC-SHA256 signing, idempotency keys, and the 6-attempt retry schedule.
- **OR** expose the pull API `GET /citations/v1` with 90-day event retention.
- Implement batch delivery for high-volume publishers (§3.6).

## Platinum (Full Framework)

- All Gold requirements.
- Enrol in the AI Attribution Collective (AAC) under either RPA or PCF contribution model (§7.4).
- Submit citation feeds to the AAC server for distribution calculation.
- Pass annual third-party audit by an AAC-contracted auditing firm.
- Eligible for the Platinum safe-harbour designation (§8.4).
