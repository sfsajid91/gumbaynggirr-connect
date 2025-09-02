import { ReactNode, useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "../constants/colors";

type Props = {
  children: ReactNode;
  initialSnap?: number; // 0..1 of screen height
  maxHeightRatio?: number; // 0..1 of screen height
};

export function BottomSheet({
  children,
  initialSnap = 0.35,
  maxHeightRatio = 0.6,
}: Props) {
  const screenH = Dimensions.get("window").height;
  const maxH = screenH * maxHeightRatio;
  const closedY = maxH; // off-screen by its own height
  const openY = screenH - maxH;

  const translateY = useSharedValue(closedY);

  useEffect(() => {
    translateY.value = withSpring(screenH - maxH * initialSnap, {
      damping: 18,
      stiffness: 160,
    });
  }, [initialSnap, maxH, screenH, translateY]);

  const pan = Gesture.Pan()
    .onChange((e) => {
      translateY.value = Math.max(
        openY,
        Math.min(closedY, translateY.value + e.changeY)
      );
    })
    .onEnd(() => {
      const mid = (openY + closedY) / 2;
      translateY.value = withSpring(translateY.value < mid ? openY : closedY, {
        damping: 18,
        stiffness: 160,
      });
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.sheet, { height: maxH }, style]}>
        <View style={styles.handle} />
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.softGrey,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#d8d2c8",
    marginTop: 8,
    marginBottom: 8,
  },
  content: { padding: 16 },
});
