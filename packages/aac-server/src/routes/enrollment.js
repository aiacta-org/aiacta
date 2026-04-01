/**
 * Provider & publisher enrollment endpoints (§7.4, §7.6).
 *
 * POST /v1/enrollment/providers                     — AI provider registers contribution mode
 * POST /v1/enrollment/publishers                    — Publisher registers domain
 * GET  /v1/enrollment/publishers/:domain/verify     — Get DNS TXT verification instructions
 * POST /v1/enrollment/publishers/:domain/verify     — Confirm TXT record is live (§6.3, §7.6)
 */
'use strict';
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const dns     = require('dns').promises;
const { getDb } = require('../db/database');

const router = express.Router();

// ── Provider enrollment ──────────────────────────────────────────────────────
router.post('/providers', (req, res) => {
  const { name, contribution_mode, rpa_rate, pcf_rate } = req.body;

  if (!name)              return res.status(400).json({ error: 'name is required' });
  if (!contribution_mode) return res.status(400).json({ error: 'contribution_mode is required' });
  if (!['rpa', 'pcf'].includes(contribution_mode)) {
    return res.status(400).json({ error: 'contribution_mode must be "rpa" or "pcf" (§7.4)' });
  }
  if (contribution_mode === 'rpa' && rpa_rate == null) {
    return res.status(400).json({ error: 'rpa_rate is required for RPA contribution mode (§7.4)' });
  }
  if (contribution_mode === 'pcf' && pcf_rate == null) {
    return res.status(400).json({ error: 'pcf_rate is required for PCF contribution mode (§7.4)' });
  }

  const id = uuidv4();
  try {
    getDb().prepare(
      'INSERT INTO providers (id, name, contribution_mode, rpa_rate, pcf_rate) VALUES (?,?,?,?,?)'
    ).run(id, name, contribution_mode, rpa_rate ?? null, pcf_rate ?? null);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Provider with this name already exists' });
    }
    throw err;
  }

  res.status(201).json({
    provider_id:        id,
    status:             'active',
    contribution_mode,
    [contribution_mode === 'rpa' ? 'rpa_rate' : 'pcf_rate']:
      contribution_mode === 'rpa' ? rpa_rate : pcf_rate,
    message: 'Provider enrolled. Store your provider_id — required for citation event ingestion.',
  });
});

// ── Publisher enrollment ─────────────────────────────────────────────────────
router.post('/publishers', (req, res) => {
  const { domain, reward_tier, content_license, webhook_url } = req.body;
  if (!domain) return res.status(400).json({ error: 'domain is required' });

  // Normalise domain
  const normalised = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();

  const id    = uuidv4();
  const token = `aiacta-verify-${uuidv4().replace(/-/g, '')}`;

  const db = getDb();
  try {
    db.prepare(
      'INSERT INTO publishers (id, domain, reward_tier, content_license, webhook_url) VALUES (?,?,?,?,?)'
    ).run(id, normalised, reward_tier ?? 'standard', content_license ?? 'All-Rights-Reserved', webhook_url ?? null);

    db.prepare(
      'INSERT INTO domain_verification_tokens (publisher_id, token) VALUES (?,?)'
    ).run(id, token);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: `Domain '${normalised}' is already registered` });
    }
    throw err;
  }

  res.status(201).json({
    publisher_id:        id,
    domain:              normalised,
    status:              'pending',
    verification_txt_record: `_aiacta-verify.${normalised}  TXT  "${token}"`,
    next_steps: [
      `1. Add a DNS TXT record: _aiacta-verify.${normalised}  TXT  "${token}"`,
      `2. Call POST /v1/enrollment/publishers/${normalised}/verify to confirm`,
      '3. Once verified, your domain will receive citation events and AAC distributions.',
    ],
  });
});

// ── Get verification instructions ────────────────────────────────────────────
router.get('/publishers/:domain/verify', (req, res) => {
  const domain = req.params.domain.toLowerCase();
  const db     = getDb();
  const pub    = db.prepare('SELECT p.*, d.token FROM publishers p JOIN domain_verification_tokens d ON d.publisher_id = p.id WHERE p.domain = ?').get(domain);
  if (!pub) return res.status(404).json({ error: 'Publisher not found' });

  res.json({
    domain:              pub.domain,
    status:              pub.status,
    verification_txt_record: `_aiacta-verify.${domain}  TXT  "${pub.token}"`,
  });
});

// ── Confirm domain verification via DNS TXT lookup ───────────────────────────
router.post('/publishers/:domain/verify', async (req, res) => {
  const domain = req.params.domain.toLowerCase();
  const db     = getDb();
  const pub    = db.prepare('SELECT p.*, d.token FROM publishers p JOIN domain_verification_tokens d ON d.publisher_id = p.id WHERE p.domain = ?').get(domain);
  if (!pub) return res.status(404).json({ error: 'Publisher not found' });
  if (pub.status === 'verified') return res.json({ domain, status: 'already_verified' });

  try {
    const records   = await dns.resolveTxt(`_aiacta-verify.${domain}`);
    const flatValues = records.flat();
    const matched    = flatValues.some(v => v === pub.token);

    if (matched) {
      db.prepare("UPDATE publishers SET status = 'verified', verified_at = datetime('now') WHERE id = ?").run(pub.id);
      return res.json({ domain, status: 'verified', message: 'Domain ownership confirmed. You are now eligible for AAC distributions.' });
    } else {
      return res.status(400).json({
        domain, status: 'failed',
        error: `TXT record not found. Expected: _aiacta-verify.${domain} TXT "${pub.token}"`,
        found: flatValues,
      });
    }
  } catch (err) {
    return res.status(400).json({
      domain, status: 'failed',
      error: `DNS lookup failed: ${err.message}. Ensure the TXT record has propagated (may take up to 48h).`,
    });
  }
});

module.exports = router;
