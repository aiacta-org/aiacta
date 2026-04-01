/**
 * Retry schedule constants and helper for outbound webhook delivery
 * (relevant for AI provider implementations — §3.5).
 */
'use strict';

/** Delays in seconds matching the spec's retry schedule. */
const RETRY_DELAYS_SECONDS = [0, 30, 300, 1800, 7200, 43200];

/**
 * Executes fn with the AIACTA retry schedule.
 * @param {Function} fn  Async function that throws on failure
 */
async function withRetry(fn) {
  for (let attempt = 0; attempt < RETRY_DELAYS_SECONDS.length; attempt++) {
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, RETRY_DELAYS_SECONDS[attempt] * 1000));
    }
    try {
      return await fn();
    } catch (err) {
      if (attempt === RETRY_DELAYS_SECONDS.length - 1) {
        throw new Error(`Dead-lettered after ${RETRY_DELAYS_SECONDS.length} attempts: ${err.message}`);
      }
    }
  }
}

module.exports = { withRetry, RETRY_DELAYS_SECONDS };
