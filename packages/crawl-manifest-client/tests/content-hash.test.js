const { computeContentHash, verifyContentHash, stripHtml, collapseWhitespace } = require('../src/node/content-hash');

test('strips HTML tags', () => {
  expect(stripHtml('<p>Hello <b>world</b></p>')).toMatch(/Hello\s+world/);
});

test('removes script and style blocks entirely', () => {
  const html = '<html><head><style>.a{color:red}</style><script>alert(1)</script></head><body>Text</body></html>';
  const text = stripHtml(html);
  expect(text).not.toContain('color:red');
  expect(text).not.toContain('alert(1)');
  expect(text).toContain('Text');
});

test('collapses whitespace', () => {
  expect(collapseWhitespace('  hello   world  ')).toBe('hello world');
  expect(collapseWhitespace('line1\n\n\nline2')).toBe('line1 line2');
});

test('computeContentHash returns sha256: prefix', () => {
  const hash = computeContentHash('<p>Hello world</p>');
  expect(hash).toMatch(/^sha256:[a-f0-9]{64}$/);
});

test('same content produces same hash', () => {
  const html = '<html><body><p>Consistent content</p></body></html>';
  expect(computeContentHash(html)).toBe(computeContentHash(html));
});

test('different content produces different hash', () => {
  expect(computeContentHash('<p>Hello</p>')).not.toBe(computeContentHash('<p>World</p>'));
});

test('whitespace differences in source do not change hash', () => {
  const h1 = computeContentHash('<p>Hello  world</p>');
  const h2 = computeContentHash('<p>Hello world</p>');
  expect(h1).toBe(h2); // collapsed to same normalised text
});

test('verifyContentHash passes for matching content', () => {
  const html = '<article>Some article text</article>';
  const hash = computeContentHash(html);
  expect(verifyContentHash(html, hash)).toBe(true);
});

test('verifyContentHash fails for modified content', () => {
  const hash = computeContentHash('<article>Original</article>');
  expect(verifyContentHash('<article>Modified</article>', hash)).toBe(false);
});
