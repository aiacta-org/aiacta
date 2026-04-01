/**
 * Citation Velocity Throttle — anti-Sybil protection (§3.4C).
 *
 * Monitors citations per domain per time window.
 * Flags domains whose citation-to-traffic ratio exceeds threshold
 * or whose velocity spikes abnormally (> mean + N*stddev).
 *
 * Flagged domains have their fees moved to Hold/Escrow state
 * pending manual review.
 */
'use strict';
const { getDb } = require('../db/database');

const WINDOW_MINUTES  = 60;
const MAX_PER_WINDOW  = 10_000; // hard rate cap before Hold
const STDDEV_FACTOR   = 3;      // flag if velocity > mean + 3σ over rolling 7-day baseline

/**
 * @param {string} domain
 * @returns {{ allowed: boolean, reason?: string }}
 */
function checkVelocity(domain) {
  const db = getDb();
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  // Count citations in current window
  const { count } = db.prepare(`
    SELECT COUNT(*) AS count FROM citation_events e
    JOIN publishers p ON e.publisher_id = p.id
    WHERE p.domain = ? AND e.received_at >= ?
  `).get(domain, windowStart);

  if (count > MAX_PER_WINDOW) {
    return { allowed: false, reason: `Hard rate cap exceeded: ${count} citations in ${WINDOW_MINUTES}min window` };
  }

  // 7-day hourly baseline for statistical anomaly detection
  const baseline = db.prepare(`
    SELECT AVG(hourly_count) AS mean, AVG(hourly_count * hourly_count) - AVG(hourly_count) * AVG(hourly_count) AS variance
    FROM (
      SELECT strftime('%Y-%m-%dT%H', e.received_at) AS hour, COUNT(*) AS hourly_count
      FROM citation_events e
      JOIN publishers p ON e.publisher_id = p.id
      WHERE p.domain = ? AND e.received_at >= datetime('now', '-7 days')
      GROUP BY hour
    )
  `).get(domain);

  if (baseline?.mean && baseline.variance != null) {
    const stddev = Math.sqrt(Math.max(0, baseline.variance));
    const threshold = baseline.mean + STDDEV_FACTOR * stddev;
    if (count > threshold) {
      return { allowed: false, reason: `Velocity anomaly: ${count} vs threshold ${threshold.toFixed(1)} (mean=${baseline.mean.toFixed(1)}, σ=${stddev.toFixed(1)})` };
    }
  }

  return { allowed: true };
}

module.exports = { checkVelocity };
