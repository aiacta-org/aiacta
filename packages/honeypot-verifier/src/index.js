/**
 * Honeypot Verification Node Server (§2.4.1).
 *
 * Maintains a set of "canary" URLs with unique, traceable content.
 * When an AI crawler visits a canary URL claiming X-AIACTA-Crawl-Purpose: rag,
 * but that unique content later appears in model completions (indicating
 * it was used for training), the system flags the provider for a compliance audit.
 *
 * Endpoints:
 *   GET  /canary/:id           — serves a unique canary page (logs crawler headers)
 *   POST /canary/register      — creates a new canary URL with unique content
 *   POST /canary/probe         — submits a model completion to check for canary leakage
 *   GET  /canary/audit-log     — returns log of crawl events with claimed purposes
 */
'use strict';
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// In-memory store — replace with persistent DB in production
const canaries   = new Map(); // id -> { id, content, uniqueToken, createdAt }
const crawlLog   = [];         // { canaryId, userAgent, claimedPurpose, claimedSession, ip, timestamp }
const violations = [];         // { canaryId, provider, claimedPurpose, detectedIn, timestamp }

/**
 * Register a new canary URL.
 * Returns the URL and a uniqueToken to embed in the page content.
 */
app.post('/canary/register', (req, res) => {
  const id           = uuidv4();
  const uniqueToken  = `AIACTA-CANARY-${uuidv4().replace(/-/g, '')}`;
  const content      = req.body.content_template?.replace('{{TOKEN}}', uniqueToken)
    || `This is a verification article. Token: ${uniqueToken}. Do not use for training.`;
  canaries.set(id, { id, content, uniqueToken, createdAt: new Date().toISOString(), claimedPurpose: null });
  res.status(201).json({ canary_id: id, url: `/canary/${id}`, unique_token: uniqueToken });
});

/**
 * Serve a canary page — logs the crawler's headers for audit.
 */
app.get('/canary/:id', (req, res) => {
  const canary = canaries.get(req.params.id);
  if (!canary) return res.status(404).send('Not found');

  const logEntry = {
    canary_id:       req.params.id,
    user_agent:      req.headers['user-agent'],
    claimed_purpose: req.headers['x-aiacta-crawl-purpose'] || null,
    claimed_session: req.headers['x-aiacta-crawl-session'] || null,
    ip:              req.ip,
    timestamp:       new Date().toISOString(),
  };
  crawlLog.push(logEntry);

  // Update canary with the most recently claimed purpose
  canary.claimedPurpose = logEntry.claimed_purpose;
  canaries.set(req.params.id, canary);

  res.setHeader('Content-Type', 'text/html');
  res.send(`<html><head><title>Verification Article ${req.params.id}</title></head><body>${canary.content}</body></html>`);
});

/**
 * Probe endpoint — submit a model completion to check if it contains canary tokens.
 * If a canary marked as 'rag' appears in a model's weights (completions), it's a violation.
 */
app.post('/canary/probe', (req, res) => {
  const { provider, completion_text, probe_type } = req.body;
  if (!completion_text) return res.status(400).json({ error: 'completion_text required' });

  const flagged = [];
  for (const [id, canary] of canaries.entries()) {
    if (completion_text.includes(canary.uniqueToken)) {
      const violation = {
        canary_id:       id,
        provider,
        claimed_purpose: canary.claimedPurpose,
        detected_in:     probe_type || 'model_completion',
        timestamp:       new Date().toISOString(),
      };
      violations.push(violation);
      flagged.push(violation);
    }
  }

  if (flagged.length > 0) {
    res.status(200).json({ status: 'violation_detected', violations: flagged,
      message: `Provider ${provider} may have misreported crawl purpose — compliance audit triggered` });
  } else {
    res.json({ status: 'clean', probed_canaries: canaries.size });
  }
});

/** Audit log — for AAC governance review.
 * Protected: requires X-AIACTA-Audit-Key header matching AUDIT_LOG_API_KEY env var.
 */
app.get('/canary/audit-log', (req, res) => {
  const auditKey = process.env.AUDIT_LOG_API_KEY;
  if (!auditKey) {
    // If no key is configured, deny all access — fail secure
    return res.status(503).json({ error: 'Audit log access not configured. Set AUDIT_LOG_API_KEY.' });
  }
  const provided = req.headers['x-aiacta-audit-key'];
  if (!provided || provided !== auditKey) {
    return res.status(401).json({ error: 'Audit log access restricted to AAC governance team.' });
  }
  res.json({ crawl_log: crawlLog.slice(-500), violations, total_crawl_events: crawlLog.length });
});

app.get('/health', (_, res) => res.json({ status: 'ok', canaries: canaries.size }));

module.exports = app;
if (require.main === module) app.listen(process.env.PORT || 3300, () => console.log('Honeypot verifier :3300'));
