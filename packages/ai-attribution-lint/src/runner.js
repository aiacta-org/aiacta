/**
 * Runs all validation rules against the parsed config and returns results.
 *
 * Rules may be sync or async (e.g. webhook-reachability does a network call).
 * We await all rules so async ones — like ruleWebhookReachability — actually
 * run to completion instead of silently returning an unresolved Promise.
 */
'use strict';
const rules = require('./rules');

async function runRules(parsed, target, opts) {
  const errors = [], warnings = [], info = [];
  for (const rule of rules) {
    // await handles both sync rules (returns plain object) and
    // async rules (returns Promise<object>) uniformly
    const findings = await rule(parsed, target);
    errors.push(...(findings.errors || []));
    warnings.push(...(findings.warnings || []));
    info.push(...(findings.info || []));
  }
  return { errors, warnings, info };
}

module.exports = { runRules };
