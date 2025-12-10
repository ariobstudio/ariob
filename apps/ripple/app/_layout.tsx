import 'react-native-get-random-values';
// Note: Unistyles config is imported in index.js before expo-router loads
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { init } from '@ariob/core';
import { Context as MenuContext, Bar, ActionsProvider, SheetRegistryProvider, type ActionsConfig, type SheetRegistry, type SheetTitles } from '@ariob/ripple';
import { AccountSheet } from '../components/sheets';
import { ToastProvider, ToastContainer } from '@ariob/andromeda';
import { useEffect, useState, useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

// Action configuration
import { actions, feedConfig, nodeMenus, handleAction } from '../config';

// Sheet registry configuration - register app-specific sheets
const sheetRegistry: SheetRegistry = {
  account: AccountSheet,
};

const sheetTitles: SheetTitles = {
  account: 'Create Account',
};

// Sheets that have their own header (don't show default header)
const selfHeaderedSheets = ['account'];

// Initialize Gun with AsyncStorage adapter
// This connects the @ariob/core singleton to the native storage
const gun = init({
  peers: ['https://gun-manhattan.herokuapp.com/gun'],
  // Pass the AsyncStorage adapter as 'store'
  store: {
    get: async (key: string, cb: (val: any) => void) => {
      try {
        const val = await AsyncStorage.getItem(key);
        cb(val ? JSON.parse(val) : undefined);
      } catch (e) {
        cb(undefined);
      }
    },
    put: async (key: string, val: any, cb: (ack: any) => void) => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(val));
        cb({ ok: 1 });
      } catch (e) {
        cb({ err: e });
      }
    }
  }
});

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  // Memoize action config to prevent unnecessary re-renders
  const actionsConfig = useMemo<ActionsConfig>(
    () => ({
      actions,
      feedConfig,
      nodeMenus,
      onAction: handleAction,
    }),
    []
  );

  useEffect(() => {
    // Wait for potential session restore or just general readiness
    // Core 'recall' usually happens on demand, but we can ensure gun is initialized
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <SheetRegistryProvider
      sheets={sheetRegistry}
      titles={sheetTitles}
      selfHeadered={selfHeaderedSheets}
    >
      <ActionsProvider config={actionsConfig}>
        <ToastProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="thread/[id]" options={{ animation: 'none' }} />
            <Stack.Screen name="message/[id]" options={{ animation: 'slide_from_right' }} />
          </Stack>
          <Bar />
          <MenuContext />
          <ToastContainer topInset={insets.top} />
        </ToastProvider>
      </ActionsProvider>
    </SheetRegistryProvider>
  );
}

export default function RootLayout() {
  const { theme } = useUnistyles();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
