import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  Calendar,
  MapPin,
  Mic,
  Signal,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";

const styles = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    paddingVertical: 24,
    shadowColor: Colors.deepEarth,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});

export default function App() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<string>("—");
  const router = useRouter();

  // Check network status and last sync on mount
  useEffect(() => {
    checkNetworkStatus();
    loadLastSync();
  }, []);

  // Subscribe to network changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const checkNetworkStatus = async () => {
    const state = await NetInfo.fetch();
    setIsOnline(state.isConnected ?? false);
  };

  const loadLastSync = async () => {
    try {
      const saved = await SecureStore.getItemAsync("lastSync");
      if (saved) {
        setLastSync(saved);
      }
    } catch (error) {
      console.log("Error loading last sync:", error);
    }
  };

  const handleRefresh = async () => {
    try {
      const now = new Date().toLocaleTimeString();
      await SecureStore.setItemAsync("lastSync", now);
      setLastSync(now);

      // TODO: Add extra features here later
      // - Fetch fresh events from remote
      // - Update local cache
      // - Sync audio notes
      // - Update user preferences
    } catch (error) {
      console.log("Error saving refresh time:", error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.warmWhite,
        padding: 24,
      }}
    >
      {/* Header with Logo and Title */}
      <View style={{ alignItems: "center", marginTop: 20, marginBottom: 32 }}>
        <Image
          source={require("../assets/images/logo.png")}
          style={{ width: 64, height: 64, marginBottom: 16 }}
        />
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: Colors.deepEarth,
            marginBottom: 4,
          }}
        >
          Gumbaynggirr
        </Text>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            color: Colors.textMedium,
          }}
        >
          Connect
        </Text>
      </View>

      {/* Feature Cards Grid */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Locations Card */}
        <View
          style={[
            styles.card,
            { flexDirection: "row", alignItems: "flex-start", gap: 12 },
          ]}
        >
          <MapPin size={24} color={Colors.riverBlue} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontWeight: "700",
                color: Colors.textDark,
                marginBottom: 4,
              }}
            >
              Locations
            </Text>
            <Text style={{ fontSize: 14, color: Colors.textMedium }}>
              Find venues
            </Text>
          </View>
        </View>

        {/* Voice Notes Card */}
        <View
          style={[
            styles.card,
            { flexDirection: "row", alignItems: "flex-start", gap: 12 },
          ]}
        >
          <Mic size={24} color={Colors.sunsetRed} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontWeight: "700",
                color: Colors.textDark,
                marginBottom: 4,
              }}
            >
              Voice Notes
            </Text>
            <Text style={{ fontSize: 14, color: Colors.textMedium }}>
              Record thoughts
            </Text>
          </View>
        </View>

        {/* Community Card */}
        <View
          style={[
            styles.card,
            { flexDirection: "row", alignItems: "flex-start", gap: 12 },
          ]}
        >
          <Users size={24} color={Colors.primaryOchre} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontWeight: "700",
                color: Colors.textDark,
                marginBottom: 4,
              }}
            >
              Community
            </Text>
            <Text style={{ fontSize: 14, color: Colors.textMedium }}>
              Connect with others
            </Text>
          </View>
        </View>

        {/* Offline Ready Card */}
        <View
          style={[
            styles.card,
            { flexDirection: "row", alignItems: "flex-start", gap: 12 },
          ]}
        >
          <Wifi size={24} color={Colors.successGreen} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontWeight: "700",
                color: Colors.textDark,
                marginBottom: 4,
              }}
            >
              Offline Ready
            </Text>
            <Text style={{ fontSize: 14, color: Colors.textMedium }}>
              Works anywhere
            </Text>
          </View>
        </View>
      </View>

      {/* Community Events Card */}
      <View
        style={{
          backgroundColor: Colors.softGrey,
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          shadowColor: Colors.deepEarth,
          shadowOpacity: 0.15,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          elevation: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <Calendar size={20} color={Colors.sunsetRed} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontWeight: "600",
                color: Colors.textDark,
                marginBottom: 4,
              }}
            >
              View Community Events
            </Text>
            <Text style={{ fontSize: 14, color: Colors.textMedium }}>
              Stay connected to culture
            </Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: Colors.primaryOchre,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          onPress={() => {
            router.push("/calendar");
          }}
        >
          <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
            Open Calendar
          </Text>
        </Pressable>
      </View>

      {/* Cultural Motif */}
      <View style={{ alignItems: "center", opacity: 0.7, marginBottom: 24 }}>
        <Text style={{ fontSize: 14, color: Colors.textMedium }}>
          Subtle cultural motif
        </Text>
      </View>

      {/* Status Bar - Fixed at Bottom */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: Colors.softGrey,
          borderTopWidth: 1,
          borderTopColor: "#e8e3db",
          paddingHorizontal: 24,
          paddingVertical: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {isOnline ? (
              <Signal size={16} color={Colors.successGreen} />
            ) : (
              <WifiOff size={16} color={Colors.warningAmber} />
            )}
            <Text style={{ fontSize: 14, color: Colors.textMedium }}>
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 14, color: Colors.textMedium }}>
              Last sync: <Text style={{ fontWeight: "600" }}>{lastSync}</Text>
            </Text>
            <Pressable style={{ marginLeft: 8 }} onPress={handleRefresh}>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.textMedium,
                  textDecorationLine: "underline",
                }}
              >
                Refresh
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
