/**
 * ProfileStats - User statistics display row
 *
 * A horizontal row displaying key user metrics with bold values and
 * uppercase labels. Designed for profile headers.
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
import { View, Text, StyleSheet } from 'react-native';

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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 32,
    paddingBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
