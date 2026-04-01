/**
 * Runs all validation rules against the parsed config and returns results.
 */
'use strict';
const rules = require('./rules');

function runRules(parsed, target, opts) {
  const errors = [], warnings = [], info = [];
  for (const rule of rules) {
    const findings = rule(parsed, target);
    errors.push(...(findings.errors || []));
    warnings.push(...(findings.warnings || []));
    info.push(...(findings.info || []));
  }
  return { errors, warnings, info };
}

module.exports = { runRules };
