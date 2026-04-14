import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const COLORS = { anthropic: '#c07b39', openai: '#10a37f', google: '#5192fc', perplexity: '#7c5cfd', microsoft: '#0652a8', meta: '#4c1be0', xai: '#040404' };
export default function CitationChart({ data, providers }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
        {providers.map(p => <Bar key={p.id} dataKey={p.id} name={p.name} fill={COLORS[p.id] || '#888'} stackId="a" />)}
      </BarChart>
    </ResponsiveContainer>
  );
}
