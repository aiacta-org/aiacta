/**
 * Rule: Allow-Purpose and Disallow-Purpose must use valid enum values (§5.4).
 *
 * Valid values: training | rag | index | quality-eval
 *
 * Note: values are case-insensitive in the file format. We normalise to
 * lowercase for validation and display the original casing in the finding.
 */
'use strict';

const VALID       = new Set(['training', 'rag', 'index', 'quality-eval']);
const DESCRIPTION = {
  training:     'use for model training',
  rag:          'real-time retrieval-augmented generation',
  index:        'general search indexing',
  'quality-eval': 'benchmark / RLHF evaluation',
};

function validatePurposeField(values, fieldName, findings, errors) {
  for (const v of (values || [])) {
    const norm = v.toLowerCase();
    if (VALID.has(norm)) {
      findings.push({
        field:  fieldName,
        value:  v,
        status: 'ok',
        detail: DESCRIPTION[norm] || null,
      });
    } else {
      errors.push(`Invalid ${fieldName} value "${v}"; allowed: ${[...VALID].join(', ')}`);
      findings.push({
        field:  fieldName,
        value:  v,
        status: 'error',
        detail: `invalid — allowed: ${[...VALID].join(', ')}`,
      });
    }
  }
}

module.exports = function rulePurpose(parsed) {
  const errors   = [];
  const findings = [];

  validatePurposeField(parsed['Allow-Purpose'],    'Allow-Purpose',    findings, errors);
  validatePurposeField(parsed['Disallow-Purpose'], 'Disallow-Purpose', findings, errors);

  return { errors, warnings: [], findings };
};
