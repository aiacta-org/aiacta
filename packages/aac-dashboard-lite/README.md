# aac-dashboard-lite

> Self-hosted React analytics dashboard — see your AIACTA citation stats across all AI providers in one place (§3.7, §9.4 Lite Tier). No backend required.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../../LICENSE)

---

## What is this?

A no-code analytics dashboard that aggregates your citation events from multiple AI providers' pull APIs and displays them as charts. Publishers run it on their own computer or host it on any static server.

It shows you:
- Which of your articles are being cited by AI systems
- Which AI platforms cite you most
- Citation trends over time
- An estimated AAC distribution calculation based on the §7.5 formula

---

## Quick Start

### Option A — Run locally (zero deployment)

```bash
git clone https://github.com/aiacta-org/aiacta.git
cd aiacta/packages/aac-dashboard-lite
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Option B — Deploy to Vercel or Netlify (free)

```bash
# Build the static files
npm run build
# Upload the dist/ folder to Vercel, Netlify, Cloudflare Pages, or any static host
```

---

## How to use it

1. Open the dashboard
2. Enter your domain (e.g. `yourdomain.com`)
3. For each AI provider you want to query, paste your API key from their Publisher Portal
4. Click "Load Citations" — the dashboard fetches and displays your data

**Your API keys never leave your browser.** The dashboard calls AI provider APIs directly from your browser using the keys you enter. Nothing is sent to AIACTA servers.

---

## What you need

- **Publisher API keys** from each AI provider's Publisher Portal (similar to Google Search Console). You get these by registering your domain with each provider and completing domain verification.
- A modern web browser

---

## Build & customise

```bash
npm install          # Install dependencies
npm run dev          # Development server at localhost:5173
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
npm test             # Run tests with Vitest
```

The dashboard is a standard Vite + React application. Edit `src/components/` to customise the UI.

---

## License & Copyright

Copyright © 2026 Eric Michel, PhD. Licensed under the [Apache License 2.0](../../LICENSE).

Part of the [AIACTA open standard](https://github.com/aiacta-org/aiacta).
