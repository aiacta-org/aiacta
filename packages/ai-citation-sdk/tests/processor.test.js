const { processEvent } = require('../src/node/processor');

test('skips already-processed events', async () => {
  const processed = new Set(['idem_duplicate']);
  let called = 0;
  await processEvent({ idempotency_key: 'idem_duplicate', event_type: 'citation.generated' }, {
    isProcessed:   k => processed.has(k),
    markProcessed: k => processed.add(k),
    onEvent:       async () => { called++; },
  });
  expect(called).toBe(0);
});

test('processes new events and marks them', async () => {
  const processed = new Set();
  let called = 0;
  await processEvent({ idempotency_key: 'idem_new', event_type: 'citation.generated' }, {
    isProcessed:   k => processed.has(k),
    markProcessed: k => processed.add(k),
    onEvent:       async () => { called++; },
  });
  expect(called).toBe(1);
  expect(processed.has('idem_new')).toBe(true);
});

test('processes batch events individually', async () => {
  const processed = new Set();
  const events = [
    { idempotency_key: 'k1', event_type: 'citation.generated' },
    { idempotency_key: 'k2', event_type: 'citation.generated' },
  ];
  let called = 0;
  await processEvent({ events }, {
    isProcessed:   k => processed.has(k),
    markProcessed: k => processed.add(k),
    onEvent:       async () => { called++; },
  });
  expect(called).toBe(2);
});
