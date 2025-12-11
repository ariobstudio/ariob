import { View, Text } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export interface SyncData {
  teaser: string;
}

interface SyncProps {
  data: SyncData;
}

export const Sync = ({ data }: SyncProps) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <View style={styles.avatars}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.indicator.message }]}>
          <Text style={styles.avatarText}>EF</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: theme.colors.indicator.auth }]}>
          <Text style={styles.avatarText}>CD</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Text style={styles.avatarText}>+2</Text>
        </View>
      </View>
      <Text style={styles.title}>New updates from {data.teaser}</Text>
      <Text style={styles.subtitle}>and other nodes in your extended graph.</Text>
      <View style={styles.button}>
        <Text style={styles.buttonText}>Tap to Sync</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center' as const,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  avatars: {
    flexDirection: 'row' as const,
    marginLeft: theme.spacing.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginLeft: -12,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: theme.colors.textPrimary,
  },
  title: {
    color: theme.colors.textPrimary,
    fontWeight: '500' as const,
    fontSize: 14,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginBottom: theme.spacing.xs,
  },
  button: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontWeight: 'bold' as const,
  },
}));
