/**
 * Rule: robots.txt conflict checker (§5.5).
 *
 * Verifies that ai-attribution.txt Allow-Purpose directives do not conflict
 * with Disallow rules in the site's robots.txt, since robots.txt Disallow
 * takes precedence over ai-attribution.txt Allow-Purpose.
 *
 * Issues a WARNING (not error) because robots.txt may be intentionally
 * restrictive while ai-attribution.txt is aspirational.
 */
'use strict';
const axios = require('axios');
const { URL } = require('url');

const KNOWN_AI_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'PerplexityBot', 'Grok-Bot'];

/**
 * Minimally parses a robots.txt to extract Disallow rules for known AI bots.
 * Not a full RFC 9309 parser — only checks direct bot-name matches.
 * @param {string} robotsTxt
 * @returns {Set<string>}  Set of disallowed path prefixes for AI bots
 */
function parseRobotsForAiBots(robotsTxt) {
  const disallowed = new Set();
  const lines = robotsTxt.split('\n').map(l => l.trim());
  let inAiBlock = false;

  for (const line of lines) {
    if (line.startsWith('#') || !line) { inAiBlock = false; continue; }
    if (line.toLowerCase().startsWith('user-agent:')) {
      const ua = line.slice('user-agent:'.length).trim();
      inAiBlock = ua === '*' || KNOWN_AI_BOTS.some(b => ua.toLowerCase().includes(b.toLowerCase()));
      continue;
    }
    if (inAiBlock && line.toLowerCase().startsWith('disallow:')) {
      const path = line.slice('disallow:'.length).trim();
      if (path) disallowed.add(path);
    }
  }
  return disallowed;
}

module.exports = async function ruleRobotsTxtConflict(parsed, target) {
  const warnings = [];
  const info     = [];
  const allowPurpose = parsed['Allow-Purpose'] || [];

  if (allowPurpose.length === 0) return { errors: [], warnings, info };
  if (!target || !target.startsWith('http')) return { errors: [], warnings, info };

  try {
    const origin    = new URL(target.replace(/\/?\.well-known.*$/, '').replace(/\/ai-attribution\.txt$/, '')).origin;
    const robotsUrl = `${origin}/robots.txt`;
    const res = await axios.get(robotsUrl, { timeout: 8_000, responseType: 'text' });
    const disallowed = parseRobotsForAiBots(res.data);

    if (disallowed.has('/') || disallowed.has('/*')) {
      warnings.push(
        `robots.txt Disallow: / blocks all AI bots, overriding Allow-Purpose: ${allowPurpose.join(', ')} (§5.5). ` +
        `AI systems will respect robots.txt first.`
      );
    } else if (disallowed.size > 0) {
      info.push(
        `robots.txt restricts AI bots from ${disallowed.size} path(s): ${[...disallowed].slice(0,3).join(', ')}` +
        `${disallowed.size > 3 ? '...' : ''}. These restrictions override ai-attribution.txt Allow-Purpose (§5.5).`
      );
    }
  } catch (e) {
    info.push(`Could not fetch robots.txt for conflict check: ${e.message}`);
  }

  return { errors: [], warnings, info };
};
