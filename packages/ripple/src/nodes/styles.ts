/**
 * Node Styles
 *
 * Consolidated theme-aware styles for all node components.
 * Uses Unistyles for automatic theme switching.
 */

import { StyleSheet } from 'react-native-unistyles';

// ─────────────────────────────────────────────────────────────────────────────
// Post Styles
// ─────────────────────────────────────────────────────────────────────────────

export const post = StyleSheet.create((t) => ({
  container: {
    gap: t.spacing.sm,
  },
  body: {
    color: t.colors.textPrimary,
    fontSize: t.typography.body.fontSize,
    lineHeight: t.typography.body.lineHeight,
  },
  image: {
    borderRadius: t.radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  placeholder: {
    width: '100%',
    height: 200,
    backgroundColor: t.colors.surfaceMuted,
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Message Styles
// ─────────────────────────────────────────────────────────────────────────────

export const message = StyleSheet.create((t) => ({
  container: {
    gap: t.spacing.md,
  },
  messages: {
    gap: t.spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.sm,
    borderRadius: t.radii.lg,
  },
  bubbleMe: {
    backgroundColor: t.colors.accent,
    borderBottomRightRadius: t.spacing.xs,
  },
  bubbleThem: {
    backgroundColor: t.colors.surfaceMuted,
    borderBottomLeftRadius: t.spacing.xs,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  bubbleThinking: {
    backgroundColor: t.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: t.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
  },
  text: {
    fontSize: t.typography.body.fontSize,
    lineHeight: 18,
  },
  textMe: {
    color: '#000',
  },
  textThem: {
    color: t.colors.textPrimary,
  },
  thinkingText: {
    fontSize: t.typography.caption.fontSize,
    color: t.colors.textMuted,
  },
  replySection: {
    marginTop: t.spacing.sm,
    paddingTop: t.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: t.colors.borderSubtle,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    backgroundColor: t.colors.surfaceMuted,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.sm,
    borderRadius: t.radii.pill,
    alignSelf: 'flex-start',
  },
  replyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: t.colors.textPrimary,
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Auth Styles
// ─────────────────────────────────────────────────────────────────────────────

export const auth = StyleSheet.create((t) => ({
  container: {
    marginTop: t.spacing.sm,
    gap: t.spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: t.spacing.md,
    backgroundColor: t.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radii.md,
    gap: t.spacing.md,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconKey: {
    backgroundColor: 'rgba(120,86,255,0.15)',
  },
  iconWallet: {
    backgroundColor: 'rgba(29,155,240,0.15)',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: t.colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: t.typography.caption.fontSize,
    color: t.colors.textSecondary,
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Sync Styles
// ─────────────────────────────────────────────────────────────────────────────

export const sync = StyleSheet.create((t) => ({
  container: {
    alignItems: 'center',
    padding: t.spacing.lg,
    gap: t.spacing.sm,
  },
  avatars: {
    flexDirection: 'row',
    marginLeft: t.spacing.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: t.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -12,
  },
  title: {
    color: t.colors.textPrimary,
    fontWeight: '500',
    fontSize: 14,
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: t.typography.caption.fontSize,
    marginBottom: t.spacing.xs,
  },
  button: {
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.xs,
    borderRadius: t.radii.pill,
    backgroundColor: t.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  buttonText: {
    fontSize: t.typography.caption.fontSize,
    color: t.colors.textPrimary,
    fontWeight: 'bold',
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Ghost Styles
// ─────────────────────────────────────────────────────────────────────────────

export const ghost = StyleSheet.create((t) => ({
  text: {
    fontStyle: 'italic',
    color: t.colors.textSecondary,
    fontSize: t.typography.body.fontSize,
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Suggestion Styles
// ─────────────────────────────────────────────────────────────────────────────

export const suggestion = StyleSheet.create((t) => ({
  container: {
    gap: t.spacing.sm,
  },
  body: {
    color: t.colors.textPrimary,
    fontSize: t.typography.body.fontSize,
  },
  button: {
    width: '100%',
    paddingVertical: t.spacing.sm,
    borderRadius: t.radii.md,
    backgroundColor: 'rgba(120,86,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(120,86,255,0.3)',
    alignItems: 'center',
  },
  buttonText: {
    color: t.colors.indicator.auth,
    fontSize: t.typography.caption.fontSize,
    fontWeight: 'bold',
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// AI Model Styles
// ─────────────────────────────────────────────────────────────────────────────

export const aiModel = StyleSheet.create((t) => ({
  container: {
    marginTop: t.spacing.sm,
    gap: t.spacing.sm,
  },
  intro: {
    fontSize: t.typography.caption.fontSize,
    color: t.colors.textSecondary,
    lineHeight: 18,
    marginBottom: t.spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: t.spacing.md,
    backgroundColor: t.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radii.md,
    gap: t.spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  active: {
    borderColor: t.colors.accentGlow,
    backgroundColor: 'rgba(0,229,255,0.05)',
  },
  ready: {
    borderColor: t.colors.accentGlow,
  },
  progress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: t.radii.md,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: t.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    backgroundColor: 'rgba(0,229,255,0.15)',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: t.colors.textPrimary,
    marginBottom: 2,
  },
  nameActive: {
    color: t.colors.accentGlow,
  },
  description: {
    fontSize: t.typography.caption.fontSize,
    color: t.colors.textSecondary,
    marginBottom: t.spacing.xs,
  },
  specs: {
    flexDirection: 'row',
    gap: t.spacing.md,
  },
  spec: {
    fontSize: 11,
    color: t.colors.textMuted,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
  },
  progressText: {
    fontSize: 11,
    color: t.colors.warning,
    fontWeight: '600',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.sm,
    padding: 10,
    backgroundColor: 'rgba(0,229,255,0.08)',
    borderRadius: t.radii.sm,
    marginTop: t.spacing.xs,
  },
  bannerText: {
    fontSize: t.typography.caption.fontSize,
    color: t.colors.accentGlow,
    fontWeight: '500',
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Profile Styles
// ─────────────────────────────────────────────────────────────────────────────

export const profile = StyleSheet.create((t) => ({
  container: {
    gap: t.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: t.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: t.typography.heading.fontSize,
    fontWeight: '600',
    color: t.colors.textPrimary,
  },
  handle: {
    fontSize: t.typography.caption.fontSize,
    color: t.colors.textSecondary,
    marginTop: 2,
  },
  bio: {
    color: t.colors.textPrimary,
    fontSize: t.typography.body.fontSize,
    lineHeight: t.typography.body.lineHeight,
  },
  stats: {
    flexDirection: 'row',
    gap: t.spacing.lg,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: t.typography.heading.fontSize,
    fontWeight: '700',
    color: t.colors.textPrimary,
  },
  statLabel: {
    fontSize: t.typography.caption.fontSize,
    color: t.colors.textSecondary,
  },
}));
