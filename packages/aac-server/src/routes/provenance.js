/**
 * Provenance Query API for law enforcement and fact-checking (§9.5.1).
 *
 * POST /v1/provenance/query             — Submit a PoI token to trace content sources
 * GET  /v1/provenance/audit-trail/*url  — Full citation audit trail for a URL
 *
 * Access requires an authorised law enforcement / fact-checker API key.
 *
 * NOTE on route syntax (Express 5 + path-to-regexp v8):
 *   Old Express 4 syntax  :url(.*)  — BROKEN in path-to-regexp v8
 *   New Express 5 syntax  *url      — named wildcard, captures everything
 */
'use strict';
const express = require('express');
const { getDb } = require('../db/database');

const router = express.Router();

// Middleware: validate LE/fact-checker API key
router.use((req, res, next) => {
  const key = req.headers['x-aiacta-provenance-key'];
  if (!key || key !== process.env.PROVENANCE_API_KEY) {
    return res.status(401).json({ error: 'Authorised access only — contact AAC governance body' });
  }
  next();
});

/**
 * POST /v1/provenance/query
 * Body: { poi_token: string, from?: string, to?: string }
 *
 * We currently support exact-match lookups against stored identifiers.
 * A dedicated poi_token column would be a better long-term design than
 * relying on idempotency_key/id matching semantics.
 */
router.post('/query', (req, res) => {
  const { poi_token, from, to } = req.body;
  if (!poi_token) return res.status(400).json({ error: 'poi_token required' });
  const rows = getDb().prepare(`
    SELECT id, idempotency_key, provider_id, cited_url, citation_type, query_category, model, event_timestamp
    FROM citation_events
    WHERE (idempotency_key = ? OR id = ?)
      AND (? IS NULL OR event_timestamp >= ?)
      AND (? IS NULL OR event_timestamp <= ?)
    LIMIT 500
  `).all(poi_token, poi_token, from ?? null, from ?? null, to ?? null, to ?? null);
  res.json({ poi_token, matched_events: rows, count: rows.length });
});

/**
 * GET /v1/provenance/audit-trail/*url
 * Returns all citation events for a given content URL.
 *
 * Express 5 / path-to-regexp v8 wildcard syntax:
 *   *url  — named wildcard parameter, accessed via req.params.url
 *   This replaces the old :url(.*) syntax which throws in path-to-regexp v8.
 */
router.get('/audit-trail/*url', (req, res) => {
  const url = decodeURIComponent(req.params.url);
  const rows = getDb().prepare(`
    SELECT e.id, e.idempotency_key, e.provider_id, p.name AS provider_name,
           e.cited_url, e.citation_type, e.query_category,
           e.model, e.event_timestamp
    FROM citation_events e
    LEFT JOIN providers p ON e.provider_id = p.id
    WHERE e.cited_url = ?
    ORDER BY e.event_timestamp DESC
    LIMIT 1000
  `).all(url);
  res.json({ url, audit_trail: rows, count: rows.length });
});

module.exports = router;
