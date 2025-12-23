import { StyleSheet } from 'react-native-unistyles';

export const aiStyles = StyleSheet.create((theme) => ({
  container: {
    marginTop: 8,
    gap: 8,
  },
  intro: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
    marginBottom: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    flex: 1,
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radii.lg,
    gap: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  modelOptionSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  modelOptionReady: {
    borderColor: theme.colors.accent,
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: theme.radii.lg,
  },
  modelIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelIconSelected: {
    backgroundColor: theme.colors.accentSoft,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  modelNameSelected: {
    color: theme.colors.accent,
  },
  modelDescription: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  modelSpecs: {
    flexDirection: 'row',
    gap: 12,
  },
  specText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
  },
  readyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radii.md,
    marginTop: 4,
  },
  readyText: {
    fontSize: 13,
    color: theme.colors.accent,
    fontWeight: '500',
  },
}));
