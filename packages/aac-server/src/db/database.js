/**
 * SQLite database initialisation for the AAC reference server.
 * better-sqlite3 is fully SYNCHRONOUS — do not use async/await here.
 * In production, swap for PostgreSQL by replacing the driver and
 * converting queries to async (pg or kysely recommended).
 */
'use strict';
const Database = require('better-sqlite3');
const path     = require('path');

const DB_PATH = process.env.AAC_DB_PATH || path.join(__dirname, '../../aac.db');
let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');  // better concurrency for web servers
    db.pragma('foreign_keys = ON');
  }
  return db;
}

/**
 * Creates all tables if they do not already exist.
 * Synchronous — safe to call at startup before app.listen().
 */
function initDb() {
  const d = getDb();
  d.exec(`
    CREATE TABLE IF NOT EXISTS providers (
      id                TEXT PRIMARY KEY,
      name              TEXT NOT NULL,
      contribution_mode TEXT NOT NULL CHECK(contribution_mode IN ('rpa','pcf')),
      rpa_rate          REAL,
      pcf_rate          REAL,
      enrolled_at       TEXT NOT NULL DEFAULT (datetime('now')),
      status            TEXT NOT NULL DEFAULT 'active'
        CHECK(status IN ('active','suspended','non-compliant'))
    );

    CREATE TABLE IF NOT EXISTS publishers (
      id              TEXT PRIMARY KEY,
      domain          TEXT NOT NULL UNIQUE,
      reward_tier     TEXT NOT NULL DEFAULT 'standard',
      content_license TEXT NOT NULL DEFAULT 'All-Rights-Reserved',
      webhook_url     TEXT,
      verified_at     TEXT,
      status          TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending','verified','suspended'))
    );

    CREATE TABLE IF NOT EXISTS domain_verification_tokens (
      publisher_id TEXT NOT NULL REFERENCES publishers(id),
      token        TEXT NOT NULL,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (publisher_id)
    );

    CREATE TABLE IF NOT EXISTS citation_events (
      id              TEXT PRIMARY KEY,
      idempotency_key TEXT NOT NULL UNIQUE,
      provider_id     TEXT NOT NULL REFERENCES providers(id),
      publisher_id    TEXT REFERENCES publishers(id),
      cited_url       TEXT NOT NULL,
      citation_type   TEXT NOT NULL,
      query_category  TEXT,
      query_type      TEXT CHECK(query_type IN ('content_dependent','logical_utility') OR query_type IS NULL),
      model           TEXT,
      user_country    TEXT,
      event_timestamp TEXT NOT NULL,
      received_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS distribution_runs (
      id           TEXT PRIMARY KEY,
      period_from  TEXT NOT NULL,
      period_to    TEXT NOT NULL,
      pool_balance REAL NOT NULL,
      status       TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending','completed','failed')),
      run_at       TEXT,
      payouts      TEXT  -- JSON array of {publisher_id, domain, citation_count, weight, amount}
    );

    CREATE TABLE IF NOT EXISTS hold_queue (
      id            TEXT PRIMARY KEY,
      domain        TEXT NOT NULL,
      reason        TEXT NOT NULL,
      accrued_fees  REAL NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      resolved_at   TEXT,
      resolution    TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_citation_provider   ON citation_events(provider_id);
    CREATE INDEX IF NOT EXISTS idx_citation_publisher  ON citation_events(publisher_id);
    CREATE INDEX IF NOT EXISTS idx_citation_timestamp  ON citation_events(event_timestamp);
    CREATE INDEX IF NOT EXISTS idx_citation_query_type ON citation_events(query_type);
  `);
  console.log('[aac-server] Database ready at', DB_PATH);
}

module.exports = { getDb, initDb };
