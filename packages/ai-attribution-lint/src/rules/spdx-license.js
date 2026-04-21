/**
 * Rule: Content-License must be a valid SPDX identifier or "All-Rights-Reserved" (§5.4, §10.3).
 *
 * The full SPDX identifier (e.g. CC-BY-SA-4.0, not CC-BY-SA) is required because
 * the distribution engine uses exact key lookup against LICENSE_MULTIPLIERS.
 * Short forms silently fall through to the default multiplier, causing wrong payouts.
 */
'use strict';
const spdxIds = require('spdx-license-ids');

module.exports = function ruleSpdxLicense(parsed) {
  const errors   = [];
  const warnings = [];
  const findings = [];

  const lic = parsed['Content-License'];

  if (!lic) {
    // Content-License is recommended but not required
    warnings.push('Content-License not specified; AAC distribution calculations will use the default multiplier');
    findings.push({ field: 'Content-License', value: '(missing)', status: 'warn', detail: 'recommended — affects AAC distribution multiplier' });
    return { errors, warnings, findings };
  }

  if (lic === 'All-Rights-Reserved') {
    findings.push({ field: 'Content-License', value: lic, status: 'ok', detail: 'all rights reserved — highest distribution multiplier' });
  } else if (spdxIds.includes(lic)) {
    findings.push({ field: 'Content-License', value: lic, status: 'ok', detail: 'valid SPDX identifier' });
  } else {
    errors.push(`Content-License "${lic}" is not a valid SPDX identifier. Use full identifiers like CC-BY-SA-4.0 (not CC-BY-SA). See https://spdx.org/licenses/`);
    findings.push({
      field:  'Content-License',
      value:  lic,
      status: 'error',
      detail: 'not a valid SPDX identifier — use full form e.g. CC-BY-SA-4.0',
    });
  }

  return { errors, warnings, findings };
};
