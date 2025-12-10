import { StyleSheet } from 'react-native-unistyles';

export const profileScreenStyles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  backText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  navTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  keyCard: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  keyLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    textTransform: 'uppercase',
  },
  keyValue: {
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  listLabel: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  listValue: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radii.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  logoutText: {
    color: theme.colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
}));
