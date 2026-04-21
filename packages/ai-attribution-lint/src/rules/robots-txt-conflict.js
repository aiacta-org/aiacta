/**
 * Rule: robots.txt conflict checker (§5.5).
 *
 * Verifies that ai-attribution.txt Allow-Purpose directives do not conflict
 * with Disallow rules in the site's robots.txt. robots.txt Disallow takes
 * precedence over ai-attribution.txt Allow-Purpose (§5.5).
 *
 * Issues a WARNING when there is a full-site Disallow, INFO for partial blocks.
 */
'use strict';
const axios   = require('axios');
const { URL } = require('url');

const KNOWN_AI_BOTS = [
  'GPTBot', 'ClaudeBot', 'Google-Extended', 'PerplexityBot',
  'Grok-Bot', 'CCBot', 'Bytespider', 'Diffbot',
];

/**
 * Minimal robots.txt parser — extracts Disallow rules for known AI bots only.
 * Not a full RFC 9309 implementation; handles User-agent: * and known bot names.
 */
function parseRobotsForAiBots(robotsTxt) {
  const disallowed = new Set();
  const lines      = robotsTxt.split('\n').map(l => l.trim());
  let inAiBlock    = false;

  for (const line of lines) {
    if (!line || line.startsWith('#')) { inAiBlock = false; continue; }

    if (line.toLowerCase().startsWith('user-agent:')) {
      const ua = line.slice('user-agent:'.length).trim();
      inAiBlock = ua === '*' || KNOWN_AI_BOTS.some(b => ua.toLowerCase().includes(b.toLowerCase()));
      continue;
    }

    if (inAiBlock && line.toLowerCase().startsWith('disallow:')) {
      const p = line.slice('disallow:'.length).trim();
      if (p) disallowed.add(p);
    }
  }
  return disallowed;
}

module.exports = async function ruleRobotsTxtConflict(parsed, target) {
  const warnings = [];
  const info     = [];
  const findings = [];

  const allowPurpose = parsed['Allow-Purpose'] || [];
  if (allowPurpose.length === 0) return { errors: [], warnings, info, findings };
  if (!target || !target.startsWith('http')) return { errors: [], warnings, info, findings };

  let origin;
  try {
    origin = new URL(target.replace(/\/?(\.well-known\/ai-attribution\.txt|ai-attribution\.txt)\s*$/, '').replace(/\/$/, '')).origin;
  } catch (_) { return { errors: [], warnings, info, findings }; }

  try {
    const res = await axios.get(`${origin}/robots.txt`, {
      timeout: 8_000,
      responseType: 'text',
      validateStatus: s => s === 200,
    });
    const disallowed = parseRobotsForAiBots(res.data);

    if (disallowed.has('/') || disallowed.has('/*')) {
      const msg =
        `robots.txt Disallow: / blocks all AI bots, overriding Allow-Purpose: ${allowPurpose.join(', ')} — ` +
        `robots.txt takes precedence (§5.5)`;
      warnings.push(msg);
      findings.push({ field: 'robots.txt', value: 'Disallow: /', status: 'warn', detail: 'overrides Allow-Purpose — AI bots are blocked site-wide' });
    } else if (disallowed.size > 0) {
      const paths = [...disallowed].slice(0, 3).join(', ') + (disallowed.size > 3 ? '...' : '');
      const msg = `robots.txt restricts AI bots from ${disallowed.size} path(s): ${paths}. These paths override Allow-Purpose (§5.5).`;
      info.push(msg);
      findings.push({ field: 'robots.txt', value: `${disallowed.size} restricted path(s)`, status: 'ok', detail: 'partial restrictions apply — see robots.txt' });
    } else {
      findings.push({ field: 'robots.txt', value: 'no AI-bot Disallow rules', status: 'ok', detail: 'no conflicts with Allow-Purpose' });
    }
  } catch (e) {
    info.push(`Could not fetch robots.txt for conflict check: ${e.message}`);
  }

  return { errors: [], warnings, info, findings };
};
