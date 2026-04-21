#!/usr/bin/env node
/**
 * ai-attribution-lint CLI — §5.7
 *
 * Produces the human-readable per-field output described in the AIACTA whitepaper:
 *
 *   ai-attribution.txt validator v1.0.12
 *   Fetching: https://example.com/.well-known/ai-attribution.txt ... OK
 *   Schema-Version: 1.0 ... OK
 *   Contact: licensing@example.com ... OK (valid email)
 *   Content-License: CC-BY-SA-4.0 ... OK (valid SPDX identifier)
 *   Citation-Webhook: https://example.com/hooks ... WARN (endpoint not reachable)
 *   Result: 1 warning, 0 errors
 *
 * Uses ANSI colour codes directly (no chalk dependency) so the output works
 * in any terminal and in CI log viewers without ESM/CJS compatibility issues.
 *
 * Exit codes:
 *   0 — passed (no errors; warnings allowed unless --strict)
 *   1 — failed (errors present, or warnings in --strict mode)
 *   2 — fetch/parse failure (file could not be retrieved)
 */
'use strict';
const yargs   = require('yargs');
const { lint } = require('./index');
const { version } = require('../package.json');

// ── ANSI helpers (works in any terminal; stripped automatically by CI) ────────
const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';

const isTTY = process.stdout.isTTY;
const col = (code, str) => isTTY ? `${code}${str}${RESET}` : str;

const ok     = str => col(GREEN,  str);
const warn   = str => col(YELLOW, str);
const err    = str => col(RED,    str);
const bold   = str => col(BOLD,   str);
const dim    = str => col(DIM,    str);

// ── Argument parsing ──────────────────────────────────────────────────────────
const argv = yargs
  .scriptName('ai-attribution-lint')
  .usage('Usage: $0 <url|path> [options]')
  .example('$0 https://example.com', 'Validate a live domain')
  .example('$0 ./ai-attribution.txt --json', 'Validate a local file, JSON output')
  .option('json',   { type: 'boolean', description: 'Output results as JSON (for CI/scripts)' })
  .option('strict', { type: 'boolean', description: 'Treat warnings as errors (exit 1)' })
  .demandCommand(1, 'Please provide a URL or file path to validate.')
  .help()
  .argv;

const target = argv._[0];

// ── Main ──────────────────────────────────────────────────────────────────────
lint(target, { json: argv.json, strict: argv.strict })
  .then(result => {

    // ── JSON mode (for CI pipelines and programmatic use) ─────────────────
    if (argv.json) {
      console.log(JSON.stringify(result, null, 2));
      const failed = result.errors.length > 0 || (argv.strict && result.warnings.length > 0);
      process.exit(failed ? 1 : 0);
      return;
    }

    // ── Human-readable mode ───────────────────────────────────────────────
    console.log('');
    console.log(bold(`ai-attribution.txt validator v${version}`));
    console.log('');

    // Fetch status line
    if (result.fetchedUrl) {
      console.log(`${dim('Fetching:')} ${result.fetchedUrl} ... ${ok('OK')}`);
    }

    // Per-field findings — one line per field checked
    for (const finding of (result.findings || [])) {
      const label = `${finding.field}: ${finding.value}`;
      const detail = finding.detail ? ` (${finding.detail})` : '';

      if (finding.status === 'ok') {
        console.log(`${label} ... ${ok('OK')}${dim(detail)}`);
      } else if (finding.status === 'warn') {
        console.log(`${label} ... ${warn('WARN')}${dim(detail)}`);
      } else if (finding.status === 'error') {
        console.log(`${label} ... ${err('ERROR')}${dim(detail)}`);
      }
    }

    // Any errors or warnings that don't belong to a specific field
    for (const e of result.errors) {
      console.log(`${err('ERROR')} ${e}`);
    }
    for (const w of result.warnings) {
      // Skip per-field warnings already shown in findings
      if (!result.findings?.some(f => f.status === 'warn' && f.detail && w.includes(f.detail))) {
        console.log(`${warn('WARN')} ${w}`);
      }
    }
    for (const i of result.info) {
      console.log(`${dim('INFO')} ${i}`);
    }

    // Summary line
    console.log('');
    const errorCount   = result.errors.length;
    const warningCount = result.warnings.length;

    if (errorCount === 0 && warningCount === 0) {
      console.log(ok(`Result: no warnings, no errors ✓`));
    } else {
      const parts = [];
      if (warningCount > 0) parts.push(warn(`${warningCount} warning${warningCount > 1 ? 's' : ''}`));
      if (errorCount > 0)   parts.push(err(`${errorCount} error${errorCount > 1 ? 's' : ''}`));
      console.log(`Result: ${parts.join(', ')}`);
    }
    console.log('');

    const failed = errorCount > 0 || (argv.strict && warningCount > 0);
    process.exit(failed ? 1 : 0);
  })
  .catch(err => {
    if (!argv.json) {
      process.stderr.write(`\n${err.message}\nExit: 2 (fetch/parse failure)\n\n`);
    } else {
      console.log(JSON.stringify({ error: err.message, exit: 2 }));
    }
    process.exit(2);
  });
