/**
 * Rule: Reward-Tier must be a valid enum value (§5.4, §7).
 *
 * Valid values:
 *   standard       — opt in to regular AAC pool distributions
 *   premium        — higher distribution multiplier tier (requires AAC approval)
 *   licensing-only — prefers direct licensing over AAC pool
 *   none           — opts out of AAC distributions entirely
 */
'use strict';

const VALID = new Set(['standard', 'premium', 'licensing-only', 'none']);

const DESCRIPTION = {
  'standard':       'opt-in to AAC distributions',
  'premium':        'premium tier — higher multiplier (requires AAC approval)',
  'licensing-only': 'direct licensing preferred — excluded from AAC pool',
  'none':           'opted out of AAC distributions',
};

module.exports = function ruleRewardTier(parsed) {
  const errors   = [];
  const findings = [];

  const tier = parsed['Reward-Tier'];

  if (!tier) {
    // Reward-Tier is optional; absence means not participating
    return { errors, warnings: [], findings };
  }

  const norm = tier.toLowerCase();

  if (VALID.has(norm)) {
    findings.push({
      field:  'Reward-Tier',
      value:  tier,
      status: 'ok',
      detail: DESCRIPTION[norm] || null,
    });
  } else {
    errors.push(`Invalid Reward-Tier "${tier}"; allowed: ${[...VALID].join(', ')}`);
    findings.push({
      field:  'Reward-Tier',
      value:  tier,
      status: 'error',
      detail: `invalid — allowed: ${[...VALID].join(', ')}`,
    });
  }

  return { errors, warnings: [], findings };
};
