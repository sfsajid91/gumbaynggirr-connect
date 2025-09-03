import * as FileSystem from "expo-file-system";
import { EventItem } from "../types/Event";
import { getDb } from "./db";

export async function saveEvents(events: EventItem[]) {
  const db = await getDb();
  const insert = `INSERT OR REPLACE INTO events (id, title, date, startTime, endTime, place, host, address, lat, lon, about, bring, culture, location, organizer)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  await db.withTransactionAsync(async () => {
    for (const e of events) {
      await db.runAsync(
        insert,
        e.id,
        e.title,
        e.date,
        e.startTime,
        e.endTime,
        e.place,
        e.host,
        e.address,
        e.lat,
        e.lon,
        e.about,
        e.bring,
        e.culture,
        e.location || e.place,
        e.organizer || e.host
      );
    }
  });
}

export async function getCachedEvents(): Promise<EventItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    title: string;
    date: string | null;
    startTime: string | null;
    endTime: string | null;
    place: string | null;
    host: string | null;
    address: string | null;
    lat: number | null;
    lon: number | null;
    about: string | null;
    bring: string | null;
    culture: string | null;
    location: string | null;
    organizer: string | null;
  }>("SELECT * FROM events ORDER BY date DESC");
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    date: r.date ?? new Date().toISOString().slice(0, 10),
    startTime: r.startTime ?? "",
    endTime: r.endTime ?? "",
    place: r.place ?? "",
    host: r.host ?? "",
    address: r.address ?? "",
    lat: r.lat ?? 0,
    lon: r.lon ?? 0,
    about: r.about ?? "",
    bring: r.bring ?? "",
    culture: r.culture ?? "",
    location: r.location ?? r.place ?? "",
    organizer: r.organizer ?? r.host ?? "",
  }));
}

export async function storeRecording(
  eventId: string,
  tempUri: string
): Promise<string> {
  const db = await getDb();

  // Ensure recordings directory exists
  const dir = FileSystem.documentDirectory + "recordings/";
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  // Remove any previous recording for this event (enforce one note per event)
  const existing = await db.getFirstAsync<{ file_uri: string }>(
    "SELECT file_uri FROM audio_notes WHERE event_id = ? ORDER BY created_at DESC LIMIT 1",
    eventId
  );
  if (existing?.file_uri) {
    try {
      const info = await FileSystem.getInfoAsync(existing.file_uri);
      if (info.exists) {
        await FileSystem.deleteAsync(existing.file_uri, { idempotent: true });
      }
    } catch {}
    await db.runAsync("DELETE FROM audio_notes WHERE event_id = ?", eventId);
  }

  const filename = `${eventId}.m4a`;
  const dest = dir + filename;
  await FileSystem.copyAsync({ from: tempUri, to: dest });

  await db.runAsync(
    `INSERT INTO audio_notes (event_id, file_uri, duration_ms, created_at) VALUES (?, ?, ?, ?)`,
    eventId,
    dest,
    null,
    Date.now()
  );

  return dest;
}

export async function getStoredRecording(
  eventId: string
): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ file_uri: string }>(
    "SELECT file_uri FROM audio_notes WHERE event_id = ? ORDER BY created_at DESC LIMIT 1",
    eventId
  );
  return row?.file_uri || null;
}

export async function deleteStoredRecording(eventId: string): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ file_uri: string }>(
    "SELECT file_uri FROM audio_notes WHERE event_id = ? ORDER BY created_at DESC LIMIT 1",
    eventId
  );
  if (row?.file_uri) {
    try {
      const info = await FileSystem.getInfoAsync(row.file_uri);
      if (info.exists) {
        await FileSystem.deleteAsync(row.file_uri, { idempotent: true });
      }
    } catch {}
  }
  await db.runAsync("DELETE FROM audio_notes WHERE event_id = ?", eventId);
}
