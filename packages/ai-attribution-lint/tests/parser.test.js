const { parse } = require('../src/parser');

test('parses basic fields', () => {
  const raw = 'Schema-Version: 1.0\nContact: licensing@example.com\nAllow-Purpose: rag\nAllow-Purpose: index';
  const result = parse(raw);
  expect(result['Schema-Version']).toBe('1.0');
  expect(result['Contact']).toEqual(['licensing@example.com']);
  expect(result['Allow-Purpose']).toEqual(['rag', 'index']);
});

test('ignores comments and blank lines', () => {
  const raw = '# comment\n\nSchema-Version: 1.0';
  expect(parse(raw)['Schema-Version']).toBe('1.0');
});
