"""
AIACTA Referrer Middleware — Python (WSGI-compatible).
Sets Referrer-Policy: origin on all responses (§4.4).
Optionally appends UTM parameters to outbound redirect URLs (§4.3).
"""
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse

STANDARD_REFERRERS = {
    'openai':     'https://chatgpt.com/chat',
    'google':     'https://gemini.google.com/app',
    'anthropic':  'https://claude.ai/chat',
    'xai':        'https://grok.com/chat',
    'perplexity': 'https://www.perplexity.ai/search',
    'microsoft':  'https://copilot.microsoft.com',
    'meta':       'https://meta.ai',
};


class ReferrerMiddleware:
    """WSGI middleware that injects Referrer-Policy and optional UTM parameters."""

    def __init__(self, app, provider: str, append_utm: bool = False, utm_enabled_domains: set = None):
        self.app = app
        self.provider = provider
        self.append_utm = append_utm
        self.utm_enabled_domains = utm_enabled_domains or set()

    def __call__(self, environ, start_response):
        def custom_start_response(status, headers, exc_info=None):
            headers = list(headers)
            # Inject Referrer-Policy header
            headers.append(('Referrer-Policy', 'origin'))

            # UTM parameter injection for 3xx redirects
            if self.append_utm and status.startswith('3'):
                headers = self._inject_utm(headers)

            return start_response(status, headers, exc_info)

        return self.app(environ, custom_start_response)

    def _inject_utm(self, headers):
        new_headers = []
        for name, value in headers:
            if name.lower() == 'location':
                parsed = urlparse(value)
                if parsed.hostname in self.utm_enabled_domains:
                    qs = parse_qs(parsed.query)
                    qs.update({'utm_source': [self.provider], 'utm_medium': ['ai-chat'], 'utm_campaign': ['citation']})
                    value = urlunparse(parsed._replace(query=urlencode(qs, doseq=True)))
            new_headers.append((name, value))
        return new_headers
