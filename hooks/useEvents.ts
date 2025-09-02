import { useEffect, useState } from "react";
import { getCachedEvents, saveEvents } from "../lib/storage";
import { EventItem } from "../types/Event";

export function useEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const cached = await getCachedEvents();
        if (mounted)
          setEvents(
            cached.length
              ? cached
              : [
                  {
                    id: "1",
                    title: "Gumbaynggirr Language Circle",
                    start: new Date().toISOString(),
                    location: "Bowraville Hall",
                    latitude: -30.651,
                    longitude: 152.854,
                  },
                ]
          );

        // simulate remote fetch
        if (typeof fetch !== "undefined") {
          const fresh = [
            {
              id: "1",
              title: "Gumbaynggirr Language Circle",
              start: new Date().toISOString(),
              location: "Bowraville Hall",
              latitude: -30.651,
              longitude: 152.854,
            },
          ] satisfies EventItem[];
          await saveEvents(fresh);
          if (mounted) setEvents(fresh);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { events, loading };
}
