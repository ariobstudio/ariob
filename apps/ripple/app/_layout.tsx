import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { init } from '@ariob/core';
import '../unistyles.config'; // Import theme config
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

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

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for potential session restore or just general readiness
    // Core 'recall' usually happens on demand, but we can ensure gun is initialized
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
        <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#1D9BF0" />
        </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" options={{ presentation: 'modal' }} />
        </Stack>
    </GestureHandlerRootView>
  );
}
