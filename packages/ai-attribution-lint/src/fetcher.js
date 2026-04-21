/**
 * Fetches ai-attribution.txt from a URL or reads from a local file path.
 *
 * Returns { raw, resolvedUrl } so callers know which URL was actually fetched.
 * This drives the "Fetching: <url> ... OK" line in CLI output.
 *
 * Tries /.well-known/ai-attribution.txt first (RFC 8615), then /ai-attribution.txt
 * as a fallback (§5.2).
 */
'use strict';
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');

async function fetchContent(target) {
  // Local file path
  if (!target.startsWith('http://') && !target.startsWith('https://')) {
    const abs = path.resolve(target);
    return {
      raw:         fs.readFileSync(abs, 'utf-8'),
      resolvedUrl: null,
    };
  }

  // Strip any trailing path so we always start from the domain root
  const base = target.replace(/\/(\.well-known\/ai-attribution\.txt|ai-attribution\.txt)\s*$/, '').replace(/\/$/, '');

  const candidates = [
    `${base}/.well-known/ai-attribution.txt`,
    `${base}/ai-attribution.txt`,
  ];

  for (const url of candidates) {
    try {
      const res = await axios.get(url, {
        timeout: 10_000,
        responseType: 'text',
        // Follow redirects but cap at 5 to avoid loops
        maxRedirects: 5,
        // Validate only 2xx as success
        validateStatus: s => s >= 200 && s < 300,
      });
      return { raw: res.data, resolvedUrl: url };
    } catch (_) {
      // Try next candidate
    }
  }

  throw new Error(
    `Could not fetch ai-attribution.txt from ${base}\n` +
    `Tried:\n  ${candidates.join('\n  ')}\n\n` +
    `Make sure the file is served at /.well-known/ai-attribution.txt with Content-Type: text/plain`
  );
}

module.exports = { fetchContent };
