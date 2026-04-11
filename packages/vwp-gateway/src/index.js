/**
 * VWP Gateway — validates outbound citation webhook events before
 * they are dispatched to publisher endpoints.
 *
 * Pipeline:
 *  1. Verify provider identity (HMAC or Ed25519 signature)
 *  2. Proof-of-Inference (PoI) check
 *  3. Anti-Sybil velocity throttle
 *  4. Fraud Pattern Engine scan (async, non-blocking)
 *  5. Forward to publisher webhook endpoint
 */
'use strict';
const express   = require('express');
const { verifyProviderSignature } = require('./verify-provider-signature');
const { checkPoI }                = require('./proof-of-inference');
const { checkVelocityGateway }    = require('./velocity-throttle');
const { forwardWebhook }          = require('./webhook-forwarder');

const app = express();
app.use(express.raw({ type: 'application/json' }));

function resolvePublisherWebhookUrl(event) {
  return event._publisher_webhook_url
    || event.publisher_webhook_url
    || event.publisher?.webhook_url
    || null;
}

app.post('/gateway/dispatch', async (req, res) => {
  const timestamp  = req.headers['x-aiacta-timestamp'];
  const signature  = req.headers['x-aiacta-signature'];
  const providerId = req.headers['x-aiacta-provider'];
  const rawBody    = req.body;

  // Step 1: Verify provider identity
  const sigOk = verifyProviderSignature(rawBody, timestamp, signature, providerId);
  if (!sigOk) return res.status(401).json({ error: 'Provider signature invalid' });

  const event = JSON.parse(rawBody.toString());

  // Step 2: Proof-of-Inference check
  const poi = await checkPoI(event);
  if (!poi.valid) return res.status(422).json({ error: `PoI check failed: ${poi.reason}` });

  // Step 3: Anti-Sybil velocity check
  const domain = event.citation?.url ? new URL(event.citation.url).hostname : null;
  if (domain) {
    const velocity = checkVelocityGateway(domain);
    if (!velocity.allowed) {
      // Move to Hold/Escrow — do not reject, just flag
      event._hold = true;
      event._hold_reason = velocity.reason;
    }
  }

  const publisherWebhookUrl = resolvePublisherWebhookUrl(event);
  if (!event._hold && !publisherWebhookUrl) {
    return res.status(422).json({ error: 'Publisher webhook destination missing' });
  }

  // Step 4: Forward to publisher (async)
  if (publisherWebhookUrl) {
    event._publisher_webhook_url = publisherWebhookUrl;
  }
  res.status(202).json({ status: event._hold ? 'hold' : 'dispatched', hold_reason: event._hold_reason });
  if (!event._hold) {
    forwardWebhook(event, providerId).catch(err =>
      console.error('[vwp-gateway] forward error:', err.message));
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

module.exports = app;
if (require.main === module) app.listen(process.env.PORT || 3200, () => console.log('VWP Gateway :3200'));
