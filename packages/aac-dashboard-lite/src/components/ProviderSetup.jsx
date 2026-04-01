import { useState } from 'react';
import { PROVIDERS } from '../api/providers';
export default function ProviderSetup({ onSave }) {
  const [keys, setKeys] = useState({});
  return (
    <section>
      <h2>Connect AI Providers</h2>
      {PROVIDERS.map(p => (
        <div key={p.id} style={{ marginBottom: 12 }}>
          <label>{p.name} <input type="password" placeholder={`${p.name} API key`} value={keys[p.id] || ''} onChange={e => setKeys(k => ({ ...k, [p.id]: e.target.value }))} /></label>
        </div>
      ))}
      <button onClick={() => onSave(keys)}>Save & Fetch Citations</button>
    </section>
  );
}
