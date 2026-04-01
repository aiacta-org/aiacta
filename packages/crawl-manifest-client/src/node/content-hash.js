/**
 * Content hash utility — §2.3.
 *
 * Spec: "SHA-256 of UTF-8 normalized body text (HTML stripped, whitespace collapsed)"
 *
 * Used by AI providers when building crawl manifest entries.
 * Publishers may cross-check hashes to detect content drift.
 */
'use strict';
const crypto = require('crypto');

// Minimal HTML tag stripper (no DOM dependency for broad compatibility)
function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

// Collapse whitespace as specified: normalise to single spaces, trim
function collapseWhitespace(text) {
  return text.replace(/[\s\u00A0\u200B]+/g, ' ').trim();
}

/**
 * Compute the AIACTA content hash for a crawled page.
 *
 * @param {string} rawHtml  The full HTML source of the crawled page
 * @returns {string}        "sha256:<hex>" as defined in §2.3
 *
 * @example
 * const { computeContentHash } = require('./content-hash');
 * const hash = computeContentHash('<html><body>Hello world</body></html>');
 * // => "sha256:b94d27b99..."
 */
function computeContentHash(rawHtml) {
  const text   = collapseWhitespace(stripHtml(rawHtml));
  const digest = crypto.createHash('sha256').update(text, 'utf8').digest('hex');
  return `sha256:${digest}`;
}

/**
 * Verify that a stored content hash still matches current page content.
 * Used by publishers to detect unexpected content changes after a crawl.
 *
 * @param {string} rawHtml       Current page HTML
 * @param {string} storedHash    Previously recorded "sha256:<hex>"
 * @returns {boolean}
 */
function verifyContentHash(rawHtml, storedHash) {
  return computeContentHash(rawHtml) === storedHash;
}

module.exports = { computeContentHash, verifyContentHash, stripHtml, collapseWhitespace };
