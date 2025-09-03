import { EventItem } from "../types/Event";
import { getDb } from "./db";

export async function saveEvents(events: EventItem[]) {
  const db = await getDb();
  const insert = `INSERT OR REPLACE INTO events (id, title, date, startTime, endTime, place, host, address, lat, lon, about, bring, culture)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
        e.culture
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
  }));
}
