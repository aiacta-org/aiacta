/**
 * Rule: Citation-Webhook endpoint should be reachable and on the same domain (§6.3).
 * Issues a WARNING (not error) for network failures since CI may run offline.
 */
'use strict';
const axios = require('axios');
const { URL } = require('url');
module.exports = async function ruleWebhookReachability(parsed, target) {
  const warnings = [];
  const endpoint = parsed['Citation-Webhook'];
  if (!endpoint) return { errors: [], warnings };
  try {
    const webhookHost = new URL(endpoint).hostname;
    const targetHost = target.startsWith('http') ? new URL(target).hostname : null;
    if (targetHost && webhookHost !== targetHost && !webhookHost.endsWith(`.${targetHost}`)) {
      warnings.push(`Citation-Webhook host "${webhookHost}" differs from target domain "${targetHost}" — DNS verification required (§6.3)`);
    }
    await axios.head(endpoint, { timeout: 5_000 });
  } catch (e) {
    warnings.push(`Citation-Webhook endpoint not reachable: ${endpoint} (${e.message})`);
  }
  return { errors: [], warnings };
};
