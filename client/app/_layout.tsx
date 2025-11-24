import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="screens/profile" options={{ headerShown: false }} />
        <Stack.Screen name="screens/otherprofile" options={{ headerShown: false }} />
        <Stack.Screen name="screens/HomeScreen" options={{ headerShown: false }} />
        <Stack.Screen name="screens/FriendsScreen" options={{ headerShown: false }} />
        <Stack.Screen name="screens/PastPromptsScreen" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
