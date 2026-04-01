/**
 * ai-attribution-lint — public API
 * Returns { errors: [], warnings: [], info: [] } for a given URL or file path.
 */
'use strict';
const { fetchContent } = require('./fetcher');
const { parse } = require('./parser');
const { runRules } = require('./runner');

async function lint(target, opts = {}) {
  const raw = await fetchContent(target);
  const parsed = parse(raw);
  return runRules(parsed, target, opts);
}

module.exports = { lint };
