/** Rule: Allow-Purpose and Disallow-Purpose must use valid enum values (§5.4). */
'use strict';
const VALID = new Set(['training', 'rag', 'index', 'quality-eval']);
function validatePurposeField(values, fieldName) {
  const errors = [];
  for (const v of (values || [])) {
    if (!VALID.has(v.toLowerCase())) {
      errors.push(`Invalid ${fieldName} value "${v}"; allowed: ${[...VALID].join(', ')}`);
    }
  }
  return errors;
}
module.exports = function rulePurpose(parsed) {
  return {
    errors: [
      ...validatePurposeField(parsed['Allow-Purpose'], 'Allow-Purpose'),
      ...validatePurposeField(parsed['Disallow-Purpose'], 'Disallow-Purpose'),
    ],
    warnings: [],
  };
};
