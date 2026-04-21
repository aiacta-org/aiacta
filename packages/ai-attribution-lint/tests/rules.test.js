/**
 * Unit tests for all ai-attribution-lint validation rules.
 *
 * Covers:
 *   - Error and warning conditions
 *   - OK findings for passing fields
 *   - Edge cases (missing fields, invalid values, cross-domain webhooks)
 */
'use strict';

const ruleSchemaVersion    = require('../src/rules/schema-version');
const ruleContact          = require('../src/rules/contact');
const rulePurpose          = require('../src/rules/purpose');
const ruleSpdxLicense      = require('../src/rules/spdx-license');
const ruleRewardTier       = require('../src/rules/reward-tier');

// ── Schema-Version ─────────────────────────────────────────────────────────
describe('schema-version rule', () => {
  test('warns when missing', () => {
    const r = ruleSchemaVersion({});
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.findings[0].status).toBe('warn');
  });

  test('warns on unknown version', () => {
    const r = ruleSchemaVersion({ 'Schema-Version': '2.0' });
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.findings[0].status).toBe('warn');
  });

  test('ok finding for valid 1.0', () => {
    const r = ruleSchemaVersion({ 'Schema-Version': '1.0' });
    expect(r.errors.length).toBe(0);
    expect(r.warnings.length).toBe(0);
    expect(r.findings[0]).toMatchObject({ field: 'Schema-Version', value: '1.0', status: 'ok' });
  });
});

// ── Contact ─────────────────────────────────────────────────────────────────
describe('contact rule', () => {
  test('warns when no contact present', () => {
    const r = ruleContact({});
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.findings[0].status).toBe('warn');
  });

  test('ok finding for valid email', () => {
    const r = ruleContact({ 'Contact': ['licensing@example.com'] });
    expect(r.warnings.length).toBe(0);
    expect(r.findings[0]).toMatchObject({ field: 'Contact', status: 'ok', detail: 'valid email' });
  });

  test('ok finding for valid URL', () => {
    const r = ruleContact({ 'Contact': ['https://example.com/contact'] });
    expect(r.findings[0]).toMatchObject({ field: 'Contact', status: 'ok', detail: 'valid URL' });
  });

  test('warn finding for unrecognised format', () => {
    const r = ruleContact({ 'Contact': ['not-an-email-or-url'] });
    expect(r.findings[0].status).toBe('warn');
  });

  test('handles multiple contact values', () => {
    const r = ruleContact({ 'Contact': ['a@b.com', 'https://example.com'] });
    expect(r.findings.length).toBe(2);
    expect(r.findings.every(f => f.status === 'ok')).toBe(true);
  });
});

// ── Purpose ──────────────────────────────────────────────────────────────────
describe('purpose rule', () => {
  test('errors on invalid Allow-Purpose value', () => {
    const r = rulePurpose({ 'Allow-Purpose': ['invalid-value'] });
    expect(r.errors.length).toBe(1);
    expect(r.findings[0].status).toBe('error');
  });

  test('ok finding for valid allow purpose', () => {
    const r = rulePurpose({ 'Allow-Purpose': ['rag'] });
    expect(r.errors.length).toBe(0);
    expect(r.findings[0]).toMatchObject({ field: 'Allow-Purpose', value: 'rag', status: 'ok' });
  });

  test('ok finding for valid disallow purpose', () => {
    const r = rulePurpose({ 'Disallow-Purpose': ['training'] });
    expect(r.findings[0]).toMatchObject({ field: 'Disallow-Purpose', value: 'training', status: 'ok' });
  });

  test('case-insensitive validation', () => {
    const r = rulePurpose({ 'Allow-Purpose': ['RAG', 'Training'] });
    expect(r.errors.length).toBe(0);
    expect(r.findings.every(f => f.status === 'ok')).toBe(true);
  });

  test('all four valid values pass', () => {
    const r = rulePurpose({ 'Allow-Purpose': ['training', 'rag', 'index', 'quality-eval'] });
    expect(r.errors.length).toBe(0);
    expect(r.findings.length).toBe(4);
  });
});

// ── SPDX License ─────────────────────────────────────────────────────────────
describe('spdx-license rule', () => {
  test('errors on unknown identifier', () => {
    const r = ruleSpdxLicense({ 'Content-License': 'INVALID-ID' });
    expect(r.errors.length).toBe(1);
    expect(r.findings[0].status).toBe('error');
  });

  test('errors on short-form SPDX (not full identifier)', () => {
    // CC-BY is not a valid SPDX id — must be CC-BY-4.0
    const r = ruleSpdxLicense({ 'Content-License': 'CC-BY' });
    expect(r.errors.length).toBe(1);
  });

  test('passes on All-Rights-Reserved', () => {
    const r = ruleSpdxLicense({ 'Content-License': 'All-Rights-Reserved' });
    expect(r.errors.length).toBe(0);
    expect(r.findings[0]).toMatchObject({ status: 'ok', detail: 'all rights reserved — highest distribution multiplier' });
  });

  test('passes on valid SPDX identifier', () => {
    const r = ruleSpdxLicense({ 'Content-License': 'CC-BY-SA-4.0' });
    expect(r.errors.length).toBe(0);
    expect(r.findings[0]).toMatchObject({ status: 'ok', detail: 'valid SPDX identifier' });
  });

  test('warns when Content-License is absent', () => {
    const r = ruleSpdxLicense({});
    expect(r.warnings.length).toBe(1);
    expect(r.findings[0].status).toBe('warn');
  });

  test('passes on Apache-2.0', () => {
    const r = ruleSpdxLicense({ 'Content-License': 'Apache-2.0' });
    expect(r.errors.length).toBe(0);
  });

  test('passes on MIT', () => {
    const r = ruleSpdxLicense({ 'Content-License': 'MIT' });
    expect(r.errors.length).toBe(0);
  });

  test('passes on CC0-1.0', () => {
    const r = ruleSpdxLicense({ 'Content-License': 'CC0-1.0' });
    expect(r.errors.length).toBe(0);
  });
});

// ── Reward-Tier ──────────────────────────────────────────────────────────────
describe('reward-tier rule', () => {
  test('errors on invalid tier', () => {
    const r = ruleRewardTier({ 'Reward-Tier': 'gold' });
    expect(r.errors.length).toBe(1);
    expect(r.findings[0].status).toBe('error');
  });

  test('ok finding for standard', () => {
    const r = ruleRewardTier({ 'Reward-Tier': 'standard' });
    expect(r.errors.length).toBe(0);
    expect(r.findings[0]).toMatchObject({ field: 'Reward-Tier', status: 'ok', detail: 'opt-in to AAC distributions' });
  });

  test('ok finding for none', () => {
    const r = ruleRewardTier({ 'Reward-Tier': 'none' });
    expect(r.errors.length).toBe(0);
    expect(r.findings[0].status).toBe('ok');
  });

  test('ok finding for premium', () => {
    const r = ruleRewardTier({ 'Reward-Tier': 'premium' });
    expect(r.errors.length).toBe(0);
    expect(r.findings[0].status).toBe('ok');
  });

  test('no finding when absent', () => {
    const r = ruleRewardTier({});
    expect(r.errors.length).toBe(0);
    expect(r.findings.length).toBe(0);
  });

  test('case insensitive', () => {
    const r = ruleRewardTier({ 'Reward-Tier': 'STANDARD' });
    expect(r.errors.length).toBe(0);
  });
});
