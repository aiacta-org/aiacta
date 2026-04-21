/** Rule: Schema-Version must be present and equal to "1.0" (§5.4). */
'use strict';

module.exports = function ruleSchemaVersion(parsed) {
  const errors   = [];
  const warnings = [];
  const findings = [];

  const ver = parsed['Schema-Version'];

  if (!ver) {
    warnings.push('Schema-Version field missing; assuming 1.0');
    findings.push({ field: 'Schema-Version', value: '(missing)', status: 'warn', detail: 'field missing; assuming 1.0' });
  } else if (ver !== '1.0') {
    warnings.push(`Unknown Schema-Version "${ver}"; parser may not support all fields`);
    findings.push({ field: 'Schema-Version', value: ver, status: 'warn', detail: 'unknown version — parser may not support all fields' });
  } else {
    findings.push({ field: 'Schema-Version', value: ver, status: 'ok' });
  }

  return { errors, warnings, findings };
};
