/**
 * Express middleware factory.
 * Attaches signature verification and idempotency handling to a route.
 * Usage:
 *   app.post('/webhooks/ai-citations', createExpressMiddleware({ secret, store, onEvent }));
 */
'use strict';
const { verifyWebhookSignature } = require('./signature');
const { processEvent }           = require('./processor');

function createExpressMiddleware({ secret, store, onEvent }) {
  return async (req, res) => {
    const timestamp = req.headers['x-aiacta-webhook-timestamp'];
    const sig       = req.headers['x-aiacta-webhook-signature'];
    // Body must be raw Buffer — use express.raw() before this middleware
    try {
      const valid = verifyWebhookSignature(req.body, timestamp, sig, secret);
      if (!valid) return res.status(401).json({ error: 'Invalid signature' });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    const payload = JSON.parse(req.body.toString('utf-8'));
    // Respond quickly — process asynchronously (§3.5)
    res.status(200).json({ status: 'accepted' });
    await processEvent(payload, {
      isProcessed:   (k) => store.exists(k),
      markProcessed: (k) => store.set(k, true),
      onEvent,
    }).catch(err => console.error('[ai-citation-sdk] handler error:', err));
  };
}

module.exports = { createExpressMiddleware };
