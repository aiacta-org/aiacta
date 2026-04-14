export const PROVIDERS = [
  { id: 'anthropic',  name: 'Anthropic',  baseUrl: 'https://api.anthropic.com/citations/v1' },
  { id: 'openai',     name: 'OpenAI',     baseUrl: 'https://api.openai.com/citations/v1'    },
  { id: 'google',     name: 'Google',     baseUrl: 'https://api.google.com/citations/v1'    },
  { id: 'perplexity', name: 'Perplexity', baseUrl: 'https://api.perplexity.ai/citations/v1' },
  { id: 'meta',       name: 'Meta',       baseUrl: 'https://api.meta.ai/citations/v1'       },
  { id: 'microsoft',  name: 'Microsoft',  baseUrl: 'https://api.microsoft.com/citations/v1' },
  { id: 'xai',        name: 'xAI',        baseUrl: 'https://api.grok.com/citations/v1'      },
];

export async function* fetchCitations({ provider, domain, since, apiKey }) {
  let cursor = null;
  do {
    const params = new URLSearchParams({ domain, since, limit: 1000 });
    if (cursor) params.set('cursor', cursor);
    const res = await fetch(`${provider.baseUrl}?${params}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`${provider.name} API error: ${res.status}`);
    const page = await res.json();
    for (const event of (page.events || [])) yield event;
    cursor = page.next_cursor || null;
  } while (cursor);
}
