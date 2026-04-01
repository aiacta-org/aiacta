const { lint } = require('../../ai-attribution-lint/src/index');
const path = require('path');
test('valid fixture produces no errors', async () => {
  const r = await lint(path.join(__dirname, '../fixtures/ai-attribution-txt/valid.txt'));
  expect(r.errors).toHaveLength(0);
});
test('invalid fixture produces errors', async () => {
  const r = await lint(path.join(__dirname, '../fixtures/ai-attribution-txt/invalid.txt'));
  expect(r.errors.length).toBeGreaterThan(0);
});
