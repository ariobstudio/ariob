/**
 * ProfileStats - User statistics display row
 *
 * A horizontal row displaying key user metrics with bold values and
 * uppercase labels. Designed for profile headers.
 * Refactored to use Unistyles for theme reactivity
 *
 * @example
 * ```tsx
 * <ProfileStats
 *   postsCount={42}
 *   draftsCount={3}
 *   connectionsCount={156}
 * />
 * ```
 *
 * **Layout:**
 * - Three evenly spaced stat columns
 * - Large bold numbers (20px)
 * - Small uppercase labels (12px)
 * - 32px gap between columns
 *
 * @see ProfileHeader - Parent component
 * @see StatsBar - Alternative horizontal stat layout
 */

import React from 'react';
import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export interface ProfileStatsProps {
  postsCount: number;
  draftsCount: number;
  connectionsCount: number;
}

export function ProfileStats({ postsCount, draftsCount, connectionsCount }: ProfileStatsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.statValue}>{postsCount}</Text>
        <Text style={styles.statLabel}>Posts</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statValue}>{draftsCount}</Text>
        <Text style={styles.statLabel}>Drafts</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statValue}>{connectionsCount}</Text>
        <Text style={styles.statLabel}>Connections</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.heading,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    ...theme.typography.mono,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
}));
