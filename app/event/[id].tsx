import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import VoiceRecorder from "../../components/VoiceRecorder";
import { Colors } from "../../constants/colors";
import { useEvents } from "../../hooks/useEvents";
import { getUserLocation, haversineKm } from "../../lib/location";
import { getStoredRecording, storeRecording } from "../../lib/storage";

export default function EventDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [travelTime, setTravelTime] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [existingRecording, setExistingRecording] = useState<string | null>(
    null
  );
  const { events } = useEvents();

  const event = events.find((e) => e.id === String(id));

  const loadExistingRecording = useCallback(async () => {
    if (id) {
      const recording = await getStoredRecording(String(id));
      setExistingRecording(recording);
    }
  }, [id]);

  const updateLocationInfo = useCallback(async () => {
    if (!event || event.lat == null || event.lon == null) return;

    try {
      const loc = await getUserLocation();
      if (!loc) return;

      const km = haversineKm(
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
    loadExistingRecording();
    updateLocationInfo();
  }, [id, loadExistingRecording, updateLocationInfo]);

  const handleViewMap = async () => {
    if (!event || !event.lat || !event.lon) {
      console.log(
        "Location not available - This event doesn't have location coordinates."
      );
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lon}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log("Error - Unable to open maps application");
    }
  };

  const handleGetDirections = async () => {
    if (!event || !event.lat || !event.lon) {
      console.log(
        "Location not available - This event doesn't have location coordinates."
      );
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lon}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log("Error - Unable to open maps application");
    }
  };

  const handleRecordingComplete = async (uri: string) => {
    if (id) {
      await storeRecording(String(id), uri);
      setExistingRecording(uri);
    }
  };

  const handleSaveToCalendar = async () => {
    // For now, just toggle the saved state
    // TODO: Implement actual calendar integration when dependencies are available
    setIsSaved(!isSaved);
    console.log("Event saved to calendar (simulated)");
  };

  const handleShareEvent = async () => {
    if (!event) return;
    // For now, use basic sharing
    // TODO: Implement vCard sharing when react-native-share is available
    const eventDate = new Date(event.date + "T" + event.startTime);
    const shareText = `${
      event.title
    }\n\nDate: ${eventDate.toLocaleDateString()}\nTime: ${event.startTime} - ${
      event.endTime
    }\nLocation: ${event.location || event.place}\nOrganizer: ${
      event.organizer || event.host
    }`;

    console.log("Sharing event:", shareText);
  };

  const handleOfflineMode = () => {
    // For now, just log the action
    // TODO: Implement toast notification when react-native-toast-message is available
    ToastAndroid.show("Event is now available offline", ToastAndroid.SHORT);
  };

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
              onPress={() => {}}
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
            Save to calendar, view map, share event, or download offline
          </Text>
        </View>

        {/* Voice Recording Card - Always Visible */}
        <View style={styles.recordingCard}>
          <View style={styles.recordingHeader}>
            <Ionicons name="mic" size={20} color={Colors.primaryOchre} />
            <Text style={styles.recordingTitle}>Voice Notes</Text>
            <Pressable
              onPress={() => setIsRecording(!isRecording)}
              style={({ pressed }) => [
                styles.recordButton,
                isRecording && styles.recordButtonActive,
                {
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
            >
              <Ionicons
                name={isRecording ? "stop" : "radio-button-on"}
                size={16}
                color={isRecording ? "white" : Colors.primaryOchre}
              />
            </Pressable>
          </View>
          <Text style={styles.recordingDescription}>
            {isRecording
              ? "Recording in progress..."
              : "Tap to record notes about this event"}
          </Text>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingTime}>00:15</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            onPress={handleSaveToCalendar}
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
                name={isSaved ? "bookmark" : "bookmark-outline"}
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
              Save
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

        {/* Voice Recorder */}
        {isRecording && (
          <View style={styles.voiceRecorderContainer}>
            <VoiceRecorder
              eventId={String(id)}
              onRecordingComplete={handleRecordingComplete}
              existingRecording={existingRecording || undefined}
            />
            <TouchableOpacity
              style={styles.closeRecorderButton}
              onPress={() => setIsRecording(false)}
            >
              <Ionicons name="close" size={24} color={Colors.textDark} />
            </TouchableOpacity>
          </View>
        )}

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
  closeRecorderButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.softGrey,
  },
  countryNoteText: {
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
  },
  voiceRecorderContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: Colors.deepEarth,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingCard: {
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
  recordingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  recordingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
    flex: 1,
    marginLeft: 8,
  },
  recordButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: Colors.primaryOchre,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  recordButtonActive: {
    backgroundColor: Colors.primaryOchre,
  },
  recordingDescription: {
    fontSize: 14,
    color: Colors.textMedium,
    marginBottom: 8,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryOchre,
  },
  recordingTime: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryOchre,
  },
});
