/**
 * Ariob Root Layout
 *
 * Initializes Gun.js with AsyncStorage and sets up navigation.
 * Note: Unistyles config must be imported FIRST before any StyleSheet.create calls
 */

// CRITICAL: Import Unistyles configuration before ANYTHING else
import '../unistyles.config';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { init } from '@ariob/core';
import Store from '../src/lib/ras'
import { NodeProvider, initializeNodeRenderers } from '@ariob/ripple';

// Gun.js relay peers for decentralized sync
const PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'http://localhost:8765/gun',
];

export default function RootLayout() {
  console.log('[DEBUG] RootLayout mounting');

  useEffect(() => {
    console.log('[DEBUG] RootLayout useEffect starting');
    // Initialize Gun.js graph with AsyncStorage persistence
    init({
      peers: PEERS,
      store: Store({ AsyncStorage: AsyncStorage }),
    });
    console.log('[DEBUG] Gun.js initialized');

    // Initialize all node renderers
    initializeNodeRenderers();
    console.log('[DEBUG] Node renderers initialized');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <NodeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="import-keys" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="settings"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Settings',
                headerStyle: {
                  backgroundColor: '#000',
                },
                headerTintColor: '#fff',
              }}
            />
          </Stack>
        </NodeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
