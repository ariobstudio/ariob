/**
 * Root Layout - Global app layout with singleton Bar
 *
 * The Bar is rendered once at root level as a singleton.
 * Screens use useBar() hook to configure their actions.
 */
import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useUnistyles } from '@ariob/andromeda';
import { Bar } from '@ariob/ripple';

export default function RootLayout() {
  const { theme } = useUnistyles();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="profile/[id]" />
          </Stack>
          {/* Bar singleton - screens configure via useBar() */}
          <Bar />
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
