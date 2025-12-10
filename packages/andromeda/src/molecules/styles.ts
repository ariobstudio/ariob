/**
 * Molecule Styles
 *
 * Theme-aware styles for all molecule components.
 * Uses Unistyles for automatic theme switching.
 */

import { StyleSheet } from 'react-native-unistyles';

// ─────────────────────────────────────────────────────────────────────────────
// Avatar Styles
// ─────────────────────────────────────────────────────────────────────────────

export const avatar = StyleSheet.create((t) => ({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  // Sizes
  sm: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  md: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  lg: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  // Tints
  default: {
    backgroundColor: t.colors.muted,
    borderColor: t.colors.border,
  },
  accent: {
    backgroundColor: `${t.colors.accent}25`,
    borderColor: `${t.colors.accent}40`,
  },
  success: {
    backgroundColor: `${t.colors.success}25`,
    borderColor: `${t.colors.success}40`,
  },
  warn: {
    backgroundColor: `${t.colors.warn}25`,
    borderColor: `${t.colors.warn}40`,
  },
  // Text colors
  textDefault: {
    color: t.colors.text,
    fontWeight: '700',
  },
  textAccent: {
    color: t.colors.accent,
    fontWeight: '700',
  },
  textSuccess: {
    color: t.colors.success,
    fontWeight: '700',
  },
  textWarn: {
    color: t.colors.warn,
    fontWeight: '700',
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// IconButton Styles
// ─────────────────────────────────────────────────────────────────────────────

export const iconButton = StyleSheet.create((t) => ({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radii.md,
  },
  // Sizes
  sm: {
    width: 32,
    height: 32,
  },
  md: {
    width: 40,
    height: 40,
  },
  lg: {
    width: 48,
    height: 48,
  },
  // Tints
  default: {
    backgroundColor: t.colors.muted,
  },
  accent: {
    backgroundColor: `${t.colors.accent}20`,
  },
  success: {
    backgroundColor: `${t.colors.success}20`,
  },
  danger: {
    backgroundColor: `${t.colors.danger}20`,
  },
  // States
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// InputField Styles
// ─────────────────────────────────────────────────────────────────────────────

export const inputField = StyleSheet.create((t) => ({
  container: {
    gap: t.space.xs,
  },
  label: {
    fontSize: t.typography.caption.fontSize,
    fontWeight: '600',
    color: t.colors.dim,
  },
  required: {
    color: t.colors.danger,
  },
  input: {
    backgroundColor: t.colors.muted,
    borderRadius: t.radii.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    paddingHorizontal: t.space.md,
    height: 44,
    color: t.colors.text,
    fontSize: t.typography.body.fontSize,
  },
  inputError: {
    borderColor: t.colors.danger,
  },
  inputFocus: {
    borderColor: t.colors.accent,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  inputMulti: {
    height: 'auto',
    minHeight: 80,
    paddingVertical: t.space.sm,
    textAlignVertical: 'top',
  },
  helper: {
    fontSize: t.typography.caption.fontSize,
    color: t.colors.dim,
  },
  error: {
    fontSize: t.typography.caption.fontSize,
    color: t.colors.danger,
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Tag Styles
// ─────────────────────────────────────────────────────────────────────────────

export const tag = StyleSheet.create((t) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.space.sm,
    paddingVertical: t.space.xxs,
    borderRadius: t.radii.sm,
    gap: t.space.xs,
    alignSelf: 'flex-start',
  },
  // Tints
  default: {
    backgroundColor: t.colors.muted,
  },
  accent: {
    backgroundColor: `${t.colors.accent}20`,
  },
  success: {
    backgroundColor: `${t.colors.success}20`,
  },
  warn: {
    backgroundColor: `${t.colors.warn}20`,
  },
  danger: {
    backgroundColor: `${t.colors.danger}20`,
  },
  // Text
  text: {
    fontSize: t.typography.caption.fontSize,
    fontWeight: '500',
    color: t.colors.text,
  },
  textAccent: {
    color: t.colors.accent,
  },
  textSuccess: {
    color: t.colors.success,
  },
  textWarn: {
    color: t.colors.warn,
  },
  textDanger: {
    color: t.colors.danger,
  },
  // Remove button
  remove: {
    marginLeft: t.space.xxs,
    padding: 2,
  },
}));
