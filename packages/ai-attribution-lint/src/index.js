/**
 * ai-attribution-lint — public API
 *
 * Returns:
 *   errors[]   — blocking validation failures
 *   warnings[] — advisory issues
 *   info[]     — informational notes
 *   findings[] — per-field structured results for CLI display
 *   fetchedUrl — the resolved URL that was actually fetched (for display)
 */
'use strict';
const { fetchContent } = require('./fetcher');
const { parse }        = require('./parser');
const { runRules }     = require('./runner');

async function lint(target, opts = {}) {
  const { raw, resolvedUrl } = await fetchContent(target);
  const parsed = parse(raw);
  const result = await runRules(parsed, resolvedUrl || target, opts);
  // Expose the resolved URL so cli.js can show "Fetching: <url> ... OK"
  result.fetchedUrl = resolvedUrl || null;
  return result;
}

module.exports = { lint };
