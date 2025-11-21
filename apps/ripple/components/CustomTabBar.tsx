/**
 * CustomTabBar
 *
 * Clean, modular tab bar component to replace Expo's native tabs.
 * Features smooth animations and haptic feedback.
 */

import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from './AnimatedPressable';
import { theme } from '../theme';
import { SPRING_CONFIGS } from '../utils/animations';

export interface TabConfig {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
}

interface CustomTabBarProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function CustomTabBar({ tabs, activeTab, onTabChange }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();

  const handleTabPress = (tabId: string) => {
    if (tabId !== activeTab) {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onTabChange(tabId);
    }
  };

  return (
    <View style={[styles.container, { height: 84 + insets.bottom, paddingBottom: insets.bottom }]}>
      {/* Background with blur */}
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={100}
          tint="systemChromeMaterialDark"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidBackground]} />
      )}

      {/* Tab buttons */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onPress={() => handleTabPress(tab.id)}
          />
        ))}
      </View>
    </View>
  );
}

function TabButton({
  tab,
  isActive,
  onPress,
}: {
  tab: TabConfig;
  isActive: boolean;
  onPress: () => void;
}) {
  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isActive ? 1.1 : 1, SPRING_CONFIGS.snappy),
      },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: withSpring(isActive ? 1 : 0.6, SPRING_CONFIGS.default),
  }));

  return (
    <AnimatedPressable
      style={styles.tabButton}
      onPress={onPress}
      scaleDown={0.92}
    >
      <Animated.View style={iconStyle}>
        <Ionicons
          name={isActive ? tab.iconFilled : tab.icon}
          size={24}
          color={isActive ? theme.colors.text : theme.colors.textSecondary}
        />
      </Animated.View>
      <Animated.Text style={[styles.tabLabel, labelStyle]}>
        {tab.title}
      </Animated.Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
  },
  androidBackground: {
    backgroundColor: `${theme.colors.surface}F5`,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: theme.colors.text,
    marginTop: 4,
  },
});
