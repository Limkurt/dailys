import * as SQLite from 'expo-sqlite' 

let db: SQLite.SQLiteDatabase | null = null;

export function getDB(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('DB not initialised - call initDB() first')
    return db;
}

const CURRENT_VERSION = 1; // Change this every change

// Boot entry point
export async function initDB(): Promise<void> {
  db = await SQLite.openDatabaseAsync('habits.db');

  // Enable WAL mode: faster writes, reads don't block writes
  await db.execAsync('PRAGMA journal_mode = WAL;');
  // Enforce FK constraints: Make sure entry have parent (Habit)
  await db.execAsync('PRAGMA foreign_keys = ON;');

  await runMigrations(db);
}

// Migration runner
/// This checks current version, run only the migrations you haven't run yet.
async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const versionRow = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion < 1) {
    await migrate_v1(db);
  }
}

async function migrate_v1(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),

      -- identity
      name          TEXT NOT NULL,
      question      TEXT NOT NULL,
      type          TEXT NOT NULL
                    CHECK (type IN ('boolean','measurable')),
      color         TEXT,

      -- schedule
      frequency     TEXT NOT NULL DEFAULT 'daily'
                    CHECK (frequency IN ('daily', 'weekdays', 'weekends', 'custom')),
      frequency_days  TEXT, -- JSON array e.g. '["mon", "wed", "fri"] for custom frequency

      -- measurable-only (NULL for boolean habits)
      unit          TEXT,
      target        REAL,
      target_type   TEXT
                    CHECK (target_type IS NULL or target_type IN ('at_least', 'at_most')),

      -- reminders
      reminder_enabled  INTEGER NOT NULL DEFAULT 0,   -- 0 | 1
      reminder_time     TEXT,                         -- "(HH:MM, 24H)"

      -- meta
      notes         TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      archived      INTEGER NOT NULL DEFAULT 0
      );
      
    CREATE TABLE IF NOT EXISTS entries (
      id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
      habit_id    TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      date        TEXT NOT NULL,      -- YYYY-MM-DD always
      
      -- boolean habits: completed = 1, skipped = 0 or NULL
      -- measurable habits: completed = 1 if value meets target, else 0
      completed   INTEGER NOT NULL DEFAULT 0,
      
      -- measurable-only
      value       REAL,               -- actual recorded value
      
      notes       TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(habit_id, date)
      );
      
      -- indexes
      CREATE INDEX IF NOT EXISTS idx_entries_habit_date ON entries(habit_id, date);
      CREATE INDEX IF NOT EXISTS idx_entries_date       ON entries(date);
      CREATE INDEX IF NOT EXISTS idx_habits_type        ON habits(type);
      CREATE INDEX IF NOT EXISTS idx_habits_archived    ON habits(archived);
    `);
  
  await db.execAsync('PRAGMA user_version = 1');
}