/**
 * API key authentication middleware for mutating AAC server endpoints.
 *
 * Protects:
 *   POST /v1/enrollment/providers       — AI provider registration
 *   POST /v1/enrollment/publishers      — Publisher registration
 *   POST /v1/distribution/commit        — Persist a payout run
 *   GET  /internal/*                    — Internal gateway endpoints
 *
 * Public (no auth required):
 *   POST /v1/citations/ingest           — Citation ingestion (authenticated
 *                                         by VWP gateway signature instead)
 *   GET  /v1/citations/summary          — Aggregate stats (read-only)
 *   GET  /health                        — Health check
 *
 * NOTE: This is a minimal first auth layer for the reference implementation.
 * Production deployments should use OAuth 2.0 client credentials or mTLS.
 * Set AAC_API_KEY env var to a strong random secret.
 * Generate one: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
'use strict';

function requireApiKey(req, res, next) {
  const configuredKey = process.env.AAC_API_KEY;

  if (!configuredKey) {
    // Fail closed: if no key is configured, deny all access to protected routes
    return res.status(503).json({
      error: 'AAC server is not configured for production use. Set AAC_API_KEY.',
    });
  }

  const provided = req.headers['x-aac-api-key'];
  if (!provided || provided !== configuredKey) {
    return res.status(401).json({
      error: 'Valid X-AAC-API-Key header required.',
    });
  }

  next();
}

/**
 * Middleware for internal gateway-to-server calls.
 * Uses a separate AAC_INTERNAL_KEY to isolate internal traffic from external API keys.
 */
function requireInternalKey(req, res, next) {
  const configuredKey = process.env.AAC_INTERNAL_KEY;

  if (!configuredKey) {
    return res.status(503).json({ error: 'Internal key not configured.' });
  }

  const provided = req.headers['x-aac-internal-key'];
  if (!provided || provided !== configuredKey) {
    return res.status(401).json({ error: 'Internal access only.' });
  }

  next();
}

module.exports = { requireApiKey, requireInternalKey };
