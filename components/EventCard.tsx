import { Pressable, Text, ViewStyle } from "react-native";
import { Colors } from "../constants/colors";

type Props = {
  title: string;
  subtitle?: string;
  accent?: "sunset" | "ochre" | "blue";
  style?: ViewStyle;
  onPress?: () => void;
};

export function EventCard({
  title,
  subtitle,
  accent = "sunset",
  style,
  onPress,
}: Props) {
  const accentColor =
    accent === "sunset"
      ? Colors.sunsetRed
      : accent === "ochre"
      ? Colors.primaryOchre
      : Colors.riverBlue;

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          backgroundColor: "white",
          padding: 14,
          borderRadius: 12,
          shadowColor: Colors.deepEarth,
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 2,
        },
        style,
      ]}
    >
      <Text style={{ color: accentColor, fontWeight: "800" }}>{title}</Text>
      {subtitle ? (
        <Text style={{ color: Colors.textMedium, marginTop: 4 }}>
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}
