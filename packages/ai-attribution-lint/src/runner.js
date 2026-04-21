/**
 * Runs all validation rules and aggregates results.
 *
 * Each rule may return:
 *   errors[]   — blocking issues (exit 1)
 *   warnings[] — advisory issues (exit 0, or 1 with --strict)
 *   info[]     — informational notes
 *   findings[] — per-field structured results for the CLI display:
 *                { field, value, status: 'ok'|'warn'|'error', detail? }
 *
 * The findings array is what drives the per-line output in the whitepaper:
 *   Schema-Version: 1.0 ... OK
 *   Contact: licensing@example.com ... OK (valid email)
 *   Citation-Webhook: https://... ... WARN (endpoint not reachable)
 */
'use strict';
const rules = require('./rules');

async function runRules(parsed, target, opts) {
  const errors   = [];
  const warnings = [];
  const info     = [];
  const findings = [];

  for (const rule of rules) {
    const result = await rule(parsed, target);
    errors.push(...(result.errors   || []));
    warnings.push(...(result.warnings || []));
    info.push(...(result.info || []));
    findings.push(...(result.findings || []));
  }

  return { errors, warnings, info, findings };
}

module.exports = { runRules };
