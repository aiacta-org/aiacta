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
const { initDb }         = require('./db/database');

const app = express();
app.use(express.json({ limit: '1mb' }));

// ── API versioning middleware ──────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-AIACTA-Version', '1.0.0');
  next();
});

app.use('/v1/enrollment',   enrollmentRoutes);
app.use('/v1/citations',    citationRoutes);
app.use('/v1/distribution', distributionRoutes);
app.use('/v1/provenance',   provenanceRoutes);

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
