/**
 * Substack / custom domain AIACTA integration.
 *
 * For Substack authors using a custom domain, this script:
 *  1. Generates an ai-attribution.txt for your subdomain
 *  2. Provides a citation webhook handler for a serverless function
 *
 * Deploy as a Cloudflare Worker or Vercel Edge Function alongside your Substack.
 */

const AUTHOR_CONFIG = {
  subdomain:           'yourname.substack.com',   // or your custom domain
  preferredAttribution:'Your Name (yourname.substack.com)',
  licensingContact:    'you@email.com',
  contentLicense:      'CC-BY-SA-4.0',
  rewardTier:          'standard',
  webhookSecret:       process.env.AIACTA_WEBHOOK_SECRET,
};

// ── Serve ai-attribution.txt from /.well-known/ ───────────────────────────
export function handleAttributionTxt(request) {
  const content = `Schema-Version: 1.0
Contact: ${AUTHOR_CONFIG.licensingContact}
Preferred-Attribution: ${AUTHOR_CONFIG.preferredAttribution}
Allow-Purpose: rag
Allow-Purpose: index
Disallow-Purpose: training
Require-Citation: true
Require-Source-Link: true
Citation-Webhook: https://${AUTHOR_CONFIG.subdomain}/webhooks/ai-citations
Reward-Tier: ${AUTHOR_CONFIG.rewardTier}
Content-License: ${AUTHOR_CONFIG.contentLicense}
`;
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'max-age=86400' },
  });
}

// ── Handle incoming citation webhook events ───────────────────────────────
import crypto from 'crypto';

export async function handleCitationWebhook(request) {
  const body      = await request.arrayBuffer();
  const timestamp = request.headers.get('X-AIACTA-Webhook-Timestamp');
  const sig       = request.headers.get('X-AIACTA-Webhook-Signature');

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(AUTHOR_CONFIG.webhookSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signedPayload = encoder.encode(`${timestamp}.${new TextDecoder().decode(body)}`);
  const hashBuf = await crypto.subtle.sign('HMAC', key, signedPayload);
  const expected = 'sha256=' + Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,'0')).join('');

  if (expected !== sig) return new Response('Unauthorized', { status: 401 });

  const event = JSON.parse(new TextDecoder().decode(body));
  console.log('[AIACTA] Citation:', event.citation?.url, 'via', event.provider);
  // TODO: store in KV or D1 for your own analytics

  return new Response(JSON.stringify({ status: 'accepted' }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
}

// ── Cloudflare Worker fetch handler ──────────────────────────────────────
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/.well-known/ai-attribution.txt') return handleAttributionTxt(request);
    if (url.pathname === '/webhooks/ai-citations' && request.method === 'POST') return handleCitationWebhook(request);
    return new Response('Not found', { status: 404 });
  },
};
