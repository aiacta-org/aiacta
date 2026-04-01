import { useState, useCallback } from 'react';
import ProviderSetup from './ProviderSetup';
import CitationChart from './CitationChart';
import RewardEstimator from './RewardEstimator';
import { fetchCitations, PROVIDERS } from '../api/providers';

export default function App() {
  const [apiKeys, setApiKeys]     = useState(null);
  const [citations, setCitations] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [domain, setDomain]       = useState('');
  const handleSave = useCallback(async (keys) => {
    setApiKeys(keys); setLoading(true);
    const all = [];
    for (const provider of PROVIDERS) {
      if (!keys[provider.id]) continue;
      try { for await (const e of fetchCitations({ provider, domain, since: '2026-01-01T00:00:00Z', apiKey: keys[provider.id] })) all.push(e); }
      catch (e) { console.warn(provider.name, e.message); }
    }
    setCitations(all); setLoading(false);
  }, [domain]);

  if (!apiKeys) return <main style={{ maxWidth: 640, margin: '2rem auto', fontFamily: 'sans-serif' }}>
    <h1>AIACTA Dashboard Lite</h1>
    <label>Domain: <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="example.com" /></label>
    <ProviderSetup onSave={handleSave} />
  </main>;

  return <main style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'sans-serif' }}>
    <h1>Citation Analytics — {domain}</h1>
    {loading ? <p>Loading…</p> : <><CitationChart data={citations} providers={PROVIDERS} /><RewardEstimator citations={citations} contentLicense="All-Rights-Reserved" /></>}
  </main>;
}
