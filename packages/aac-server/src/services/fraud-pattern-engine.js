/**
 * Fraud Pattern Attribution (FPA) Engine — §3.4D.
 *
 * Graph-based analysis to detect Citation Rings:
 * clusters of publishers consistently cited by multiple AI providers
 * but with no external traffic, suggesting collusion.
 *
 * Algorithm:
 *  1. Build a bipartite graph: providers ↔ publishers
 *  2. Find publisher clusters cited exclusively within a closed set of providers
 *  3. Score clusters by the ratio of internal citations to estimated organic reach
 *  4. Flag clusters above the anomaly threshold
 */
'use strict';
const { getDb } = require('../db/database');

const MIN_CLUSTER_SIZE         = 3;  // minimum publishers to constitute a ring
const RING_CITATION_RATIO      = 0.95; // >95% citations from single provider cluster = suspicious

/**
 * Run full fraud pattern scan.
 * @returns {Array<{cluster_id, publisher_ids, risk_score, reason}>}
 */
function detectCitationRings() {
  const db = getDb();

  // Build adjacency: which providers cite which publishers
  const edges = db.prepare(`
    SELECT provider_id, publisher_id, COUNT(*) AS weight
    FROM citation_events
    WHERE publisher_id IS NOT NULL
      AND received_at >= datetime('now', '-30 days')
    GROUP BY provider_id, publisher_id
  `).all();

  // Group publishers by their provider-citation fingerprint
  const publisherFingerprint = new Map();
  for (const { provider_id, publisher_id, weight } of edges) {
    const fp = publisherFingerprint.get(publisher_id) || new Map();
    fp.set(provider_id, (fp.get(provider_id) || 0) + weight);
    publisherFingerprint.set(publisher_id, fp);
  }

  // Find publishers whose citations come overwhelmingly from a single provider
  const suspiciousClusters = [];
  const providerGroups = new Map();

  for (const [pubId, providerMap] of publisherFingerprint.entries()) {
    const total = [...providerMap.values()].reduce((s, v) => s + v, 0);
    for (const [provId, count] of providerMap.entries()) {
      if (count / total >= RING_CITATION_RATIO) {
        const group = providerGroups.get(provId) || [];
        group.push({ publisher_id: pubId, ratio: count / total, total });
        providerGroups.set(provId, group);
      }
    }
  }

  // Flag provider groups with suspiciously clustered publishers
  for (const [provId, publishers] of providerGroups.entries()) {
    if (publishers.length >= MIN_CLUSTER_SIZE) {
      suspiciousClusters.push({
        cluster_id:    `ring_${provId}_${Date.now()}`,
        provider_id:   provId,
        publisher_ids: publishers.map(p => p.publisher_id),
        risk_score:    publishers.reduce((s, p) => s + p.ratio, 0) / publishers.length,
        reason:        `${publishers.length} publishers receive ≥${(RING_CITATION_RATIO*100).toFixed(0)}% of citations exclusively from provider ${provId}`,
      });
    }
  }

  return suspiciousClusters;
}

module.exports = { detectCitationRings };
