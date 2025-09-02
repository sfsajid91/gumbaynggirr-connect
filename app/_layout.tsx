import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LightTheme } from "../constants/colors";

export default function RootLayout() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: LightTheme.background,
      card: LightTheme.card,
      text: LightTheme.text,
      border: LightTheme.border,
      primary: LightTheme.tint,
    },
  };

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        backgroundColor: LightTheme.background,
        paddingBottom: 50,
      }}
    >
      <ThemeProvider value={theme}>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
