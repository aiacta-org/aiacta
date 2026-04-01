/**
 * crawl-manifest-client — Node.js
 *
 * Queries GET /crawl-manifest/v1 (§2.2) with:
 *  - Cursor-based automatic pagination
 *  - 90-day max range validation (spec requirement)
 *  - Rate-limit backoff (X-RateLimit-Remaining / X-RateLimit-Reset)
 *  - In-memory response caching (TTL = 1 hour)
 */
'use strict';
const axios     = require('axios');
const NodeCache = require('node-cache');

const MAX_RANGE_DAYS = 90;   // §2.2: max date range 90 days per request
const RATE_LIMIT_RPH = 60;   // §2.2: 60 requests/hour per domain

const cache = new NodeCache({ stdTTL: 3600 });

class CrawlManifestClient {
  /**
   * @param {object} opts
   * @param {string}   opts.provider   Provider identifier (e.g. 'anthropic')
   * @param {string}   opts.apiKey     Publisher API key (Bearer token)
   * @param {string}  [opts.baseUrl]   Override base URL for testing
   */
  constructor({ provider, apiKey, baseUrl }) {
    this.baseUrl  = baseUrl || `https://api.${provider}.com/crawl-manifest/v1`;
    this.apiKey   = apiKey;
    this._reqLog  = []; // sliding window for client-side rate guard
  }

  /**
   * Validates that the requested date range does not exceed 90 days (§2.2).
   * @param {string} from  ISO 8601
   * @param {string} to    ISO 8601
   * @throws {RangeError}
   */
  _validateRange(from, to) {
    const diffMs   = new Date(to) - new Date(from);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays > MAX_RANGE_DAYS) {
      throw new RangeError(
        `Date range ${diffDays.toFixed(1)} days exceeds the 90-day maximum per §2.2. ` +
        `Split your query into multiple requests.`
      );
    }
    if (diffMs < 0) {
      throw new RangeError(`'from' must be before 'to'`);
    }
  }

  /**
   * Client-side rate guard — warns (does not block) if approaching 60 req/hour.
   */
  _trackRequest() {
    const now = Date.now();
    const hourAgo = now - 3600_000;
    this._reqLog = this._reqLog.filter(t => t > hourAgo);
    this._reqLog.push(now);
    if (this._reqLog.length >= RATE_LIMIT_RPH - 5) {
      console.warn(
        `[crawl-manifest-client] Approaching rate limit: ` +
        `${this._reqLog.length}/${RATE_LIMIT_RPH} requests in last hour`
      );
    }
  }

  /**
   * Fetches all crawl manifest records for a domain, handling all pagination.
   * Yields individual CrawlManifestUrl objects.
   *
   * @param {object}   params
   * @param {string}   params.domain
   * @param {string}   params.from        ISO 8601 — start of query window
   * @param {string}   params.to          ISO 8601 — end of query window (max 90d from 'from')
   * @param {string[]} [params.purpose]   Filter by purpose values
   * @yields {CrawlManifestUrl}
   */
  async *fetchAll({ domain, from, to, purpose = [] }) {
    this._validateRange(from, to);
    let cursor = null;
    do {
      const page = await this._fetchPage({ domain, from, to, purpose, cursor });
      for (const url of page.urls) yield url;
      cursor = page.next_cursor || null;
    } while (cursor);
  }

  /**
   * Fetch a single page of results (internal).
   */
  async _fetchPage({ domain, from, to, purpose, cursor }) {
    const cacheKey = `${domain}|${from}|${to}|${purpose.join(',')}|${cursor}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    this._trackRequest();

    const params = { domain, from, to, format: 'json' };
    if (purpose.length) params.purpose = purpose.join(',');
    if (cursor)         params.cursor  = cursor;

    let response;
    try {
      response = await axios.get(this.baseUrl, {
        params,
        headers: { Authorization: `Bearer ${this.apiKey}` },
        timeout: 15_000,
      });
    } catch (err) {
      if (err.response?.status === 429) {
        // Respect X-RateLimit-Reset header (§2.2)
        const resetIn = parseInt(err.response.headers['x-ratelimit-reset'] || '60', 10);
        console.warn(`[crawl-manifest-client] Rate limited. Waiting ${resetIn}s...`);
        await new Promise(r => setTimeout(r, resetIn * 1000));
        return this._fetchPage({ domain, from, to, purpose, cursor });
      }
      throw err;
    }

    const data = response.data;
    cache.set(cacheKey, data);
    return data;
  }
}

module.exports = { CrawlManifestClient, MAX_RANGE_DAYS };
