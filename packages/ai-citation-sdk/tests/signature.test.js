const crypto = require('crypto');
const { verifyWebhookSignature } = require('../src/node/signature');

function makeHeader(payload, timestamp, secret) {
  const signed = `${timestamp}.${payload}`;
  const hex = crypto.createHmac('sha256', secret).update(signed).digest('hex');
  return `sha256=${hex}`;
}

test('valid signature passes', () => {
  const ts = String(Math.floor(Date.now() / 1000));
  const payload = '{"event_type":"citation.generated"}';
  const sig = makeHeader(payload, ts, 'mysecret');
  expect(verifyWebhookSignature(payload, ts, sig, 'mysecret')).toBe(true);
});

test('tampered payload fails', () => {
  const ts = String(Math.floor(Date.now() / 1000));
  const sig = makeHeader('original', ts, 'mysecret');
  expect(verifyWebhookSignature('tampered', ts, sig, 'mysecret')).toBe(false);
});

test('old timestamp throws', () => {
  const oldTs = String(Math.floor(Date.now() / 1000) - 400);
  expect(() => verifyWebhookSignature('{}', oldTs, 'sha256=abc', 'secret')).toThrow();
});

test('missing signature header returns false', () => {
  const ts = String(Math.floor(Date.now() / 1000));
  expect(verifyWebhookSignature('{}', ts, undefined, 'secret')).toBe(false);
});

test('malformed signature header returns false', () => {
  const ts = String(Math.floor(Date.now() / 1000));
  expect(verifyWebhookSignature('{}', ts, 'sha256=not-hex', 'secret')).toBe(false);
});

test('non-numeric timestamp returns false', () => {
  expect(verifyWebhookSignature('{}', 'not-a-timestamp', 'sha256=abc', 'secret')).toBe(false);
});
