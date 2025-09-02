export type EventItem = {
  id: string;
  title: string;
  start: string; // ISO date
  end?: string; // ISO date
  location?: string;
  address?: string;
  organizer?: string;
  heroImageUrl?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
};
