/** AAC distribution weight formula (§7.5). */
export const LICENSE_MULTIPLIERS = {
  'All-Rights-Reserved': 1.0, 'CC-BY-ND': 0.8, 'CC-BY-SA': 0.7, 'CC-BY': 0.5, 'CC0': 0.0,
};
export const QUERY_VALUE_WEIGHTS = { commercial: 2.0, informational: 1.0, navigational: 0.5 };

export function computeWeight({ citationCount, contentLicense, queryCategory, contentAge, citationDate }) {
  const licMult  = LICENSE_MULTIPLIERS[contentLicense] ?? 1.0;
  const qvWeight = QUERY_VALUE_WEIGHTS[queryCategory]  ?? 1.0;
  const ageDays  = (citationDate - contentAge) / (1000 * 60 * 60 * 24);
  const fresh    = ageDays <= 30 ? 1.2 : 1.0;
  return citationCount * licMult * qvWeight * fresh;
}

export function distributePool(publishers, poolBalance) {
  const total = publishers.reduce((s, p) => s + p.weight, 0);
  return publishers.map(p => ({ id: p.id, amount: total ? (p.weight / total) * poolBalance : 0 }));
}
