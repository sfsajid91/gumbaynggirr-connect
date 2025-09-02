import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryOchre,
        tabBarInactiveTintColor: Colors.textMedium,
        tabBarStyle: {
          backgroundColor: Colors.softGrey,
          borderTopColor: "#e8e3db",
        },
      }}
    >
      <Tabs.Screen
        name="welcome"
        options={{
          title: "Welcome",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
