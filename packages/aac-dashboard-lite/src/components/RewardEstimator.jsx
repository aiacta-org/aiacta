import { computeWeight, distributePool } from '../utils/distribution';
export default function RewardEstimator({ citations, contentLicense, poolBalance = 100000 }) {
  const publishers = citations.map(c => ({ id: c.citation?.url || c.url, weight: computeWeight({ citationCount: 1, contentLicense, queryCategory: 'informational', contentAge: new Date(), citationDate: new Date(c.timestamp) }) }));
  const distribution = distributePool(publishers, poolBalance);
  const total = distribution.reduce((s, d) => s + d.amount, 0);
  return <div><h3>Estimated AAC Distribution</h3><p>Pool: ${poolBalance.toLocaleString()} | Your share: ${total.toFixed(4)}</p></div>;
}
