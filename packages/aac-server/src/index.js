/**
 * AAC Reference Server — entry point.
 *
 * better-sqlite3 is synchronous; initDb() must be called before app.listen().
 */
'use strict';
const express            = require('express');
const enrollmentRoutes   = require('./routes/enrollment');
const citationRoutes     = require('./routes/citations');
const distributionRoutes = require('./routes/distribution');
const provenanceRoutes   = require('./routes/provenance');
const { initDb, getDb }  = require('./db/database');
const { requireApiKey, requireInternalKey } = require('./middleware/apiKey');

const app = express();
app.use(express.json({ limit: '1mb' }));

// ── API versioning middleware ──────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-AIACTA-Version', '1.0.0');
  next();
});

// Mutating enrollment routes require API key auth
// (publishers and AI providers register here — must be authorised)
app.use('/v1/enrollment',   requireApiKey, enrollmentRoutes);

// Citation ingestion is authenticated at the gateway level (provider signature)
// Summary and pull are read-only and scoped to the caller's domain
app.use('/v1/citations',    citationRoutes);

// Distribution commit writes financial records — requires API key
// Distribution calculate (preview) is read-only, no auth needed
app.post('/v1/distribution/commit',    requireApiKey, (req, res, next) => next());
app.use('/v1/distribution', distributionRoutes);

app.use('/v1/provenance',   provenanceRoutes);

// ── Internal gateway endpoint ─────────────────────────────────────────────
// Used by vwp-gateway to resolve a publisher's registered webhook URL.
// Protected by a separate internal key to isolate from the public API.
app.get('/internal/publishers/:domain/webhook', requireInternalKey, (req, res) => {
  const domain    = req.params.domain.toLowerCase();
  const publisher = getDb()
    .prepare('SELECT webhook_url, status FROM publishers WHERE domain = ?')
    .get(domain);

  if (!publisher) {
    return res.status(404).json({ error: 'Publisher not found', webhook_url: null });
  }
  if (publisher.status !== 'verified') {
    return res.status(403).json({ error: 'Publisher not yet verified', webhook_url: null });
  }
  res.json({ domain, webhook_url: publisher.webhook_url ?? null });
});

const PKG_VERSION = require('../package.json').version;
app.get('/health', (_, res) => res.json({ status: 'ok', version: PKG_VERSION, spec: 'AIACTA/1.0' }));

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler ─────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[aac-server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Synchronous init — must complete before accepting connections
if (require.main === module) {
  initDb();
  const PORT = process.env.PORT || 3100;
  app.listen(PORT, () => console.log(`[aac-server] Listening on :${PORT}`));
}

module.exports = { app, initDb };
