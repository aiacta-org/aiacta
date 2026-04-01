/** Rule: At least one Contact field should be present (§5.4). */
'use strict';
module.exports = function ruleContact(parsed) {
  const warnings = [];
  if (!parsed['Contact'] || parsed['Contact'].length === 0) {
    warnings.push('No Contact field found; publishers should provide a licensing contact');
  }
  return { errors: [], warnings };
};
