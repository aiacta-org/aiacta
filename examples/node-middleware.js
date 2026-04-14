/**
 * AIACTA Express Middleware — Proposal 3: Referrer Headers (§4)
 *
 * Sets Referrer-Policy: origin on every response from your server.
 *
 * WHY: When users click links from AI interfaces (ChatGPT, Claude, Gemini)
 * to your site, the browser sends a Referer header showing where they came
 * from. Without this policy, the Referer may be stripped (no-referrer) or
 * include the full AI conversation URL (unsafe-url). 'origin' sends just
 * the AI platform's base URL (e.g. https://claude.ai) — enough for your
 * analytics to attribute traffic to the correct AI platform, without
 * exposing the user's query text.
 *
 * USAGE in Express:
 *   const aiactaMiddleware = require('./examples/node-middleware');
 *   app.use(aiactaMiddleware);
 *
 * USAGE in Next.js (next.config.js):
 *   headers: [{ source: '/(.*)', headers: [{ key: 'Referrer-Policy', value: 'origin' }] }]
 *
 * USAGE in nginx:
 *   add_header Referrer-Policy "origin" always;
 */
module.exports = function aiactaReferrerMiddleware(req, res, next) {
  // Proposal 3, §4: Set Referrer-Policy to 'origin' on all responses.
  // This makes AI-referred traffic visible in your analytics as:
  //   - https://claude.ai (Anthropic)
  //   - https://chatgpt.com (OpenAI)
  //   - https://gemini.google.com (Google)
  //   - https://www.perplexity.ai (Perplexity)
  //   - https://copilot.microsoft.com (Microsoft)
  //   - https://grok.com (xAI Grok)
  
  res.setHeader('Referrer-Policy', 'origin');
  next();
};
