/**
 * Query Type Classifier — §7.4.
 *
 * The AIACTA framework explicitly distinguishes two query types for PCF billing:
 *
 *   content_dependent — The AI response draws on specific publisher content.
 *                        e.g. "Summarise this news article", "What did [publication] say about X?"
 *                        → These queries COUNT toward AAC contribution calculations.
 *
 *   logical_utility   — Pure logic, computation, code generation, or general knowledge
 *                        that does not rely on specific publisher content.
 *                        e.g. "Write a Python binary search", "What is 2+2?", "Translate to French"
 *                        → These queries are EXCLUDED from attribution requirements (§7.4).
 *
 * AI providers are expected to self-classify query types before submitting citation
 * events to the AAC.  The AAC server records and trusts this classification,
 * subject to periodic audit via the Honeypot Verification system (§2.4.1).
 *
 * For v1.0, we provide a heuristic classifier that providers can use as a
 * reference implementation.  More sophisticated classifiers (ML-based) are a
 * community contribution opportunity.
 */
'use strict';

// Signals that a query is content-dependent (relies on publisher material)
const CONTENT_DEPENDENT_SIGNALS = [
  /summari[sz]e/i, /what does .+ say/i, /according to/i,
  /from .+article/i, /in .+report/i, /cited/i, /source/i,
  /this .+document/i, /based on/i, /from the article/i,
  /what .+wrote/i, /what .+published/i, /news about/i,
  /latest .+on/i, /recent .+about/i,
];

// Signals that a query is logical/utility (no specific content dependency)
const LOGICAL_UTILITY_SIGNALS = [
  /write .+(code|script|function|program)/i,
  /translate .+to/i,
  /what is \d+/i, /calculate/i, /convert/i,
  /define/i, /explain .+(concept|term|word)/i,
  /write a (poem|story|email|letter) about/i,
  /generate .+(random|uuid|id)/i,
  /format .+(json|csv|xml)/i,
  /regex for/i, /sort .+algorithm/i,
];

/**
 * Classify a query as 'content_dependent' or 'logical_utility'.
 *
 * @param {object} params
 * @param {string}   params.queryText        Optional — raw query text (may be omitted for privacy)
 * @param {string}   params.queryCategoryL1  §3.2 query_category_l1 field
 * @param {string}   params.queryCategoryL2  §3.2 query_category_l2 field
 * @param {string}   params.citationType     §3.2 citation_type field
 * @returns {'content_dependent'|'logical_utility'}
 */
function classifyQuery({ queryText = '', queryCategoryL1 = '', queryCategoryL2 = '', citationType = '' }) {
  // Citation type is the strongest signal
  if (citationType === 'factual_source' || citationType === 'recommendation') {
    return 'content_dependent';
  }

  // Category-level heuristics
  const cat = `${queryCategoryL1} ${queryCategoryL2}`.toLowerCase();
  if (cat.includes('code') || cat.includes('programming') || cat.includes('math') ||
      cat.includes('translation') || cat.includes('creative_writing')) {
    return 'logical_utility';
  }
  if (cat.includes('news') || cat.includes('article') || cat.includes('research') ||
      cat.includes('analysis') || cat.includes('factual')) {
    return 'content_dependent';
  }

  // Text-level heuristics (only if query text available)
  if (queryText) {
    if (LOGICAL_UTILITY_SIGNALS.some(r => r.test(queryText))) return 'logical_utility';
    if (CONTENT_DEPENDENT_SIGNALS.some(r => r.test(queryText))) return 'content_dependent';
  }

  // Default: if there's a citation, it's content-dependent
  return citationType ? 'content_dependent' : 'logical_utility';
}

/**
 * Calculate the effective PCF fee for a citation event.
 *
 * @param {object} event        CitationEvent
 * @param {number} pcfRateBase  Provider's registered PCF rate (e.g. 0.001)
 * @returns {number}            Fee in currency units (0 for logical_utility queries)
 */
function calculatePcfFee(event, pcfRateBase) {
  const queryType = event.query_type || classifyQuery({
    queryCategoryL1: event.citation?.query_category_l1,
    queryCategoryL2: event.citation?.query_category_l2,
    citationType:    event.citation?.citation_type,
  });
  return queryType === 'content_dependent' ? pcfRateBase : 0;
}

module.exports = { classifyQuery, calculatePcfFee };
