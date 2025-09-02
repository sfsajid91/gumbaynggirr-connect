import * as SQLite from "expo-sqlite";

let database: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (database) return database;
  database = await SQLite.openDatabaseAsync("gumbaynggirr.db");
  await database.execAsync(
    `CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      start TEXT,
      end TEXT,
      location TEXT,
      address TEXT,
      organizer TEXT,
      heroImageUrl TEXT,
      type TEXT,
      latitude REAL,
      longitude REAL
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
