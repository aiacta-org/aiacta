/**
 * Gateway-level velocity throttle (§3.4C).
 * In-memory implementation — replace with Redis for production clustering.
 */
'use strict';

const WINDOW_MS   = 60 * 1000;   // 1-minute sliding window
const MAX_PER_WINDOW = 1000;      // gateway-level cap (lower than AAC server cap)

const counters = new Map(); // domain -> [timestamps]

function checkVelocityGateway(domain) {
  const now = Date.now();
  const times = (counters.get(domain) || []).filter(t => now - t < WINDOW_MS);
  times.push(now);
  counters.set(domain, times);
  if (times.length > MAX_PER_WINDOW) {
    return { allowed: false, reason: `Gateway velocity cap: ${times.length} events/min for ${domain}` };
  }
  return { allowed: true };
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [domain, times] of counters.entries()) {
    const fresh = times.filter(t => now - t < WINDOW_MS);
    if (fresh.length === 0) counters.delete(domain);
    else counters.set(domain, fresh);
  }
}, 5 * 60 * 1000);

module.exports = { checkVelocityGateway };
