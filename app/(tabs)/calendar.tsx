import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AnimatedPress } from "../../components/AnimatedPress";
import { BottomSheet } from "../../components/BottomSheet";
import { EventCard } from "../../components/EventCard";
import { Skeleton } from "../../components/Skeleton";
import { Colors } from "../../constants/colors";
import { useEvents } from "../../hooks/useEvents";

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
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const current = useMemo(() => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [today, monthOffset]);

  const month = current.toLocaleString(undefined, { month: "long" });
  const year = current.getFullYear();

  const firstDay = new Date(year, current.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, current.getMonth() + 1, 0).getDate();

  const cells = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const { events, loading } = useEvents();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.warmWhite, padding: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Pressable onPress={() => setMonthOffset((v) => v - 1)}>
          <Text style={{ color: Colors.riverBlue, fontWeight: "700" }}>←</Text>
        </Pressable>
        <Text
          style={{ color: Colors.deepEarth, fontWeight: "700", fontSize: 18 }}
        >
          {month} {year}
        </Text>
        <Pressable onPress={() => setMonthOffset((v) => v + 1)}>
          <Text style={{ color: Colors.riverBlue, fontWeight: "700" }}>→</Text>
        </Pressable>
      </View>

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

      <BottomSheet initialSnap={0.45}>
        <Text
          style={{ fontWeight: "700", color: Colors.textDark, marginBottom: 8 }}
        >
          Today's Events
        </Text>
        {loading ? (
          <Skeleton height={64} />
        ) : (
          events.map((ev) => (
            <Link key={ev.id} href={`/event/${ev.id}`} asChild>
              <AnimatedPress style={{ marginBottom: 10 }}>
                <EventCard
                  title={`🔴 ${ev.title}`}
                  subtitle={`📍 ${ev.location ?? "TBA"}`}
                  accent="sunset"
                />
              </AnimatedPress>
            </Link>
          ))
        )}
      </BottomSheet>
    </View>
  );
}
