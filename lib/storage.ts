import { EventItem } from "../types/Event";
import { getDb } from "./db";

export async function saveEvents(events: EventItem[]) {
  const db = await getDb();
  const insert = `INSERT OR REPLACE INTO events (id, title, start, end, location, address, organizer, heroImageUrl, type, latitude, longitude)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  await db.withTransactionAsync(async () => {
    for (const e of events) {
      await db.runAsync(
        insert,
        e.id,
        e.title,
        e.start ?? null,
        e.end ?? null,
        e.location ?? null,
        e.address ?? null,
        e.organizer ?? null,
        e.heroImageUrl ?? null,
        e.type ?? null,
        e.latitude ?? null,
        e.longitude ?? null
      );
    }
  });
}

export async function getCachedEvents(): Promise<EventItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    title: string;
    start: string | null;
    end: string | null;
    location: string | null;
    address: string | null;
    organizer: string | null;
    heroImageUrl: string | null;
    type: string | null;
    latitude: number | null;
    longitude: number | null;
  }>("SELECT * FROM events ORDER BY start DESC");
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    start: r.start ?? new Date().toISOString(),
    end: r.end ?? undefined,
    location: r.location ?? undefined,
    address: r.address ?? undefined,
    organizer: r.organizer ?? undefined,
    heroImageUrl: r.heroImageUrl ?? undefined,
    type: r.type ?? undefined,
    latitude: r.latitude ?? undefined,
    longitude: r.longitude ?? undefined,
  }));
}
