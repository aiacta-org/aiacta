/**
 * Processes a parsed CitationEvent or CitationBatch.
 * Handles idempotency check, normalization, and dispatches to user handler.
 * GDPR: strips no fields beyond what the schema already omits (§3.3).
 */
'use strict';

/**
 * @param {object}   event        Parsed JSON body (single event or batch)
 * @param {object}   opts
 * @param {Function} opts.isProcessed   async (idempotency_key) => boolean
 * @param {Function} opts.markProcessed async (idempotency_key) => void
 * @param {Function} opts.onEvent       async (event) => void — your handler
 */
async function processEvent(event, { isProcessed, markProcessed, onEvent }) {
  // Flatten batch into individual events
  const events = event.events ? event.events : [event];

  for (const e of events) {
    if (await isProcessed(e.idempotency_key)) {
      continue; // safe at-least-once reprocessing (§3.2)
    }
    await onEvent(e);
    await markProcessed(e.idempotency_key);
  }
}

module.exports = { processEvent };
