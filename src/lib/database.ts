import Database from 'better-sqlite3';

let db: Database.Database | null = null;

// Returns a singleton better-sqlite3 Database instance.
// Opens the database at DATABASE_PATH (default: /home/services/openotter/openotter.db).
// Sets WAL journal mode for concurrent reads.
// Creates the recordings table if it does not exist.
// filepath column stores a LOCAL filesystem path (not a URL).
export function getDatabase(): Database.Database {
  if (db) return db;

  const dbPath = process.env.DATABASE_PATH || '/home/services/openotter/openotter.db';
  db = new Database(dbPath);

  // WAL mode: better performance for concurrent reads, single-user write
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS recordings (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      status TEXT NOT NULL,
      audio_duration INTEGER,
      confidence REAL,
      speaker_count INTEGER,
      utterances_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  runMigrations(db);

  return db;
}

// Idempotent migration: adds the three date columns if they don't already exist.
// SQLite ALTER TABLE ADD COLUMN is O(1) and safe on tables with existing rows
// as long as columns are nullable (no NOT NULL without a DEFAULT).
function runMigrations(db: Database.Database): void {
  const columns = db.pragma('table_info(recordings)') as Array<{ name: string }>;
  const names = new Set(columns.map((c) => c.name));
  if (!names.has('file_created_at')) {
    db.exec('ALTER TABLE recordings ADD COLUMN file_created_at TEXT');
  }
  if (!names.has('recorded_at')) {
    db.exec('ALTER TABLE recordings ADD COLUMN recorded_at TEXT');
  }
  if (!names.has('transcribed_at')) {
    db.exec('ALTER TABLE recordings ADD COLUMN transcribed_at TEXT');
  }
}
