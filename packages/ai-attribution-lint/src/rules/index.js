/** Aggregates all validation rules. Order matters — later rules may depend on earlier parsing. */
'use strict';
module.exports = [
  require('./schema-version'),
  require('./contact'),
  require('./purpose'),
  require('./spdx-license'),
  require('./webhook-reachability'),
  require('./reward-tier'),
  require('./robots-txt-conflict'),
];
