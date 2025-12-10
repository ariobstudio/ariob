/**
 * DegreeIndicator - Visual indicator for current degree filter
 *
 * Shows concentric circles representing degrees of separation:
 * 0 = Me (center dot)
 * 1 = Friends (1 ring)
 * 2 = Network (2 rings)
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Text } from '@ariob/components/src/primitives/Text';

type Degree = '0' | '1' | '2';

export interface DegreeIndicatorProps {
  degree: Degree;
}

const DEGREE_LABELS: Record<Degree, string> = {
  '0': 'Me',
  '1': 'Friends',
  '2': 'Network',
};

export const DegreeIndicator: React.FC<DegreeIndicatorProps> = ({ degree }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Ripple animation when degree changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [degree]);

  const degreeNum = parseInt(degree);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.ripples,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Center dot (always visible) */}
        <View style={[styles.circle, styles.center]} />

        {/* Rings based on degree */}
        {degreeNum >= 1 && (
          <View style={[styles.circle, styles.ring1]} />
        )}
        {degreeNum >= 2 && (
          <View style={[styles.circle, styles.ring2]} />
        )}
      </Animated.View>

      <Text
        variant="label"
        color="pearl"
        style={styles.label}
      >
        {DEGREE_LABELS[degree]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },

  ripples: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },

  circle: {
    position: 'absolute',
    borderRadius: theme.borderRadius.circle,
  },

  center: {
    width: 8,
    height: 8,
    backgroundColor: theme.colors.cream,
  },

  ring1: {
    width: 32,
    height: 32,
    borderWidth: 1.5,
    borderColor: theme.colors.cream,
  },

  ring2: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: theme.colors.pearl,
  },

  label: {
    textAlign: 'center',
  },
}));
