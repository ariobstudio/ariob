/**
 * FloatingCreateButton - Subtle FAB for quick post creation
 * Goes directly to compose screen - no extra steps
 */

// CRITICAL: Import Unistyles configuration first
import '../unistyles.config';

import { useState } from 'react';
import { Pressable, Platform } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const stylesheet = StyleSheet.create((theme) => ({
  fab: {
    position: 'absolute',
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.surface}F0`,
    borderWidth: 1,
    borderColor: `${theme.colors.border}40`,
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 100,
  },
  icon: {
    color: theme.colors.text,
  },
}));

export function FloatingCreateButton() {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Direct navigation - single step!
    router.push('/create');
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isPressed ? 0.92 : 1, { damping: 15, stiffness: 200 }) }],
    opacity: withSpring(isPressed ? 0.8 : 1),
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.fab,
        animatedStyle,
        { bottom: 84 + insets.bottom + 12 },
      ]}
    >
      <Ionicons name="create-outline" size={22} style={styles.icon} />
    </AnimatedPressable>
  );
}
