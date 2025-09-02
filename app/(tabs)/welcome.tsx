import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { Colors } from "../../constants/colors";

export default function WelcomeScreen() {
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
          source={require("../../assets/images/logo.png")}
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
        <Pressable
          style={{
            width: "47%",
            backgroundColor: "white",
            borderRadius: 16,
            padding: 20,
            shadowColor: Colors.deepEarth,
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 2,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}
          >
            <Ionicons
              name="location-outline"
              size={24}
              color={Colors.riverBlue}
            />
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
        </Pressable>

        {/* Voice Notes Card */}
        <Pressable
          style={{
            width: "47%",
            backgroundColor: "white",
            borderRadius: 16,
            padding: 20,
            shadowColor: Colors.deepEarth,
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 2,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}
          >
            <Ionicons name="mic-outline" size={24} color={Colors.sunsetRed} />
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
        </Pressable>

        {/* Community Card */}
        <Pressable
          style={{
            width: "47%",
            backgroundColor: "white",
            borderRadius: 16,
            padding: 20,
            shadowColor: Colors.deepEarth,
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 2,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}
          >
            <Ionicons
              name="people-outline"
              size={24}
              color={Colors.primaryOchre}
            />
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
        </Pressable>

        {/* Offline Ready Card */}
        <View
          style={{
            width: "47%",
            backgroundColor: "white",
            borderRadius: 16,
            padding: 20,
            shadowColor: Colors.deepEarth,
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 2,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}
          >
            <Ionicons
              name="wifi-outline"
              size={24}
              color={Colors.successGreen}
            />
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
          <Ionicons
            name="calendar-outline"
            size={20}
            color={Colors.sunsetRed}
          />
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
        <Link href="/(tabs)/calendar" asChild>
          <Pressable
            style={{
              backgroundColor: Colors.primaryOchre,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
              Open Calendar
            </Text>
          </Pressable>
        </Link>
      </View>

      {/* Status Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons
            name="cellular-outline"
            size={16}
            color={Colors.successGreen}
          />
          <Text style={{ fontSize: 14, color: Colors.textMedium }}>Online</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 14, color: Colors.textMedium }}>
            Last sync: <Text style={{ fontWeight: "600" }}>1:57:38 PM</Text>
          </Text>
          <Pressable style={{ marginLeft: 8 }}>
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

      {/* Cultural Motif */}
      <View style={{ alignItems: "center", opacity: 0.7 }}>
        <Text style={{ fontSize: 14, color: Colors.textMedium }}>
          Subtle cultural motif
        </Text>
      </View>
    </View>
  );
}
