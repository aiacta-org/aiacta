#!/usr/bin/env node
/**
 * scripts/sync-versions.js
 *
 * Reads the version from the root package.json and writes it to:
 *   - Every package.json in packages/
 *   - packages/ai-citation-sdk/src/python/setup.py
 *
 * Run manually:  node scripts/sync-versions.js
 * Run via npm:   npm run sync-versions
 * Run in CI:     node scripts/sync-versions.js (called by version-sync.yml)
 */

'use strict';
const fs   = require('fs');
const path = require('path');

// ── Read the single source of truth 
const rootPkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const version = rootPkg.version;

if (!version) {
  console.error('ERROR: root package.json has no "version" field.');
  process.exit(1);
}

console.log(`\nSyncing all packages to version ${version}\n`);

// ── Subpackages to update on new release  
const packages = [
  'packages/ai-attribution-lint',
  'packages/ai-citation-sdk',
  'packages/crawl-manifest-client',
  'packages/aac-server',
  'packages/aac-dashboard-lite',
  'packages/vwp-gateway',
  'packages/referrer-middleware',
  'packages/honeypot-verifier',
  'packages/attribution-test-harness',
];

let changed = 0;

for (const pkgDir of packages) {
  const pkgPath = path.join(__dirname, '..', pkgDir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.warn(`  SKIP  ${pkgDir}/package.json (not found)`);
    continue;
  }
  const pkg     = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const oldVer  = pkg.version;
  pkg.version   = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  if (oldVer !== version) {
    console.log(`  ✓  ${pkgDir}/package.json  ${oldVer} → ${version}`);
    changed++;
  } else {
    console.log(`  –  ${pkgDir}/package.json  already ${version}`);
  }
}

// ── Python setup.py 
const setupPath = path.join(__dirname, '../packages/ai-citation-sdk/src/python/setup.py');
if (fs.existsSync(setupPath)) {
  let setup    = fs.readFileSync(setupPath, 'utf8');
  const oldSetup = setup;
  // Replace version='x.y.z' or version="x.y.z" with the new version
  setup = setup.replace(/version\s*=\s*['"][^'"]+['"]/, `version='${version}'`);
  if (setup !== oldSetup) {
    fs.writeFileSync(setupPath, setup);
    console.log(`  ✓  packages/ai-citation-sdk/src/python/setup.py → ${version}`);
    changed++;
  } else {
    console.log(`  –  packages/ai-citation-sdk/src/python/setup.py  already ${version}`);
  }
} else {
  console.warn('  SKIP  packages/ai-citation-sdk/src/python/setup.py (not found)');
}

// ── Summary 
console.log(`\n${changed} file(s) updated to ${version}\n`);
