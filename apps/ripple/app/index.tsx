/**
 * Ripple Entry Point
 *
 * Checks if user has onboarded and routes accordingly.
 */

import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '@ariob/core';
import { theme } from '../theme';

export default function IndexScreen() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    console.log('[DEBUG] IndexScreen checkOnboarding started');
    try {
      // Check if user has onboarded
      const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
      console.log('[DEBUG] hasOnboarded:', hasOnboarded);

      if (hasOnboarded) {
        // Try to get saved keypair
        const savedKeysJson = await AsyncStorage.getItem('userKeys');
        console.log('[DEBUG] savedKeysJson exists:', !!savedKeysJson);

        if (savedKeysJson) {
          try {
            const keys = JSON.parse(savedKeysJson);
            console.log('[Index] Authenticating with saved keys...');
            console.log('[DEBUG] Keys parsed successfully');

            const result = await auth(keys);
            console.log('[DEBUG] auth result ok:', result.ok);

            if (result.ok) {
              console.log('[Index] ✓ Authenticated:', result.value.alias);
            } else {
              console.log('[Index] Auth failed:', result.error);
            }
          } catch (err) {
            console.error('[Index] Failed to parse saved keys:', err);
          }
        } else {
          console.log('[Index] No saved keys found');
        }

        console.log('[DEBUG] Replacing route with /(tabs)');
        router.replace('/(tabs)');
      } else {
        console.log('[DEBUG] Not onboarded, replacing with /onboarding');
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
      router.replace('/onboarding');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.text} />
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
