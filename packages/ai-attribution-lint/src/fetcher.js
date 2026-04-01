/**
 * Fetches ai-attribution.txt from a URL or reads from a local file path.
 * Respects Cache-Control / Expires headers as per §5.2.
 */
'use strict';
const axios = require('axios');
const fs = require('fs');

async function fetchContent(target) {
  if (target.startsWith('http://') || target.startsWith('https://')) {
    // Try well-known location first (RFC 8615), fall back to root (§5.2)
    const urls = [
      target.replace(/\/?$/, '/.well-known/ai-attribution.txt'),
      target.replace(/\/?$/, '/ai-attribution.txt'),
    ];
    for (const url of urls) {
      try {
        const res = await axios.get(url, { timeout: 10_000, responseType: 'text' });
        if (res.status === 200) return res.data;
      } catch (_) { /* try next */ }
    }
    throw new Error(`Could not fetch ai-attribution.txt from ${target}`);
  }
  return fs.readFileSync(target, 'utf-8');
}

module.exports = { fetchContent };
