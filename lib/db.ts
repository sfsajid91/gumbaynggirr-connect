import * as SQLite from "expo-sqlite";

let database: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (database) return database;
  database = await SQLite.openDatabaseAsync("gumbaynggirr.db");

  // Check if we need to migrate the events table
  const tables = await database.getAllAsync(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='events'"
  );
  if (tables.length > 0) {
    // Check if the old schema exists (has 'time' column instead of 'startTime' and 'endTime')
    const columns = await database.getAllAsync("PRAGMA table_info(events)");
    const hasOldSchema = columns.some((col: any) => col.name === "time");

    if (hasOldSchema) {
      // Drop the old table and recreate with new schema
      await database.execAsync("DROP TABLE IF EXISTS events");
    }
  }

  await database.execAsync(
    `CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      place TEXT NOT NULL,
      host TEXT NOT NULL,
      address TEXT NOT NULL,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      about TEXT NOT NULL,
      bring TEXT NOT NULL,
      culture TEXT NOT NULL,
      location TEXT,
      organizer TEXT
    );`
  );
  await database.execAsync(
    `CREATE TABLE IF NOT EXISTS audio_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL,
      file_uri TEXT NOT NULL,
      duration_ms INTEGER,
      created_at INTEGER
    );`
  );
  return database;
}
