#!/usr/bin/env node
/**
 * ai-attribution-lint CLI entry point (§5.7)
 * Usage: npx @aiacta-org/ai-attribution-lint <url|file>
 */
'use strict';
const yargs = require('yargs');
const { lint } = require('./index');

const argv = yargs
  .usage('Usage: $0 <url|path>')
  .option('json', { type: 'boolean', description: 'Output results as JSON' })
  .option('strict', { type: 'boolean', description: 'Exit 1 on warnings' })
  .demandCommand(1)
  .help()
  .argv;

lint(argv._[0], { json: argv.json, strict: argv.strict })
  .then(result => {
    if (argv.json) { console.log(JSON.stringify(result, null, 2)); }
    process.exit(result.errors.length > 0 || (argv.strict && result.warnings.length > 0) ? 1 : 0);
  })
  .catch(err => { console.error(err.message); process.exit(2); });
