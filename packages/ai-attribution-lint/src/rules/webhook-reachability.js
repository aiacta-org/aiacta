/**
 * Rule: Citation-Webhook endpoint should be a valid HTTPS URL, on the same
 * domain as the publisher, and reachable (§3.4, §6.3).
 *
 * Issues a WARNING (not an error) for network failures because:
 *   - CI may run in environments without internet access
 *   - The endpoint may require a POST body to return 200
 *   - A 405 (Method Not Allowed) on HEAD still means the server is up
 *
 * For a publisher, an unreachable webhook means they will never receive
 * citation notifications — important to flag but not a spec violation.
 */
'use strict';
const axios     = require('axios');
const { URL }   = require('url');

module.exports = async function ruleWebhookReachability(parsed, target) {
  const errors   = [];
  const warnings = [];
  const findings = [];

  const endpoint = parsed['Citation-Webhook'];
  if (!endpoint) return { errors, warnings, findings };

  // Validate it is a proper HTTPS URL
  let webhookUrl;
  try {
    webhookUrl = new URL(endpoint);
  } catch (_) {
    errors.push(`Citation-Webhook "${endpoint}" is not a valid URL`);
    findings.push({ field: 'Citation-Webhook', value: endpoint, status: 'error', detail: 'not a valid URL' });
    return { errors, warnings, findings };
  }

  if (webhookUrl.protocol !== 'https:') {
    errors.push(`Citation-Webhook must use HTTPS (got ${webhookUrl.protocol})`);
    findings.push({ field: 'Citation-Webhook', value: endpoint, status: 'error', detail: 'must use HTTPS' });
    return { errors, warnings, findings };
  }

  // Cross-domain check (§6.3) — webhook must be on the publisher's own domain
  if (target && target.startsWith('http')) {
    try {
      const targetHost  = new URL(target).hostname;
      const webhookHost = webhookUrl.hostname;
      if (webhookHost !== targetHost && !webhookHost.endsWith(`.${targetHost}`)) {
        warnings.push(
          `Citation-Webhook host "${webhookHost}" differs from publisher domain "${targetHost}" — ` +
          `DNS verification will be required by the AAC (§6.3)`
        );
        findings.push({
          field:  'Citation-Webhook',
          value:  endpoint,
          status: 'warn',
          detail: `cross-domain webhook (${webhookHost} ≠ ${targetHost}) — DNS verification required`,
        });
        return { errors, warnings, findings };
      }
    } catch (_) { /* target may not be a URL for local file mode */ }
  }

  // Reachability check — HEAD request with 5s timeout
  // 405 (Method Not Allowed) is acceptable — server is up but only accepts POST
  try {
    const res = await axios.head(endpoint, {
      timeout: 5_000,
      maxRedirects: 3,
      validateStatus: s => s < 500, // anything below 500 means the server responded
    });
    const status = res.status;
    if (status === 200 || status === 204 || status === 405) {
      findings.push({ field: 'Citation-Webhook', value: endpoint, status: 'ok', detail: `endpoint reachable (HTTP ${status})` });
    } else {
      warnings.push(`Citation-Webhook returned HTTP ${status} — expected 200 or 405`);
      findings.push({ field: 'Citation-Webhook', value: endpoint, status: 'warn', detail: `unexpected HTTP ${status}` });
    }
  } catch (e) {
    const reason = e.code === 'ECONNREFUSED' ? 'connection refused' :
                   e.code === 'ENOTFOUND'    ? 'DNS resolution failed' :
                   e.code === 'ETIMEDOUT'    ? 'timed out after 5s' :
                   e.message;
    warnings.push(`Citation-Webhook endpoint not reachable: ${endpoint} (${reason})`);
    findings.push({ field: 'Citation-Webhook', value: endpoint, status: 'warn', detail: `endpoint not reachable (${reason})` });
  }

  return { errors, warnings, findings };
};
