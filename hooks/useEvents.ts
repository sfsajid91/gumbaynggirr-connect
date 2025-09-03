import { useEffect, useState } from "react";
import eventsData from "../data/events.json";
import { getCachedEvents, saveEvents } from "../lib/storage";
import { EventItem } from "../types/Event";

export function useEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadEvents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Load cached events first
      const cached = await getCachedEvents();
      if (cached.length > 0) {
        setEvents(cached);
      }

      // Load from JSON file
      const freshEvents = eventsData as EventItem[];
      await saveEvents(freshEvents);
      setEvents(freshEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const refresh = () => loadEvents(true);

  return { events, loading, refreshing, refresh };
}
