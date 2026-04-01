const { classifyQuery, calculatePcfFee } = require('../src/services/query-classifier');

describe('classifyQuery', () => {
  test('factual_source citation type → content_dependent', () => {
    expect(classifyQuery({ citationType: 'factual_source' })).toBe('content_dependent');
  });

  test('recommendation citation type → content_dependent', () => {
    expect(classifyQuery({ citationType: 'recommendation' })).toBe('content_dependent');
  });

  test('coding query text → logical_utility', () => {
    expect(classifyQuery({ queryText: 'Write a Python binary search algorithm' })).toBe('logical_utility');
  });

  test('news category → content_dependent', () => {
    expect(classifyQuery({ queryCategoryL1: 'news', queryCategoryL2: 'politics' })).toBe('content_dependent');
  });

  test('programming category → logical_utility', () => {
    expect(classifyQuery({ queryCategoryL1: 'programming', queryCategoryL2: 'python' })).toBe('logical_utility');
  });

  test('math query text → logical_utility', () => {
    expect(classifyQuery({ queryText: 'Calculate the area of a circle with radius 5' })).toBe('logical_utility');
  });

  test('summarise article query → content_dependent', () => {
    expect(classifyQuery({ queryText: 'Summarise this article about climate change' })).toBe('content_dependent');
  });
});

describe('calculatePcfFee', () => {
  test('logical_utility query → $0 fee', () => {
    const event = { query_type: 'logical_utility' };
    expect(calculatePcfFee(event, 0.001)).toBe(0);
  });

  test('content_dependent query → rate fee', () => {
    const event = { query_type: 'content_dependent' };
    expect(calculatePcfFee(event, 0.001)).toBe(0.001);
  });
});
