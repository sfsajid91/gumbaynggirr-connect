import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Colors } from "../../constants/colors";

export default function WelcomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.warmWhite,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: "700",
          color: Colors.deepEarth,
          marginBottom: 8,
        }}
      >
        Gumbaynggirr
      </Text>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "600",
          color: Colors.textDark,
          marginBottom: 24,
        }}
      >
        Connect
      </Text>
      <View
        style={{
          backgroundColor: Colors.softGrey,
          borderRadius: 16,
          padding: 20,
          width: "100%",
          maxWidth: 420,
          marginBottom: 24,
        }}
      >
        <Text
          style={{ color: Colors.textMedium, fontSize: 16, marginBottom: 16 }}
        >
          Connecting our community through language and culture
        </Text>
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
              View Community Events
            </Text>
          </Pressable>
        </Link>
      </View>
      <Text style={{ color: Colors.textMedium, fontSize: 12 }}>
        ● Offline Ready · Last sync: 2 mins ago
      </Text>
    </View>
  );
}
