/**
 * Citation ingestion and summary endpoints.
 *
 * POST /v1/citations/ingest   — Single event or batch (§3.2, §3.6)
 * GET  /v1/citations/summary  — Aggregated stats per publisher for a period
 * GET  /v1/citations/pull     — Pull API for publishers (§3.7)
 */
'use strict';
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const { classifyQuery } = require('../services/query-classifier');

const router = express.Router();

// Pull API retention periods (§3.7)
const RETENTION_STANDARD_DAYS   = 90;
const RETENTION_ENTERPRISE_DAYS = 365;

/**
 * Ingest a single citation event or a batch (§3.6: up to 100 events per batch).
 */
router.post('/ingest', (req, res) => {
  const body   = req.body;
  const events = body.events ? body.events : [body];

  if (events.length > 100) {
    return res.status(400).json({ error: 'Batch size exceeds 100 events (§3.6)' });
  }

  const db     = getDb();
  const insert = db.prepare(`
    INSERT OR IGNORE INTO citation_events
      (id, idempotency_key, provider_id, publisher_id, cited_url, citation_type,
       query_category, query_type, model, user_country, event_timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((evts) => {
    const results = [];
    let insertedCount = 0;
    let duplicateCount = 0;

    for (const e of evts) {
      const url     = e.citation?.url ?? '';
      let domain = null;
      try { domain = url ? new URL(url).hostname : null; } catch (_) {}
      const pub     = domain ? db.prepare('SELECT id FROM publishers WHERE domain = ?').get(domain) : null;
      const qType   = classifyQuery({
        queryCategoryL1: e.citation?.query_category_l1,
        queryCategoryL2: e.citation?.query_category_l2,
        citationType:    e.citation?.citation_type,
      });
      const info = insert.run(
        uuidv4(),
        e.idempotency_key,
        e.provider ?? e.provider_id ?? 'unknown',
        pub?.id ?? null,
        url,
        e.citation?.citation_type ?? 'unknown',
        e.citation?.query_category_l1 ?? null,
        qType,
        e.citation?.model ?? null,
        e.citation?.user_country ?? null,
        e.timestamp
      );

      if (info.changes === 1) insertedCount++;
      else duplicateCount++;

      results.push({
        idempotency_key: e.idempotency_key,
        query_type: qType,
        status: info.changes === 1 ? 'inserted' : 'duplicate',
      });
    }
    return { results, insertedCount, duplicateCount };
  });

  try {
    const { results, insertedCount, duplicateCount } = insertMany(events);
    res.status(202).json({
      accepted: insertedCount,
      duplicates: duplicateCount,
      total_received: events.length,
      // Includes both inserted and duplicate events so callers can reconcile
      // the outcome of every submitted idempotency key.
      classifications: results,
    });
  } catch (err) {
    console.error('[citations] ingest error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Summary — content-dependent queries only (§7.4: logical/utility excluded).
 */
router.get('/summary', (req, res) => {
  const { from, to, publisher_id, include_logical } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to query params are required' });

  const queryTypeFilter = include_logical === 'true' ? null : 'content_dependent';
  const rows = getDb().prepare(`
    SELECT publisher_id, COUNT(*) AS citation_count,
           query_category, citation_type, query_type
    FROM citation_events
    WHERE event_timestamp BETWEEN ? AND ?
      AND (? IS NULL OR publisher_id = ?)
      AND (? IS NULL OR query_type = ?)
    GROUP BY publisher_id, query_category, citation_type, query_type
  `).all(from, to, publisher_id ?? null, publisher_id ?? null, queryTypeFilter, queryTypeFilter);

  res.json({
    period: { from, to },
    note: 'content_dependent citations only (§7.4). Use ?include_logical=true to include all.',
    summary: rows,
  });
});

/**
 * Pull API — for publishers who cannot host a webhook endpoint (§3.7).
 *
 * Events are retained for 90 days (standard) or 365 days (enterprise).
 * Publishers query with their domain and API key.
 */
router.get('/pull', (req, res) => {
  const { domain, since, cursor, limit = 1000, tier = 'standard' } = req.query;
  if (!domain) return res.status(400).json({ error: 'domain is required' });

  const retentionDays = tier === 'enterprise' ? RETENTION_ENTERPRISE_DAYS : RETENTION_STANDARD_DAYS;
  const cutoff        = new Date(Date.now() - retentionDays * 86400_000).toISOString();

  const pub = getDb().prepare('SELECT id FROM publishers WHERE domain = ?').get(domain);
  if (!pub) return res.status(404).json({ error: 'Publisher not found. Register at POST /v1/enrollment/publishers' });

  const pageLimit = Math.min(parseInt(limit, 10) || 1000, 1000);
  const rows = getDb().prepare(`
    SELECT id, idempotency_key, provider_id, cited_url, citation_type,
           query_category, query_type, model, user_country, event_timestamp, received_at
    FROM citation_events
    WHERE publisher_id = ?
      AND received_at >= ?
      AND (? IS NULL OR event_timestamp >= ?)
      AND (? IS NULL OR id > ?)
    ORDER BY id ASC
    LIMIT ?
  `).all(
    pub.id,
    cutoff,
    since ?? null,
    since ?? null,
    cursor ?? null,
    cursor ?? null,
    pageLimit + 1
  );

  const hasMore = rows.length > pageLimit;
  const events  = hasMore ? rows.slice(0, pageLimit) : rows;

  res.json({
    domain,
    retention_days: retentionDays,
    events,
    next_cursor: hasMore ? events[events.length - 1].id : null,
    count: events.length,
  });
});

module.exports = router;
