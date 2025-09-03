import { Stack } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { Skeleton } from "../components/Skeleton";
import { Colors } from "../constants/colors";
import { useEvents } from "../hooks/useEvents";
import { EventItem } from "../types/Event";

const { width } = Dimensions.get("window");

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
  const { events, loading, refreshing, refresh } = useEvents();
  const panRef = useRef<PanGestureHandler>(null);
  const translateX = useRef(new Animated.Value(0)).current;

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
  const getEventsForDate = (date: Date): EventItem[] => {
    const dateStr = date.toISOString().slice(0, 10);
    return events.filter((event) => event.date === dateStr);
  };

  // Get today's events
  const todaysEvents = useMemo(() => {
    return getEventsForDate(new Date());
  }, [events]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    return getEventsForDate(selectedDate);
  }, [events, selectedDate]);

  // Check if a date has events
  const hasEvents = (day: number): boolean => {
    if (!day) return false;
    const date = new Date(year, current.getMonth(), day);
    return getEventsForDate(date).length > 0;
  };

  // Handle month navigation
  const navigateMonth = (direction: "prev" | "next") => {
    setMonthOffset((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  // Handle date selection
  const handleDatePress = (day: number) => {
    if (!day) return;
    const date = new Date(year, current.getMonth(), day);
    setSelectedDate(date);
  };

  // Handle pan gesture for month navigation
  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;

      if (Math.abs(translationX) > 50 || Math.abs(velocityX) > 500) {
        if (translationX > 0) {
          navigateMonth("prev");
        } else {
          navigateMonth("next");
        }
      }

      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  // Format date for display (e.g., "Thursday, Aug 28")
  const formatDisplayDate = (date: Date) => {
    const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
    const month = date.toLocaleDateString(undefined, { month: "short" });
    const day = date.getDate();
    return `${weekday}, ${month} ${day}`;
  };

  // Show toast notification
  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      // For iOS, we'll use a simple alert for now
      // In a real app, you might want to use a proper toast library
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
          title: "Event Calender",
          headerShown: true,
          headerStyle: { backgroundColor: Colors.warmWhite },
          headerTitleStyle: { color: Colors.riverBlue, fontWeight: "600" },
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
        {/* Gumbaynggirr Connect Banner */}
        <View
          style={{
            backgroundColor: Colors.primaryOchre,
            paddingVertical: 16,
            paddingHorizontal: 20,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: Colors.deepEarth,
              fontSize: 24,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Gumbaynggirr Connect
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {/* Month Navigator */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              paddingVertical: 8,
            }}
          >
            <Pressable
              onPress={() => navigateMonth("prev")}
              style={{
                padding: 12,
                backgroundColor: Colors.softGrey,
                borderRadius: 8,
                minWidth: 44,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: Colors.riverBlue,
                  fontWeight: "700",
                  fontSize: 20,
                }}
              >
                ‹
              </Text>
            </Pressable>
            <Text
              style={{
                color: Colors.deepEarth,
                fontWeight: "700",
                fontSize: 20,
              }}
            >
              {month} {year}
            </Text>
            <Pressable
              onPress={() => navigateMonth("next")}
              style={{
                padding: 12,
                backgroundColor: Colors.softGrey,
                borderRadius: 8,
                minWidth: 44,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: Colors.riverBlue,
                  fontWeight: "700",
                  fontSize: 20,
                }}
              >
                ›
              </Text>
            </Pressable>
          </View>

          {/* Instructions */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: Colors.textMedium,
                fontSize: 12,
                marginLeft: 4,
              }}
            >
              🔒 Swipe left/right to change month • Tap dates to view events
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
          <PanGestureHandler
            ref={panRef}
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onPanHandlerStateChange}
          >
            <Animated.View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                transform: [{ translateX }],
                marginBottom: 24,
              }}
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
          </PanGestureHandler>

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
                {(selectedDate.toDateString() === new Date().toDateString()
                  ? todaysEvents
                  : selectedDateEvents
                ).length === 0 ? (
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
                  (selectedDate.toDateString() === new Date().toDateString()
                    ? todaysEvents
                    : selectedDateEvents
                  ).map((ev) => (
                    <View
                      key={ev.id}
                      style={{
                        backgroundColor: "white",
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
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
                            <Text
                              style={{
                                color: Colors.textMedium,
                                fontSize: 12,
                              }}
                            >
                              🕐 {ev.time}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ color: Colors.textMedium }}>→</Text>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}
          </View>

          {/* Pull to refresh hint */}
          <Text
            style={{
              color: Colors.textMedium,
              fontSize: 12,
              textAlign: "center",
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            ↓ Pull down to refresh events
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
