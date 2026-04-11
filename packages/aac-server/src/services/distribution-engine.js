/**
 * AAC Distribution Engine — implements the §7.5 weight formula:
 *
 *   W(p) = citation_count(p)
 *        × content_license_multiplier(p)
 *        × query_value_weight(p)
 *        × freshness_bonus(p)
 *
 * Then distributes the pool balance proportionally.
 */
'use strict';
const { getDb } = require('../db/database');

// Keys are full SPDX identifiers — must match what publishers write in
// Content-License: and what the linter validates against spdx-license-ids.
// Short forms like 'CC-BY' are NOT valid SPDX — they would never match and
// silently fall through to the default 1.0 multiplier, breaking payouts.
const LICENSE_MULTIPLIERS = {
  'All-Rights-Reserved': 1.0,   // highest — all rights reserved
  'CC-BY-ND-4.0':        0.8,   // no derivatives
  'CC-BY-ND-3.0':        0.8,
  'CC-BY-SA-4.0':        0.7,   // share-alike
  'CC-BY-SA-3.0':        0.7,
  'CC-BY-4.0':           0.5,   // attribution only
  'CC-BY-3.0':           0.5,
  'CC-BY-NC-4.0':        0.6,   // non-commercial
  'CC-BY-NC-3.0':        0.6,
  'Apache-2.0':          0.4,   // permissive open source
  'MIT':                 0.3,
  'CC0-1.0':             0.0,   // public domain — no distribution due
};

const QUERY_VALUE_WEIGHTS = {
  commercial:    2.0,
  technology:    1.5,
  informational: 1.0,
  navigational:  0.5,
};

const FRESHNESS_THRESHOLD_DAYS = 30;
const FRESHNESS_BONUS           = 0.20;

/**
 * @param {object} opts
 * @param {string} opts.period_from   ISO 8601
 * @param {string} opts.period_to     ISO 8601
 * @param {number} opts.pool_balance  Total pool in currency units
 * @returns {Array<{publisher_id, domain, citation_count, weight, amount}>}
 */
function computeDistribution({ period_from, period_to, pool_balance }) {
  const db = getDb();

  // Aggregate citation counts per publisher for the period
  const rows = db.prepare(`
    SELECT e.publisher_id,
           pub.domain,
           pub.content_license,
           COUNT(*) AS citation_count,
           e.query_category,
           MIN(e.event_timestamp) AS earliest_event
    FROM citation_events e
    JOIN publishers pub ON e.publisher_id = pub.id
    WHERE e.event_timestamp BETWEEN ? AND ?
      AND pub.status = 'verified'
    GROUP BY e.publisher_id, e.query_category
  `).all(period_from, period_to);

  // Compute raw weight per (publisher, query_category) row
  const weightMap = new Map();
  for (const row of rows) {
    const licMult  = LICENSE_MULTIPLIERS[row.content_license] ?? 1.0;
    const qvWeight = QUERY_VALUE_WEIGHTS[row.query_category]  ?? 1.0;
    const ageDays  = (new Date(period_to) - new Date(row.earliest_event)) / 86400000;
    const fresh    = ageDays <= FRESHNESS_THRESHOLD_DAYS ? 1 + FRESHNESS_BONUS : 1.0;
    const w        = row.citation_count * licMult * qvWeight * fresh;
    const existing = weightMap.get(row.publisher_id) || { publisher_id: row.publisher_id, domain: row.domain, citation_count: 0, weight: 0 };
    existing.citation_count += row.citation_count;
    existing.weight          += w;
    weightMap.set(row.publisher_id, existing);
  }

  const entries    = [...weightMap.values()];
  const totalWeight= entries.reduce((s, e) => s + e.weight, 0);

  return entries.map(e => ({
    publisher_id:   e.publisher_id,
    domain:         e.domain,
    citation_count: e.citation_count,
    weight:         parseFloat(e.weight.toFixed(6)),
    amount:         totalWeight > 0 ? parseFloat(((e.weight / totalWeight) * pool_balance).toFixed(4)) : 0,
  })).sort((a, b) => b.amount - a.amount);
}

module.exports = { computeDistribution, LICENSE_MULTIPLIERS, QUERY_VALUE_WEIGHTS };
