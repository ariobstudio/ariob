import { StyleSheet } from 'react-native-unistyles';

export const messageStyles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading.fontSize,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  msgLeft: {
    justifyContent: 'flex-start',
  },
  msgRight: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  bubble: {
    maxWidth: '75%',
    padding: theme.spacing.md,
    borderRadius: theme.radii.xl,
  },
  bubbleMe: {
    backgroundColor: theme.colors.accent,
    borderBottomRightRadius: theme.radii.sm,
  },
  bubbleThem: {
    backgroundColor: theme.colors.surfaceMuted,
    borderBottomLeftRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  msgText: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: 20,
  },
  textMe: {
    color: theme.colors.background, // Dark text on accent bubble
  },
  textThem: {
    color: theme.colors.textPrimary,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radii.xl,
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    maxHeight: 120,
    fontSize: theme.typography.body.fontSize,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.indicator.ai,
    shadowColor: theme.colors.indicator.ai,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  offlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.textMuted,
    opacity: 0.5,
  },
}));
