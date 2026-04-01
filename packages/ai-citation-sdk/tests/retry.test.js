const { RETRY_DELAYS_SECONDS } = require('../src/node/retry');

test('retry schedule has 6 attempts', () => {
  expect(RETRY_DELAYS_SECONDS).toHaveLength(6);
});

test('first attempt is immediate', () => {
  expect(RETRY_DELAYS_SECONDS[0]).toBe(0);
});

test('last delay is 12 hours', () => {
  expect(RETRY_DELAYS_SECONDS[5]).toBe(43200);
});
