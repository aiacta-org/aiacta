/**
 * Migration runner — run with: npm run migrate
 *
 * FIX: initDb() uses better-sqlite3 which is SYNCHRONOUS — it returns void,
 * not a Promise. The previous code called .then() on undefined which would
 * throw "TypeError: Cannot read properties of undefined (reading 'then')"
 * every time someone ran `npm run migrate`.
 */
'use strict';
const { initDb } = require('./database');

try {
  initDb();
  console.log('Migration complete');
  process.exit(0);
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
}
