/** Rule: Reward-Tier must be a valid enum value (§5.4). */
'use strict';
const VALID = new Set(['standard', 'premium', 'licensing-only', 'none']);
module.exports = function ruleRewardTier(parsed) {
  const errors = [];
  const tier = parsed['Reward-Tier'];
  if (tier && !VALID.has(tier.toLowerCase())) {
    errors.push(`Invalid Reward-Tier "${tier}"; allowed: ${[...VALID].join(', ')}`);
  }
  return { errors, warnings: [] };
};
