import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router"; // Reserved for future navigation
import { Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Skeleton } from "../components/Skeleton";
import { Colors } from "../constants/colors";
import { useEvents } from "../hooks/useEvents";
import { EventItem } from "../types/Event";

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const { events, loading, refreshing, refresh } = useEvents();
  // const router = useRouter(); // Reserved for future navigation features
  const translateX = useSharedValue(0);
  const todayButtonOpacity = useSharedValue(0);
  const todayButtonScale = useSharedValue(0.8);

  // Set today as default selected date
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

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

  // Get events for a specific date
  const getEventsForDate = useCallback(
    (date: Date): EventItem[] => {
      const dateStr = date.toISOString().slice(0, 10);
      return events.filter((event) => event.date === dateStr);
    },
    [events]
  );

  const selectedDateString = useMemo(() => {
    return selectedDate.toISOString().slice(0, 10);
  }, [selectedDate]);

  // Get today's events (reserved for future features)
  // const todayEvents = useMemo(() => {
  //   const todayDateString = new Date().toISOString().slice(0, 10);
  //   return getEventsForDate(new Date(todayDateString));
  // }, [getEventsForDate]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    return getEventsForDate(new Date(selectedDateString));
  }, [selectedDateString, getEventsForDate]);

  // Check if a date has events
  const hasEvents = (day: number): boolean => {
    if (!day) return false;
    const date = new Date(year, current.getMonth(), day);
    return getEventsForDate(date).length > 0;
  };

  // Handle month navigation
  const navigateMonth = (direction: "prev" | "next") => {
    const newOffset = direction === "prev" ? monthOffset - 1 : monthOffset + 1;
    setMonthOffset(newOffset);

    // Show/hide today button based on whether we're viewing current month
    if (newOffset === 0) {
      // Hide today button when back to current month
      todayButtonOpacity.value = withTiming(0, { duration: 200 });
      todayButtonScale.value = withTiming(0.8, { duration: 200 });
    } else {
      // Show today button when not on current month
      todayButtonOpacity.value = withTiming(1, { duration: 300 });
      todayButtonScale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
    }
  };

  // Navigate back to current month
  const goToToday = () => {
    setMonthOffset(0);
    setSelectedDate(new Date());

    // Hide today button
    todayButtonOpacity.value = withTiming(0, { duration: 200 });
    todayButtonScale.value = withTiming(0.8, { duration: 200 });

    // Show feedback animation
    todayButtonScale.value = withSpring(
      1.1,
      {
        damping: 10,
        stiffness: 400,
      },
      () => {
        todayButtonScale.value = withSpring(0.8, { duration: 200 });
      }
    );
  };

  // Handle date selection
  const handleDatePress = (day: number) => {
    if (!day) return;
    const date = new Date(year, current.getMonth(), day);
    setSelectedDate(date);
  };

  // Handle pan gesture for month navigation using modern Gesture API
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;

      if (Math.abs(translationX) > 50 || Math.abs(velocityX) > 500) {
        if (translationX > 0) {
          runOnJS(navigateMonth)("prev");
        } else {
          runOnJS(navigateMonth)("next");
        }
      }

      translateX.value = withSpring(0);
    });

  // Animated style for the calendar grid
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Animated style for today button
  const todayButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: todayButtonOpacity.value,
      transform: [{ scale: todayButtonScale.value }],
    };
  });

  // Format date for display (e.g., "Thursday, Aug 28")
  const formatDisplayDate = (date: Date) => {
    const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
    const month = date.toLocaleDateString(undefined, { month: "short" });
    const day = date.getDate();
    return `${weekday}, ${month} ${day}`;
  };

  // Format time from ISO datetime string
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format time range
  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Handle event press
  const handleEventPress = (event: EventItem) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Close event modal
  const closeEventModal = () => {
    setShowEventModal(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  // Show toast notification
  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      // In a real app, I want to use a proper toast library
      console.log(message);
    }
  };

  // Handle refresh with toast
  const handleRefresh = async () => {
    await refresh();
    showToast("Database refreshed");
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.warmWhite }}>
      <Stack.Screen
        options={{
          title: "Gumbaynggirr Connect",
          headerShown: true,
          headerBackVisible: false,
          headerStyle: { backgroundColor: Colors.primaryOchre },
          headerTitleStyle: { color: Colors.deepEarth, fontWeight: "800" },
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primaryOchre}
            colors={[Colors.primaryOchre]}
          />
        }
      >
        <View style={{ paddingHorizontal: 16 }}>
          {/* Month Navigator */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              paddingVertical: 8,
              position: "relative",
            }}
          >
            <Pressable
              onPress={() => navigateMonth("prev")}
              style={{
                padding: 12,
                minWidth: 44,
                alignItems: "center",
              }}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              accessibilityHint="Navigate to previous month"
            >
              <Ionicons
                name="chevron-back-outline"
                size={20}
                color={Colors.textDark}
              />
            </Pressable>

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: Colors.textDark,
                  fontWeight: "700",
                  fontSize: 20,
                }}
              >
                {month} {year}
              </Text>

              {/* Today Button - appears when not on current month */}
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    top: 28,
                    backgroundColor: Colors.primaryOchre,
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                  },
                  todayButtonStyle,
                ]}
              >
                <Pressable
                  onPress={goToToday}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Go to today"
                  accessibilityHint="Navigate to current month and today's date"
                >
                  <Ionicons name="today-outline" size={14} color="white" />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Today
                  </Text>
                </Pressable>
              </Animated.View>
            </View>

            <Pressable
              onPress={() => navigateMonth("next")}
              style={{
                padding: 12,
                minWidth: 44,
                alignItems: "center",
              }}
              accessibilityRole="button"
              accessibilityLabel="Next month"
              accessibilityHint="Navigate to next month"
            >
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={Colors.textDark}
              />
            </Pressable>
          </View>

          {/* Instructions */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              backgroundColor: Colors.softGrey,
              borderRadius: 8,
              padding: 8,
            }}
          >
            <Ionicons
              name="hand-left-outline"
              size={14}
              color={Colors.textMedium}
            />
            <Text
              style={{
                color: Colors.textMedium,
                fontSize: 12,
                marginLeft: 4,
              }}
            >
              Swipe left/right to change month • Tap dates to view events
            </Text>
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
                  fontWeight: "600",
                }}
              >
                {d.label}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                {
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 24,
                },
                animatedStyle,
              ]}
            >
              {cells.map((n, idx) => (
                <View
                  key={idx}
                  style={{
                    width: `${100 / 7}%`,
                    aspectRatio: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                    paddingVertical: 2,
                  }}
                >
                  {n && (
                    <Pressable
                      onPress={() => handleDatePress(n)}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                          selectedDate.getDate() === n &&
                          selectedDate.getMonth() === current.getMonth() &&
                          selectedDate.getFullYear() === current.getFullYear()
                            ? Colors.primaryOchre
                            : "white",
                        position: "relative",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            selectedDate.getDate() === n &&
                            selectedDate.getMonth() === current.getMonth() &&
                            selectedDate.getFullYear() === current.getFullYear()
                              ? "white"
                              : Colors.textDark,
                          fontWeight:
                            selectedDate.getDate() === n &&
                            selectedDate.getMonth() === current.getMonth() &&
                            selectedDate.getFullYear() === current.getFullYear()
                              ? "700"
                              : "500",
                        }}
                      >
                        {n}
                      </Text>
                      {hasEvents(n) && (
                        <View
                          style={{
                            position: "absolute",
                            bottom: 4,
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: Colors.sunsetRed,
                          }}
                        />
                      )}
                    </Pressable>
                  )}
                </View>
              ))}
            </Animated.View>
          </GestureDetector>

          {/* Events Section */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontWeight: "700",
                color: Colors.textDark,
                marginBottom: 8,
                fontSize: 16,
              }}
            >
              Today&apos;s Events
            </Text>

            {selectedDate.toDateString() !== new Date().toDateString() && (
              <Text
                style={{
                  fontWeight: "600",
                  color: Colors.textMedium,
                  marginBottom: 8,
                  fontSize: 14,
                }}
              >
                {formatDisplayDate(selectedDate)} Events
              </Text>
            )}

            {loading ? (
              <Skeleton height={64} />
            ) : (
              <>
                {selectedDateEvents.length === 0 ? (
                  <Text
                    style={{
                      color: Colors.textMedium,
                      fontSize: 14,
                      textAlign: "center",
                      paddingVertical: 20,
                    }}
                  >
                    No events for this day.
                  </Text>
                ) : (
                  selectedDateEvents.map((ev: EventItem) => (
                    <Pressable
                      key={ev.id}
                      onPress={() => handleEventPress(ev)}
                      style={({ pressed }) => [
                        {
                          backgroundColor: "white",
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 12,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 3,
                          transform: [{ scale: pressed ? 0.98 : 1 }],
                        },
                      ]}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        <View
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            backgroundColor: Colors.sunsetRed,
                            marginTop: 6,
                            marginRight: 12,
                          }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontWeight: "600",
                              color: Colors.textDark,
                              fontSize: 16,
                              marginBottom: 4,
                            }}
                          >
                            {ev.title}
                          </Text>
                          <Text
                            style={{
                              color: Colors.textMedium,
                              fontSize: 14,
                              marginBottom: 4,
                            }}
                          >
                            {ev.place}
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Ionicons
                              name="time-outline"
                              size={14}
                              color={Colors.textMedium}
                            />
                            <Text
                              style={{
                                color: Colors.textMedium,
                                fontSize: 12,
                                marginLeft: 4,
                              }}
                            >
                              {formatTimeRange(ev.startTime, ev.endTime)}
                            </Text>
                          </View>
                        </View>
                        <Ionicons
                          name="chevron-forward-outline"
                          size={16}
                          color={Colors.textMedium}
                        />
                      </View>
                    </Pressable>
                  ))
                )}
              </>
            )}
          </View>

          {/* Pull to refresh hint */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <Ionicons
              name="arrow-down-outline"
              size={14}
              color={Colors.textMedium}
            />
            <Text
              style={{
                color: Colors.textMedium,
                fontSize: 12,
                textAlign: "center",
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              Pull down to refresh events
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Event Detail Modal */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEventModal}
      >
        {selectedEvent && (
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.warmWhite,
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 60,
                paddingBottom: 20,
                backgroundColor: Colors.primaryOchre,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: Colors.deepEarth,
                  flex: 1,
                }}
              >
                Event Details
              </Text>
              <Pressable
                onPress={closeEventModal}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
                accessibilityRole="button"
                accessibilityLabel="Close event details"
                accessibilityHint="Close the event details modal"
              >
                <Ionicons name="close" size={24} color={Colors.deepEarth} />
              </Pressable>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Event Title */}
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: Colors.textDark,
                  marginBottom: 8,
                  lineHeight: 34,
                }}
              >
                {selectedEvent.title}
              </Text>

              {/* Host */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={Colors.primaryOchre}
                />
                <Text
                  style={{
                    fontSize: 16,
                    color: Colors.textMedium,
                    marginLeft: 8,
                    fontWeight: "600",
                  }}
                >
                  Hosted by {selectedEvent.host}
                </Text>
              </View>

              {/* Date & Time Card */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={Colors.primaryOchre}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: Colors.textDark,
                      marginLeft: 10,
                    }}
                  >
                    {formatDisplayDate(new Date(selectedEvent.date))}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={Colors.primaryOchre}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      color: Colors.textMedium,
                      marginLeft: 10,
                    }}
                  >
                    {formatTimeRange(
                      selectedEvent.startTime,
                      selectedEvent.endTime
                    )}
                  </Text>
                </View>
              </View>

              {/* Location Card */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={Colors.primaryOchre}
                    style={{ marginTop: 2 }}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: Colors.textDark,
                        marginBottom: 4,
                      }}
                    >
                      {selectedEvent.place}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: Colors.textMedium,
                        lineHeight: 20,
                      }}
                    >
                      {selectedEvent.address}
                    </Text>
                  </View>
                </View>
              </View>

              {/* About Section */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: Colors.textDark,
                    marginBottom: 12,
                  }}
                >
                  About This Event
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: Colors.textMedium,
                    lineHeight: 24,
                  }}
                >
                  {selectedEvent.about}
                </Text>
              </View>

              {/* What to Bring */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Ionicons
                    name="bag-outline"
                    size={20}
                    color={Colors.primaryOchre}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: Colors.textDark,
                      marginLeft: 10,
                    }}
                  >
                    What to Bring
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    color: Colors.textMedium,
                    lineHeight: 24,
                  }}
                >
                  {selectedEvent.bring}
                </Text>
              </View>

              {/* Cultural Context */}
              <View
                style={{
                  backgroundColor: Colors.primaryOchre,
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 32,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Ionicons
                    name="heart-outline"
                    size={20}
                    color={Colors.deepEarth}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: Colors.deepEarth,
                      marginLeft: 10,
                    }}
                  >
                    Cultural Context
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    color: Colors.deepEarth,
                    lineHeight: 24,
                  }}
                >
                  {selectedEvent.culture}
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}
