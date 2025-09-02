import { ReactNode } from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = PressableProps & { children: ReactNode };

export function AnimatedPress({ children, onPress, style, ...rest }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={[animatedStyle, style as any]}>
      <Pressable
        onPressIn={() => (scale.value = withTiming(0.98, { duration: 80 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 120 }))}
        onPress={onPress}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
