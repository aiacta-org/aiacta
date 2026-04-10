/**
 * AIACTA Publisher Reference Server — Minimal Implementation
 *
 * This server demonstrates the minimum a publisher website needs to implement
 * the AIACTA framework. It covers three AIACTA proposals:
 *
 *   Proposal 3 — Referrer Headers (§4)
 *     Sets Referrer-Policy: origin on all responses so AI-referred traffic
 *     appears correctly in your analytics.
 *
 *   Proposal 4 — ai-attribution.txt (§5)
 *     Serves /.well-known/ai-attribution.txt declaring your preferences to
 *     AI crawlers (what they may use your content for, how to cite you, etc.)
 *
 *   Proposal 2 — Citation Webhooks (§3.4)
 *     Receives signed citation events from AI providers each time your content
 *     is cited in an AI response. Verifies the HMAC-SHA256 signature before
 *     accepting the event.
 *
 * USAGE:
 *   npm install express
 *   WEBHOOK_SECRET=your-secret-from-provider-portal node server.js
 *
 * TEST:
 *   curl http://localhost:3000/.well-known/ai-attribution.txt
 *   curl http://localhost:3000/health
 */

'use strict';
const express = require('express');
const crypto  = require('crypto');

const app = express();

// ── CONFIG — Edit these values for your site ──────────────────────────────────
const CONFIG = {
  // Your publication's preferred credit line (used by AI in citations)
  preferredAttribution: 'Example Media (example.com)',

  // Contact for AI licensing inquiries
  contact: 'ai-licensing@example.com',

  // HMAC secret issued by each AI provider's Publisher Portal.
  // In production, store securely (env var or secrets manager).
  // Each provider gives you a different secret — store them by provider ID.
  webhookSecret: process.env.WEBHOOK_SECRET || 'dev-secret-change-in-production',
};

// ── PROPOSAL 3: Referrer-Policy header on all responses (§4) ─────────────────
// This ensures that when users click links from AI interfaces to your site,
// the HTTP Referer header correctly identifies the AI platform as the source,
// making AI-referred traffic visible in your analytics.
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'origin');
  next();
});

// ── PROPOSAL 4: Serve ai-attribution.txt (§5) ────────────────────────────────
// This file tells AI crawlers your preferences: what they may use your content
// for, how to cite you, whether to notify you of citations, etc.
// Place this at /.well-known/ai-attribution.txt on your domain.
// Validate with: npx @aiacta-org/ai-attribution-lint https://yourdomain.com --json
app.get('/.well-known/ai-attribution.txt', (req, res) => {
  // The format is plain text: Field-Name: value
  // One field per line. Comments start with #.
  const content = [
    '# ai-attribution.txt — AIACTA Publisher Preferences',
    '# Spec: https://aiacta.org/spec/v1.0',
    '# Validate: npx @aiacta-org/ai-attribution-lint https://yourdomain.com --json',
    '',
    'Schema-Version: 1.0',
    '',
    '# How to contact us for licensing/attribution queries',
    `Contact: ${CONFIG.contact}`,
    '',
    '# How we prefer to be credited in AI responses',
    `Preferred-Attribution: ${CONFIG.preferredAttribution}`,
    '',
    '# What AI uses we allow (rag = real-time queries; index = general indexing)',
    'Allow-Purpose: rag',
    'Allow-Purpose: index',
    '# We do NOT allow use for training new models without a separate licence',
    'Disallow-Purpose: training',
    '',
    '# Require citation when our content is used',
    'Require-Citation: true',
    'Require-Source-Link: true',
    'Citation-Format: title-and-url',
    '',
    '# Real-time citation notifications (Proposal 2)',
    '# Remove or update this if you do not have a webhook endpoint',
    `Citation-Webhook: https://yourdomain.com/webhooks/ai-citations`,
    '',
    '# How often crawlers should re-visit',
    'Recrawl-After: 24h',
    '',
    '# AAC reward framework opt-in (Proposal 5)',
    'Reward-Tier: standard',
    '',
    '# Content licence (SPDX identifier or All-Rights-Reserved)',
    'Content-License: All-Rights-Reserved',
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  // Cache for 24 hours — AI crawlers respect Cache-Control (§5.2)
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(content);
});

// ── PROPOSAL 2: Citation Webhook Receiver (§3.4) ──────────────────────────────
// AI providers POST signed citation events here when they cite your content.
// This endpoint verifies the HMAC-SHA256 signature before processing.
//
// To receive webhooks:
//   1. Register your Citation-Webhook URL with the AI provider's Publisher Portal
//   2. The portal gives you a shared HMAC secret — store it securely
//   3. AI providers POST events to this URL, signed with that secret
//   4. This handler verifies the signature and processes the event

// express.raw() is REQUIRED for signature verification —
// the HMAC is computed over the raw bytes, not the parsed JSON.
app.post(
  '/webhooks/ai-citations',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const timestamp = req.headers['x-ai-webhook-timestamp'];
    const sigHeader = req.headers['x-ai-webhook-sig'];
    const rawBody   = req.body; // Buffer

    // ── Step 1: Verify timestamp is within ±5 minutes (replay attack prevention §3.4)
    const now = Math.floor(Date.now() / 1000);
    if (!timestamp || Math.abs(now - parseInt(timestamp, 10)) > 300) {
      return res.status(400).json({ error: 'Timestamp missing or outside 5-minute tolerance window' });
    }

    // ── Step 2: Verify HMAC-SHA256 signature (§3.4A)
    // The signed payload is: timestamp + "." + raw_json_body
    if (!sigHeader) {
      return res.status(401).json({ error: 'Missing X-AI-Webhook-Sig header' });
    }

    const signedPayload = Buffer.concat([
      Buffer.from(`${timestamp}.`),
      rawBody,
    ]);
    const expected = 'sha256=' + crypto
      .createHmac('sha256', CONFIG.webhookSecret)
      .update(signedPayload)
      .digest('hex');

    // Use constant-time comparison to prevent timing attacks
    let sigValid = false;
    try {
      sigValid = crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(sigHeader),
      );
    } catch (_) {
      // Buffer lengths differ — signature is invalid
    }

    if (!sigValid) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    // ── Step 3: Parse and process the citation event
    let event;
    try {
      event = JSON.parse(rawBody.toString('utf-8'));
    } catch (_) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    // Respond immediately (§3.5 — publisher must respond within 10 seconds)
    // Process the event asynchronously after responding
    res.status(200).json({ status: 'accepted' });

    // ── Step 4: Do something with the citation event (async, after 200 sent)
    // Replace the console.log below with your actual storage/analytics logic:
    //   - Save to a database
    //   - Post to Slack
    //   - Update your analytics dashboard
    //   - Trigger a billing/revenue report
    setImmediate(() => {
      console.log('[aiacta] Citation received:', {
        provider:      event.provider,
        event_id:      event.event_id,
        cited_url:     event.citation?.url,
        citation_type: event.citation?.citation_type,
        timestamp:     event.timestamp,
        user_country:  event.citation?.user_country,
      });
      // TODO: replace with: await db.citations.insert(event);
    });
  }
);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    aiacta_proposals_implemented: ['2 (webhooks)', '3 (referrer)', '4 (ai-attribution.txt)'],
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AIACTA publisher server running on port ${PORT}`);
  console.log(`  Test: curl http://localhost:${PORT}/.well-known/ai-attribution.txt`);
  console.log(`  Health: curl http://localhost:${PORT}/health`);
});

module.exports = app; // exported for testing
