/**
 * StatsBar - Minimal stats display
 */

import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../../theme';

interface StatsBarProps {
  posts: number;
  drafts: number;
  connections: number;
}

export function StatsBar({ posts, drafts, connections }: StatsBarProps) {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.container}>
      <Stat label="Posts" value={posts} />
      <View style={styles.divider} />
      <Stat label="Drafts" value={drafts} />
      <View style={styles.divider} />
      <Stat label="Connections" value={connections} />
    </Animated.View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginHorizontal: 24,
    backgroundColor: `${theme.colors.surface}40`,
    borderRadius: 16,
    marginBottom: 24,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: `${theme.colors.border}40`,
  },
});
