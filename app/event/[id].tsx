import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import VoiceRecorder from "../../components/VoiceRecorder";
import { Colors } from "../../constants/colors";
import { useEvents } from "../../hooks/useEvents";
import { fastDistanceKm, getUserLocation } from "../../lib/location";

export default function EventDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [travelTime, setTravelTime] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const { events, loading } = useEvents();

  const event = events.find((e) => e.id === String(id));

  const updateLocationInfo = useCallback(async () => {
    if (!event || event.lat == null || event.lon == null) return;

    try {
      const loc = await getUserLocation();
      if (!loc) return;

      // Use faster equirectangular approximation for distance
      const km = fastDistanceKm(
        { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
        { latitude: event.lat, longitude: event.lon }
      );
      setDistanceKm(Math.round(km * 10) / 10);

      // Estimate travel time (rough calculation: 50km/h average)
      const timeInMinutes = Math.round((km / 50) * 60);
      if (timeInMinutes < 60) {
        setTravelTime(`${timeInMinutes} min`);
      } else {
        const hours = Math.floor(timeInMinutes / 60);
        const minutes = timeInMinutes % 60;
        setTravelTime(`${hours}h ${minutes}m`);
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  }, [event]);

  useEffect(() => {
    updateLocationInfo();
  }, [id, updateLocationInfo]);

  const handleViewMap = async () => {
    if (!event || event.lat == null || event.lon == null) {
      console.log(
        "Location not available - This event doesn't have location coordinates."
      );
      return;
    }

    const lat = event.lat;
    const lon = event.lon;
    const label = encodeURIComponent(event.place || event.location || "Venue");

    const androidUrl = `geo:${lat},${lon}?q=${lat},${lon}(${label})`;
    const iosUrl = `http://maps.apple.com/?ll=${lat},${lon}&q=${label}`;
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

    try {
      await Linking.openURL(Platform.OS === "ios" ? iosUrl : androidUrl);
    } catch {
      try {
        await Linking.openURL(webUrl);
      } catch (e) {
        console.log("Error - Unable to open maps application", e);
        ToastAndroid.show("Unable to open maps", ToastAndroid.SHORT);
      }
    }
  };

  const handleGetDirections = async () => {
    if (!event || event.lat == null || event.lon == null) {
      console.log(
        "Location not available - This event doesn't have location coordinates."
      );
      return;
    }

    const lat = event.lat;
    const lon = event.lon;
    const androidUrl = `google.navigation:q=${lat},${lon}`;
    const iosUrl = `http://maps.apple.com/?daddr=${lat},${lon}&dirflg=d`;
    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

    try {
      await Linking.openURL(Platform.OS === "ios" ? iosUrl : androidUrl);
    } catch {
      try {
        await Linking.openURL(webUrl);
      } catch (e) {
        console.log("Error - Unable to open maps application", e);
        ToastAndroid.show("Unable to open maps", ToastAndroid.SHORT);
      }
    }
  };

  const handleReminderToggle = async () => {
    // For now, just toggle the reminder state
    setIsSaved(!isSaved);
    console.log("Event reminder toggled (simulated)");
  };

  const handleShareEvent = async () => {
    if (!event) return;
    try {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      const lines = [
        `${event.title}`,
        "",
        `Date: ${start.toLocaleDateString()}`,
        `Time: ${start.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${end.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        `Location: ${event.address || event.location || event.place}`,
        event.organizer || event.host
          ? `Organizer: ${event.organizer || event.host}`
          : "",
        event.about ? "" : "",
        event.about ? `About: ${event.about}` : "",
      ].filter(Boolean);

      await Share.share({ message: lines.join("\n") });
    } catch (e) {
      console.log("Error sharing event:", e);
      ToastAndroid.show("Unable to share event", ToastAndroid.SHORT);
    }
  };

  const handleOfflineMode = () => {
    // For now, just log the action
    // TODO: Implement toast notification when react-native-toast-message is available
    ToastAndroid.show("Event is now available offline", ToastAndroid.SHORT);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Gumbaynggirr Connect",
            headerShown: true,
            headerStyle: { backgroundColor: Colors.deepEarth },
            headerTintColor: "white",
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryOchre} />
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Event", headerShown: true }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Gumbaynggirr Connect",
          headerShown: true,
          headerStyle: { backgroundColor: Colors.deepEarth },
          headerTintColor: "white",
          headerRight: () => (
            <Pressable
              onPress={handleShareEvent}
              style={({ pressed }) => [
                styles.shareButton,
                {
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
            >
              <Ionicons name="share-outline" size={24} color="white" />
            </Pressable>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section with Gradient */}
        <View style={styles.heroContainer}>
          <View style={styles.heroSection} />

          {/* Event Info */}
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDate}>
              {new Date(event.date).toLocaleDateString("en-AU", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              •{" "}
              {new Date(event.startTime).toLocaleTimeString([], {
                hour: "numeric",
                minute: "numeric",
              })}
              -
              {new Date(event.endTime).toLocaleTimeString([], {
                hour: "numeric",
                minute: "numeric",
              })}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={Colors.textMedium}
              />
              <Text style={styles.eventLocation}>
                {event.location || event.place}
              </Text>
            </View>
            <View style={styles.organizerRow}>
              <Ionicons
                name="person-outline"
                size={16}
                color={Colors.textMedium}
              />
              <Text style={styles.eventOrganizer}>
                {event.organizer || event.host}
              </Text>
            </View>
          </View>
        </View>

        {/* Helper hint */}
        <View style={styles.helperCard}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={Colors.textMedium}
          />
          <Text style={styles.helperText}>
            Set a reminder, view map, share event, or download offline
          </Text>
        </View>

        {/* Voice Recorder - Inline */}
        <View style={{ paddingHorizontal: 20 }}>
          <VoiceRecorder eventId={String(id)} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            onPress={handleReminderToggle}
            style={({ pressed }) => [
              styles.actionButton,
              isSaved && styles.actionButtonActive,
              {
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <View style={styles.actionButtonIcon}>
              <Ionicons
                name={isSaved ? "notifications" : "notifications-outline"}
                size={20}
                color={isSaved ? Colors.primaryOchre : Colors.textDark}
              />
            </View>
            <Text
              style={[
                styles.actionButtonText,
                isSaved && styles.actionButtonTextActive,
              ]}
            >
              Remind me
            </Text>
          </Pressable>

          <Pressable
            onPress={handleViewMap}
            style={({ pressed }) => [
              styles.actionButton,
              {
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <View style={styles.actionButtonIcon}>
              <Ionicons name="map-outline" size={20} color={Colors.textDark} />
            </View>
            <Text style={styles.actionButtonText}>Map</Text>
          </Pressable>

          <Pressable
            onPress={handleShareEvent}
            style={({ pressed }) => [
              styles.actionButton,
              {
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <View style={styles.actionButtonIcon}>
              <Ionicons
                name="share-outline"
                size={20}
                color={Colors.textDark}
              />
            </View>
            <Text style={styles.actionButtonText}>Share</Text>
          </Pressable>

          <Pressable
            onPress={handleOfflineMode}
            style={({ pressed }) => [
              styles.actionButton,
              {
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <View style={styles.actionButtonIcon}>
              <Ionicons
                name="cloud-download-outline"
                size={20}
                color={Colors.textDark}
              />
            </View>
            <Text style={styles.actionButtonText}>Offline</Text>
          </Pressable>
        </View>

        {/* Location & Directions */}
        {(distanceKm !== null || event.lat || event.lon) && (
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <View style={styles.locationIconContainer}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={Colors.textMedium}
                />
              </View>
              <Text style={styles.locationTitle}>Location & Directions</Text>
            </View>

            <View style={styles.locationContent}>
              <View style={styles.venueRow}>
                <Ionicons
                  name="business-outline"
                  size={16}
                  color={Colors.textMedium}
                />
                <Text style={styles.venueName}>{event.place}</Text>
              </View>

              <View style={styles.distanceRow}>
                <Ionicons
                  name="navigate-outline"
                  size={16}
                  color={Colors.textMedium}
                />
                <Text style={styles.distanceText}>
                  {distanceKm !== null
                    ? `${distanceKm}km away`
                    : "Distance calculating..."}
                </Text>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={Colors.textMedium}
                  style={{ marginLeft: 12 }}
                />
                <Text style={styles.distanceText}>
                  {travelTime
                    ? `${travelTime} drive`
                    : "Drive time calculating..."}
                </Text>
              </View>

              <View style={styles.locationButtonsRow}>
                <Pressable
                  onPress={handleGetDirections}
                  style={({ pressed }) => [
                    styles.directionsButton,
                    {
                      opacity: pressed ? 0.85 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                  ]}
                >
                  <Ionicons
                    name="navigate-circle-outline"
                    size={16}
                    color="white"
                  />
                  <Text style={styles.directionsButtonText}>Directions</Text>
                </Pressable>
                <Pressable
                  onPress={handleViewMap}
                  style={({ pressed }) => [
                    styles.viewMapButton,
                    {
                      opacity: pressed ? 0.85 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                  ]}
                >
                  <Ionicons
                    name="map-outline"
                    size={16}
                    color={Colors.textDark}
                  />
                  <Text style={styles.viewMapButtonText}>View Map</Text>
                </Pressable>
              </View>

              <View style={styles.countryNote}>
                <Text style={styles.countryNoteTitle}>Getting to Country:</Text>
                <Text style={styles.countryNoteText}>
                  All our venues are on traditional Gumbaynggirr land. Please
                  travel safely and respectfully through our country.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Voice Recorder bottom sheet removed in favor of inline component */}

        {/* Event Details */}
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>About this gathering</Text>
          <Text style={styles.detailText}>
            {event.about ||
              "Community language circle led by elders. All welcome to join and learn about Gumbaynggirr language and culture."}
          </Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>What to bring</Text>
          <Text style={styles.detailText}>
            Notebook, water, and a respectful heart. Come ready to learn and
            participate in our cultural sharing.
          </Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Cultural significance</Text>
          <Text style={styles.detailText}>
            Language circles are an important part of preserving and sharing
            Gumbaynggirr culture. These gatherings help strengthen our community
            connections and ensure our language continues for future
            generations.
          </Text>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Available offline</Text>
          </View>
          <Text style={styles.statusSubtext}>
            All event details and your voice notes are saved locally and will
            sync when you are back online.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: Colors.textMedium,
  },
  shareButton: {
    padding: 8,
    marginRight: 8,
  },
  heroContainer: {
    height: 160,
    marginBottom: 40,
    padding: 20,
  },
  heroSection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.deepEarth,
  },
  heroGradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
    paddingBottom: 24,
  },
  eventTitle: {
    color: Colors.textDark,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
    lineHeight: 28,
  },
  eventMeta: {
    gap: 6,
  },
  eventDate: {
    color: Colors.textMedium,
    fontSize: 16,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventLocation: {
    color: Colors.textMedium,
    fontSize: 15,
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventOrganizer: {
    color: Colors.textMedium,
    fontSize: 15,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  helperCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.softGrey,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  helperText: {
    color: Colors.textMedium,
    fontSize: 12,
    flex: 1,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    gap: 6,
  },
  actionButtonActive: {
    backgroundColor: Colors.primaryOchre + "15",
    borderColor: Colors.primaryOchre,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textDark,
  },
  actionButtonTextActive: {
    color: Colors.primaryOchre,
  },
  locationCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: Colors.deepEarth,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
  },
  locationAddress: {
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 16,
    lineHeight: 22,
  },
  locationStats: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMedium,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textDark,
  },
  directionsButton: {
    backgroundColor: Colors.primaryOchre,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    flex: 1,
  },
  locationButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  directionsButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  viewMapButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: Colors.softGrey,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    flex: 1,
  },
  viewMapButtonText: {
    color: Colors.textDark,
    fontSize: 14,
    fontWeight: "600",
  },
  detailCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: Colors.deepEarth,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: Colors.textMedium,
    lineHeight: 22,
  },
  statusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.successGreen,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.successGreen,
  },
  statusSubtext: {
    fontSize: 13,
    color: Colors.textMedium,
    lineHeight: 18,
    marginLeft: 16,
  },
  bottomPadding: {
    height: 20,
  },
  eventInfo: {
    padding: 20,
    paddingTop: 24,
    backgroundColor: "white",
    borderRadius: 16,
  },
  actionButtonIcon: {
    marginBottom: 4,
  },
  locationIcon: {
    marginRight: 4,
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.softGrey,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  locationContent: {
    gap: 12,
  },
  venueInfo: {
    marginBottom: 16,
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  venueName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textDark,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  distanceText: {
    fontSize: 14,
    color: Colors.textMedium,
  },
  countryNote: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.softGrey,
    borderRadius: 8,
  },
  countryNoteTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textDark,
    marginBottom: 4,
  },
  countryNoteText: {
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.warmWhite,
  },
});
