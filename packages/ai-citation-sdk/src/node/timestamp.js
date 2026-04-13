/**
 * Timestamp utilities for AIACTA webhook events.
 *
 * §3.2 specifies "minute precision only" for event timestamps to prevent
 * timing attacks that could re-identify users.
 *
 * Implementation note: the X-AIACTA-Webhook-Timestamp header used for HMAC
 * signing (§3.4) remains at UNIX second precision — this is the
 * cryptographic nonce that prevents replay attacks. The event.timestamp
 * field inside the JSON payload is truncated to minute precision.
 */
'use strict';

/**
 * Returns the current time truncated to minute precision, as ISO 8601.
 * e.g. "2026-03-24T09:14:00Z"  (seconds and sub-seconds always zero)
 */
function nowMinutePrecision() {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().replace('.000Z', ':00Z').replace(/\.\d{3}Z$/, ':00Z');
}

/**
 * Truncates any ISO 8601 string to minute precision.
 * @param {string} isoString
 * @returns {string}
 */
function truncateToMinute(isoString) {
  const d = new Date(isoString);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16) + ':00Z';
}

module.exports = { nowMinutePrecision, truncateToMinute };
