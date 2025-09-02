import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { EventCard } from "../components/EventCard";
import { Skeleton } from "../components/Skeleton";
import { Colors } from "../constants/colors";
import { useEvents } from "../hooks/useEvents";

const days = [
  { key: "sun", label: "S" },
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
];

export default function CalendarScreen() {
  const [monthOffset, setMonthOffset] = useState(0);
  const { events, loading } = useEvents();

  const current = useMemo(() => {
    const today = new Date();
    const d = new Date(today);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const month = current.toLocaleString(undefined, { month: "long" });
  const year = current.getFullYear();

  const firstDay = new Date(year, current.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, current.getMonth() + 1, 0).getDate();

  const cells = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  return (
    <View style={{ flex: 1, backgroundColor: Colors.warmWhite }}>
      <Stack.Screen options={{ title: "Calendar", headerShown: true }} />

      <View style={{ padding: 16 }}>
        {/* Month Navigator */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Pressable onPress={() => setMonthOffset((v) => v - 1)}>
            <Text style={{ color: Colors.riverBlue, fontWeight: "700" }}>
              ←
            </Text>
          </Pressable>
          <Text
            style={{ color: Colors.deepEarth, fontWeight: "700", fontSize: 18 }}
          >
            {month} {year}
          </Text>
          <Pressable onPress={() => setMonthOffset((v) => v + 1)}>
            <Text style={{ color: Colors.riverBlue, fontWeight: "700" }}>
              →
            </Text>
          </Pressable>
        </View>

        {/* Weekday headers */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          {days.map((d) => (
            <Text
              key={d.key}
              style={{
                width: `${100 / 7}%`,
                textAlign: "center",
                color: Colors.textMedium,
              }}
            >
              {d.label}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {cells.map((n, idx) => (
            <View
              key={idx}
              style={{
                width: `${100 / 7}%`,
                aspectRatio: 1,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 6,
              }}
            >
              {n && (
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      n % 7 === 3 ? Colors.primaryOchre : "transparent",
                  }}
                >
                  <Text
                    style={{ color: n % 7 === 3 ? "white" : Colors.textDark }}
                  >
                    {n}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Today's Events */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              fontWeight: "700",
              color: Colors.textDark,
              marginBottom: 8,
            }}
          >
            Today&apos;s Events
          </Text>
          {loading ? (
            <Skeleton height={64} />
          ) : (
            events.map((ev) => (
              <EventCard
                key={ev.id}
                title={`🔴 ${ev.title}`}
                subtitle={`📍 ${ev.location ?? "TBA"}`}
                accent="sunset"
              />
            ))
          )}
        </View>
      </View>
    </View>
  );
}
