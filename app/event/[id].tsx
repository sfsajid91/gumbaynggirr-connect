import { Stack, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { useEvents } from "../../hooks/useEvents";
import { startRecording, stopAndSaveRecording } from "../../lib/audio";
import { getUserLocation, haversineKm } from "../../lib/location";

export default function EventDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recordingRef = useRef<any>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const { events } = useEvents();

  async function updateDistance() {
    const ev = events.find((e) => e.id === String(id));
    if (!ev || ev.latitude == null || ev.longitude == null) return;
    const loc = await getUserLocation();
    if (!loc) return;
    const km = haversineKm(
      { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
      { latitude: ev.latitude, longitude: ev.longitude }
    );
    setDistanceKm(Math.round(km * 10) / 10);
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.warmWhite }}>
      <Stack.Screen options={{ title: "Event", headerShown: true }} />
      <View
        style={{
          height: 180,
          backgroundColor: Colors.deepEarth,
          justifyContent: "flex-end",
          padding: 16,
        }}
      >
        <Text style={{ color: "white", fontWeight: "800", fontSize: 20 }}>
          Gumbaynggirr Language Circle
        </Text>
        <Text style={{ color: "#f4e8dc" }}>Thu, Sep 17 • 10:00-12:00</Text>
      </View>

      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          {[
            { label: "Save", emoji: "📅", onPress: () => {} },
            { label: "Map", emoji: "🗺️", onPress: updateDistance },
            {
              label: recordingRef.current ? "Stop" : "Rec",
              emoji: "🎤",
              onPress: async () => {
                if (!id) return;
                if (!recordingRef.current) {
                  const rec = await startRecording();
                  recordingRef.current = rec;
                } else {
                  const uri = await stopAndSaveRecording(
                    String(id),
                    recordingRef.current
                  );
                  recordingRef.current = null;
                  if (uri) setRecordingUri(uri);
                }
              },
            },
            { label: "Off", emoji: "💾", onPress: () => {} },
          ].map((a) => (
            <Pressable
              key={a.label}
              onPress={a.onPress}
              style={{
                backgroundColor: Colors.softGrey,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
              }}
            >
              <Text style={{ fontWeight: "700", color: Colors.textDark }}>
                {a.emoji} {a.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              color: Colors.textDark,
              marginBottom: 8,
            }}
          >
            About this gathering
          </Text>
          <Text style={{ color: Colors.textMedium }}>
            Community language circle led by elders. All welcome.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              color: Colors.textDark,
              marginBottom: 8,
            }}
          >
            What to bring
          </Text>
          <Text style={{ color: Colors.textMedium }}>
            Notebook, water, and a respectful heart.
          </Text>
        </View>

        <Text style={{ color: Colors.successGreen, fontWeight: "600" }}>
          ● Available offline
        </Text>
        {distanceKm != null ? (
          <Text style={{ marginTop: 4, color: Colors.textMedium }}>
            Distance: {distanceKm} km
          </Text>
        ) : null}
        {recordingUri ? (
          <Text style={{ marginTop: 8, color: Colors.textMedium }}>
            Saved voice note: {recordingUri}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
