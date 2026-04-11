const { computeDistribution, LICENSE_MULTIPLIERS, QUERY_VALUE_WEIGHTS } = require('../src/services/distribution-engine');

test('LICENSE_MULTIPLIERS contains all required keys', () => {
  expect(LICENSE_MULTIPLIERS['All-Rights-Reserved']).toBe(1.0);
  expect(LICENSE_MULTIPLIERS['CC-BY-ND-4.0']).toBe(0.8);
  expect(LICENSE_MULTIPLIERS['CC-BY-SA-4.0']).toBe(0.7);
  expect(LICENSE_MULTIPLIERS['CC-BY-4.0']).toBe(0.5);
  expect(LICENSE_MULTIPLIERS['Apache-2.0']).toBe(0.4);
  expect(LICENSE_MULTIPLIERS['CC0-1.0']).toBe(0.0);
});

test('QUERY_VALUE_WEIGHTS commercial is higher than informational', () => {
  expect(QUERY_VALUE_WEIGHTS.commercial).toBeGreaterThan(QUERY_VALUE_WEIGHTS.informational);
});