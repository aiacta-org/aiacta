const ruleSchemaVersion = require('../src/rules/schema-version');
const ruleSpdxLicense   = require('../src/rules/spdx-license');

test('schema-version warns when missing', () => {
  const r = ruleSchemaVersion({});
  expect(r.warnings.length).toBeGreaterThan(0);
});

test('spdx-license errors on unknown identifier', () => {
  const r = ruleSpdxLicense({ 'Content-License': 'INVALID-ID' });
  expect(r.errors.length).toBe(1);
});

test('spdx-license passes on All-Rights-Reserved', () => {
  const r = ruleSpdxLicense({ 'Content-License': 'All-Rights-Reserved' });
  expect(r.errors.length).toBe(0);
});
