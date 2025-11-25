import { StyleSheet } from 'react-native-unistyles';

export const messageStyles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.md,
  },
  focusedContainer: {
    borderColor: theme.colors.accent,
  },
  messages: {
    gap: theme.spacing.xs,
  },
  msgRow: {
    flexDirection: 'row',
  },
  msgLeft: {
    justifyContent: 'flex-start',
  },
  msgRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
  },
  bubbleMe: {
    backgroundColor: theme.colors.accent,
    borderBottomRightRadius: theme.spacing.xs,
  },
  bubbleThem: {
    backgroundColor: theme.colors.surfaceMuted,
    borderBottomLeftRadius: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bubbleThinking: {
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  msgText: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: 18,
  },
  textMe: {
    color: '#000',
  },
  textThem: {
    color: theme.colors.textPrimary,
  },
  thinkingText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textMuted,
  },
  replySection: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    alignSelf: 'flex-start',
  },
  replyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sendButton: {
    backgroundColor: theme.colors.textPrimary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

