/**
 * AIACTA Referrer Middleware — Node.js / Express.
 *
 * Sets the Referrer-Policy header to 'origin' on all outbound link responses
 * so AI platform origin is visible to publishers without exposing path/query.
 * Optionally appends UTM parameters to outbound links (opt-in via ai-attribution.txt).
 */
'use strict';

const STANDARD_REFERRERS = {
  openai:     'https://chatgpt.com/chat',
  google:     'https://gemini.google.com/app',
  anthropic:  'https://claude.ai/chat',
  xai:        'https://grok.com/chat',
  perplexity: 'https://www.perplexity.ai/search',
  microsoft:  'https://copilot.microsoft.com',
  meta:       'https://meta.ai',
};

/**
 * @param {object} opts
 * @param {string}   opts.provider       One of the keys in STANDARD_REFERRERS
 * @param {boolean}  [opts.appendUtm]    Whether to append UTM params (requires publisher opt-in)
 * @param {Function} [opts.isUtmEnabled] Async fn(domain) => boolean — checks publisher's ai-attribution.txt
 */
function createReferrerMiddleware({ provider, appendUtm = false, isUtmEnabled }) {
  return async (req, res, next) => {
    // Set Referrer-Policy to expose origin only — no path, no user data (§4.4)
    res.setHeader('Referrer-Policy', 'origin');

    if (appendUtm && isUtmEnabled) {
      // Attach UTM appender to res.redirect for outbound link clicks
      const originalRedirect = res.redirect.bind(res);
      res.redirect = async (url) => {
        try {
          const u = new URL(url);
          const enabled = await isUtmEnabled(u.hostname);
          if (enabled) {
            u.searchParams.set('utm_source', provider);
            u.searchParams.set('utm_medium', 'ai-chat');
            u.searchParams.set('utm_campaign', 'citation');
            return originalRedirect(u.toString());
          }
        } catch (_) { /* invalid URL — pass through unchanged */ }
        return originalRedirect(url);
      };
    }

    next();
  };
}

module.exports = { createReferrerMiddleware, STANDARD_REFERRERS };
