const crypto = require('crypto');
const { processEvent } = require('ai-citation-sdk');
const processed = new Set();
module.exports = {
  route: '/webhooks/ai-citations',
  method: 'POST',
  handler: async (req, res) => {
    const ts = req.headers['x-aiacta-webhook-timestamp'];
    const sig = req.headers['x-aiacta-webhook-signature'];
        
    const expected = 'sha256=' + crypto
      .createHmac('sha256', process.env.AIACTA_WEBHOOK_SECRET)
      .update(`${ts}.${req.rawBody}`)
      .digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    res.status(200).json({ status: 'accepted' });
    await processEvent(JSON.parse(req.rawBody), {
      isProcessed:   k => processed.has(k),
      markProcessed: k => processed.add(k),
      onEvent: async e => console.log('[AIACTA] Citation:', e.citation.url, 'via', e.provider),
    });
  },
};
