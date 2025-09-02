import { View } from "react-native";
import { Colors } from "../constants/colors";

type Props = { height: number; width?: number | string; radius?: number };

export function Skeleton({ height, width = "100%", radius = 12 }: Props) {
  return (
    <View
      style={{
        height,
        width,
        borderRadius: radius,
        backgroundColor: Colors.softGrey,
      }}
    />
  );
}
