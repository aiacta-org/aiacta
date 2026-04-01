const { computeDistribution, LICENSE_MULTIPLIERS, QUERY_VALUE_WEIGHTS } = require('../src/services/distribution-engine');

test('LICENSE_MULTIPLIERS contains all required keys', () => {
  expect(LICENSE_MULTIPLIERS['All-Rights-Reserved']).toBe(1.0);
  expect(LICENSE_MULTIPLIERS['CC0']).toBe(0.0);
});

test('QUERY_VALUE_WEIGHTS commercial is higher than informational', () => {
  expect(QUERY_VALUE_WEIGHTS.commercial).toBeGreaterThan(QUERY_VALUE_WEIGHTS.informational);
});
