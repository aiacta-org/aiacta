/** Rule: Schema-Version must be present and parseable (§5.4). */
'use strict';
module.exports = function ruleSchemaVersion(parsed) {
  const errors = [], warnings = [];
  if (!parsed['Schema-Version']) {
    warnings.push('Schema-Version field missing; assuming 1.0');
  } else if (parsed['Schema-Version'] !== '1.0') {
    warnings.push(`Unknown Schema-Version "${parsed['Schema-Version']}"; parser may not support all fields`);
  }
  return { errors, warnings };
};
