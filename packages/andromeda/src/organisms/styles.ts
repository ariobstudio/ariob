/**
 * Organism Styles
 *
 * Theme-aware styles for all organism components.
 * Uses Unistyles for automatic theme switching.
 */

import { StyleSheet } from 'react-native-unistyles';

// ─────────────────────────────────────────────────────────────────────────────
// Card Styles
// ─────────────────────────────────────────────────────────────────────────────

export const card = StyleSheet.create((t) => ({
  base: {
    borderRadius: t.radii.lg,
    overflow: 'hidden',
  },
  // Variants
  elevated: {
    backgroundColor: t.colors.elevated,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  // Sections
  header: {
    padding: t.space.md,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  content: {
    padding: t.space.md,
  },
  footer: {
    padding: t.space.md,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  // States
  pressed: {
    opacity: 0.9,
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Toast Styles
// ─────────────────────────────────────────────────────────────────────────────

export const toast = StyleSheet.create((t) => ({
  container: {
    position: 'absolute',
    left: t.space.md,
    right: t.space.md,
    zIndex: 100,
    pointerEvents: 'box-none',
    gap: t.space.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: t.space.md,
    borderRadius: t.radii.md,
    backgroundColor: t.colors.elevated,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: t.space.sm,
    ...t.shadow.md,
  },
  // Variants
  default: {
    borderLeftWidth: 3,
    borderLeftColor: t.colors.dim,
  },
  success: {
    borderLeftWidth: 3,
    borderLeftColor: t.colors.success,
  },
  danger: {
    borderLeftWidth: 3,
    borderLeftColor: t.colors.danger,
  },
  warning: {
    borderLeftWidth: 3,
    borderLeftColor: t.colors.warn,
  },
  accent: {
    borderLeftWidth: 3,
    borderLeftColor: t.colors.accent,
  },
  // Icon colors
  iconDefault: {
    color: t.colors.dim,
  },
  iconSuccess: {
    color: t.colors.success,
  },
  iconDanger: {
    color: t.colors.danger,
  },
  iconWarning: {
    color: t.colors.warn,
  },
  iconAccent: {
    color: t.colors.accent,
  },
  // Content
  content: {
    flex: 1,
    gap: t.space.xxs,
  },
  title: {
    fontSize: t.typography.body.fontSize,
    fontWeight: '600',
    color: t.colors.text,
  },
  description: {
    fontSize: t.typography.caption.fontSize,
    color: t.colors.dim,
  },
  // Actions
  action: {
    paddingHorizontal: t.space.sm,
    paddingVertical: t.space.xs,
    borderRadius: t.radii.sm,
    backgroundColor: t.colors.muted,
  },
  actionText: {
    fontSize: t.typography.caption.fontSize,
    fontWeight: '600',
    color: t.colors.text,
  },
  dismiss: {
    padding: t.space.xs,
  },
}));
