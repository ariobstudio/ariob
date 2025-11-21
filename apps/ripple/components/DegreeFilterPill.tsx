/**
 * Swipeable Degree Filter Pill
 *
 * A refined, horizontal selection control for the social graph distance.
 * Degrees: 0 (Me) → 1 (Friends) → 2 (Network) → 3 (Global)
 */

// CRITICAL: Import Unistyles configuration first
import '../unistyles.config';

import { View, Text, ScrollView, Platform } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from './AnimatedPressable';

const DEGREES = [
  { id: 0, label: 'Me', icon: 'person', iconFilled: 'person' },
  { id: 1, label: 'Friends', icon: 'people-outline', iconFilled: 'people' },
  { id: 2, label: 'Network', icon: 'git-network-outline', iconFilled: 'git-network' },
  { id: 3, label: 'Global', icon: 'globe-outline', iconFilled: 'globe' },
] as const;

// Removed "Noise" (4) to simplify the initial experience, can be added back if needed.

export type DegreeValue = 0 | 1 | 2 | 3;

interface DegreeFilterPillProps {
  currentDegree: DegreeValue;
  onDegreeChange: (degree: DegreeValue) => void;
}

const stylesheet = StyleSheet.create((theme) => ({
  wrapper: {
    height: 50,
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    minWidth: 44,
    height: 40,
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pillInactive: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border,
  },
  iconActive: {
    color: theme.colors.background,
  },
  iconInactive: {
    color: theme.colors.textSecondary,
  },
  labelContainer: {
    marginLeft: 2,
  },
  labelActive: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.background,
  },
}));

function DegreePill({
  degree,
  isActive,
  onPress,
}: {
  degree: typeof DEGREES[number];
  isActive: boolean;
  onPress: () => void;
}) {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(isActive ? 'rgba(0,0,0,0.0)' : 'transparent', { duration: 200 }), // handling via child or border
      transform: [{ scale: withSpring(isActive ? 1.05 : 1, { damping: 15 }) }],
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      scaleDown={0.95}
      haptics={true}
    >
      <Animated.View style={[
        styles.pill,
        isActive ? styles.pillActive : styles.pillInactive,
        animatedContainerStyle
      ]}>
        <Ionicons
          name={isActive ? degree.iconFilled : degree.icon}
          size={18}
          style={isActive ? styles.iconActive : styles.iconInactive}
        />
        {isActive && (
          <Animated.View entering={withTiming({ opacity: 1 })} style={styles.labelContainer}>
             <Text style={styles.labelActive} numberOfLines={1}>
              {degree.label}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </AnimatedPressable>
  );
}

export function DegreeFilterPill({
  currentDegree,
  onDegreeChange,
}: DegreeFilterPillProps) {
  const { theme } = useUnistyles();
  const styles = stylesheet;

  const handleDegreePress = (degree: DegreeValue) => {
    if (degree !== currentDegree) {
      if (Platform.OS === 'ios') {
        Haptics.selectionAsync();
      }
      onDegreeChange(degree);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {DEGREES.map((degree) => (
          <DegreePill
            key={degree.id}
            degree={degree}
            isActive={currentDegree === degree.id}
            onPress={() => handleDegreePress(degree.id as DegreeValue)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
