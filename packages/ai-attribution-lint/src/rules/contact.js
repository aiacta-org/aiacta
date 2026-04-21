/**
 * Rule: At least one Contact field should be present (§5.4).
 * Contact values should be a valid email address or URL.
 */
'use strict';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE   = /^https?:\/\/.+/i;

function classifyContact(value) {
  if (EMAIL_RE.test(value)) return 'valid email';
  if (URL_RE.test(value))   return 'valid URL';
  return 'unrecognised format — expected email or https:// URL';
}

module.exports = function ruleContact(parsed) {
  const errors   = [];
  const warnings = [];
  const findings = [];

  const contacts = parsed['Contact'];

  if (!contacts || contacts.length === 0) {
    warnings.push('No Contact field found; publishers should provide a licensing contact');
    findings.push({ field: 'Contact', value: '(missing)', status: 'warn', detail: 'publishers should provide a licensing contact' });
    return { errors, warnings, findings };
  }

  for (const value of contacts) {
    const detail = classifyContact(value);
    const isValid = detail === 'valid email' || detail === 'valid URL';
    findings.push({
      field:  'Contact',
      value,
      status: isValid ? 'ok' : 'warn',
      detail,
    });
    if (!isValid) {
      warnings.push(`Contact "${value}" — ${detail}`);
    }
  }

  return { errors, warnings, findings };
};
