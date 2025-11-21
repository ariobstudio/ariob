/**
 * Bottom Tabs Layout
 *
 * Uses Expo Router's Tabs (based on React Navigation Bottom Tabs).
 * Includes Authentication Guard.
 */

// CRITICAL: Ensure Unistyles is configured before any StyleSheet.create
import '../../unistyles.config';

import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingCreateButton } from '../../components/FloatingCreateButton';

// Native tab bar background with liquid glass effect
function NativeTabBarBackground() {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={95}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
    );
  }
  return <View style={styles.androidTabBar} />;
}

export default function TabsLayout() {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  // Auth Guard
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const keys = await AsyncStorage.getItem('userKeys');
      if (!keys) {
        console.log('[Tabs] No auth keys found, redirecting...');
        router.replace('/onboarding');
      } else {
        setIsAuthorized(true);
      }
    } catch (e) {
      router.replace('/onboarding');
    } finally {
      setChecking(false);
    }
  };

  if (checking || !isAuthorized) {
    return null; // Or render a loading spinner
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          lazy: false,
          unmountOnBlur: false,
          freezeOnBlur: false,
          tabBarActiveTintColor: styles.tabBarActive.color,
          tabBarInactiveTintColor: styles.tabBarInactive.color,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: Platform.select({
              ios: 'transparent',
              android: styles.androidTabBar.backgroundColor,
            }),
            borderTopWidth: 0,
            elevation: 0,
            height: 84 + insets.bottom,
            paddingBottom: insets.bottom + 16,
            paddingTop: 16,
          },
          tabBarBackground: () => <NativeTabBarBackground />,
          tabBarHideOnKeyboard: true,
          tabBarAllowFontScaling: false,
          sceneStyle: styles.scene,
        }}
        screenListeners={{
          tabPress: () => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          },
        }}
      >
        {/* Feed: Central feed with degree filtering */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Feed',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'water' : 'water-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />

        {/* Discover: Search and discovery */}
        <Tabs.Screen
          name="search"
          options={{
            title: 'Discover',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'compass' : 'compass-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />

        {/* Hide create tab - now using FAB */}
        <Tabs.Screen
          name="create"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Floating Create Button */}
      <FloatingCreateButton />
    </>
  );
}

const stylesheet = StyleSheet.create((theme) => ({
  tabBarActive: {
    color: theme.colors.text,
  },
  tabBarInactive: {
    color: theme.colors.textSecondary,
  },
  androidTabBar: {
    backgroundColor: `${theme.colors.surface}E6`, // 90% opacity
    ...StyleSheet.absoluteFillObject,
  },
  scene: {
    backgroundColor: theme.colors.background,
  },
}));
