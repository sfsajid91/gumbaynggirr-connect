export type EventItem = {
  id: string;
  title: string;
  date: string; // ISO date (YYYY-MM-DD)
  startTime: string; // ISO datetime (YYYY-MM-DDTHH:MM)
  endTime: string; // ISO datetime (YYYY-MM-DDTHH:MM)
  place: string;
  address: string;
  lat: number;
  lon: number;
  host: string;
  about: string;
  bring: string;
  culture: string;
};
