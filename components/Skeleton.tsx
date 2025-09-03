import { DimensionValue, View, ViewStyle } from "react-native";
import { Colors } from "../constants/colors";

type Props = { height: number; width?: DimensionValue; radius?: number };

export function Skeleton({ height, width = "100%", radius = 12 }: Props) {
  const style: ViewStyle = {
    height,
    width,
    borderRadius: radius,
    backgroundColor: Colors.softGrey,
  };

  return <View style={style} />;
}
