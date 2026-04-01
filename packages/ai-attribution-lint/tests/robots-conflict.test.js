/**
 * Tests for the robots.txt conflict rule (§5.5).
 * Uses nock to mock robots.txt responses.
 */
const ruleRobotsTxtConflict = require('../src/rules/robots-txt-conflict');

// Test with a local file path (no robots.txt fetch attempted)
test('skips robots check for local file paths', async () => {
  const r = await ruleRobotsTxtConflict({ 'Allow-Purpose': ['rag'] }, '/local/path/ai-attribution.txt');
  expect(r.errors).toHaveLength(0);
});

test('skips robots check when no Allow-Purpose set', async () => {
  const r = await ruleRobotsTxtConflict({}, 'https://example.com');
  expect(r.errors).toHaveLength(0);
  expect(r.warnings).toHaveLength(0);
});
