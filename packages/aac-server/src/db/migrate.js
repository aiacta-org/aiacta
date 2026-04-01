/**
 * Migration runner — run with: npm run migrate
 * Applies any schema changes not handled by CREATE TABLE IF NOT EXISTS.
 */
'use strict';
const { initDb } = require('./database');
initDb().then(() => { console.log('Migration complete'); process.exit(0); });
