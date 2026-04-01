/**
 * ai-citation-sdk — Node.js
 * Exports: verifyWebhookSignature, processEvent, createExpressMiddleware
 */
'use strict';
const { verifyWebhookSignature } = require('./signature');
const { processEvent }           = require('./processor');
const { createExpressMiddleware }= require('./middleware');

module.exports = { verifyWebhookSignature, processEvent, createExpressMiddleware };
