/**
 * AAC distribution calculation and payout scheduling (§7.5).
 *
 * POST /v1/distribution/calculate  — Run weight formula, return payout plan
 * POST /v1/distribution/commit     — Persist payout plan as a distribution run
 * GET  /v1/distribution/:run_id    — Fetch results of a past run
 */
'use strict';
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const { computeDistribution } = require('../services/distribution-engine');

const router = express.Router();

router.post('/calculate', (req, res) => {
  const { period_from, period_to, pool_balance } = req.body;
  if (!period_from || !period_to || pool_balance == null) {
    return res.status(400).json({ error: 'period_from, period_to, pool_balance required' });
  }
  const payouts = computeDistribution({ period_from, period_to, pool_balance });
  res.json({ period: { from: period_from, to: period_to }, pool_balance, payouts, status: 'preview' });
});

router.post('/commit', (req, res) => {
  const { period_from, period_to, pool_balance } = req.body;
  const payouts = computeDistribution({ period_from, period_to, pool_balance });
  const id = uuidv4();
  getDb().prepare(`
    INSERT INTO distribution_runs (id, period_from, period_to, pool_balance, status, run_at, payouts)
    VALUES (?, ?, ?, ?, 'completed', datetime('now'), ?)
  `).run(id, period_from, period_to, pool_balance, JSON.stringify(payouts));
  res.status(201).json({ run_id: id, payouts, status: 'committed' });
});

router.get('/:run_id', (req, res) => {
  const run = getDb().prepare('SELECT * FROM distribution_runs WHERE id = ?').get(req.params.run_id);
  if (!run) return res.status(404).json({ error: 'Run not found' });
  res.json({ ...run, payouts: JSON.parse(run.payouts) });
});

module.exports = router;
