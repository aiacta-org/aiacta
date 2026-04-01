/** Rule: Content-License must be a valid SPDX identifier (§5.4, §10.3). */
'use strict';
const spdxIds = require('spdx-license-ids');
module.exports = function ruleSpdxLicense(parsed) {
  const errors = [], warnings = [];
  const lic = parsed['Content-License'];
  if (lic && lic !== 'All-Rights-Reserved' && !spdxIds.includes(lic)) {
    errors.push(`Content-License "${lic}" is not a valid SPDX identifier. See https://spdx.org/licenses/`);
  }
  return { errors, warnings };
};
