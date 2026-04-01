/**
 * Parses the key: value line format of ai-attribution.txt (§5.3).
 *
 * Rules:
 *  - Lines starting with # are comments; blank lines are skipped.
 *  - Field names are case-insensitive (normalised to title-case key names).
 *  - Multi-value fields (Contact, Allow-Purpose, Disallow-Purpose) accumulate
 *    into arrays; all other fields take the last occurrence.
 *  - Unknown fields are silently ignored for forward-compatibility (§5.6).
 */
'use strict';

// Fields that may appear multiple times and accumulate as arrays (§5.3)
const MULTI_VALUE_FIELDS = new Set([
  'Contact',
  'Allow-Purpose',
  'Disallow-Purpose',
]);

// Canonical field names — normalises alternate casings to the spec names
const CANONICAL = {
  'schema-version':       'Schema-Version',
  'contact':              'Contact',
  'preferred-attribution':'Preferred-Attribution',
  'canonical-author':     'Canonical-Author',
  'allow-purpose':        'Allow-Purpose',
  'disallow-purpose':     'Disallow-Purpose',
  'require-citation':     'Require-Citation',
  'require-source-link':  'Require-Source-Link',
  'citation-format':      'Citation-Format',
  'allow-utm-append':     'Allow-UTM-Append',
  'preferred-utm-source': 'Preferred-UTM-Source',
  'citation-webhook':     'Citation-Webhook',
  'recrawl-after':        'Recrawl-After',
  'licensing-contact':    'Licensing-Contact',
  'licensing-url':        'Licensing-URL',
  'reward-tier':          'Reward-Tier',
  'content-license':      'Content-License',
};

/**
 * Parse raw ai-attribution.txt content into a structured object.
 *
 * @param {string} raw  Raw file content
 * @returns {object}    Parsed key/value map
 */
function parse(raw) {
  const result = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colon = trimmed.indexOf(':');
    if (colon === -1) continue;

    const rawKey = trimmed.slice(0, colon).trim();
    const value  = trimmed.slice(colon + 1).trim();
    if (!value) continue;

    // Normalise key
    const key = CANONICAL[rawKey.toLowerCase()] || rawKey;

    if (MULTI_VALUE_FIELDS.has(key)) {
      result[key] = result[key] ? [...result[key], value] : [value];
    } else {
      result[key] = value;
    }
  }
  return result;
}

module.exports = { parse, MULTI_VALUE_FIELDS, CANONICAL };
