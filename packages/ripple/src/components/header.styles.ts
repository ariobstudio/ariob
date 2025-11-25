import { StyleSheet } from 'react-native-unistyles';

export const headerStyles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  meta: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    justifyContent: 'center',
    gap: theme.spacing.xs / 2,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  author: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  timestamp: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    fontFamily: 'monospace',
  },
}));

