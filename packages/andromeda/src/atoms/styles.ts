/**
 * Atom Styles
 *
 * Theme-aware styles for all atomic components.
 * Uses Unistyles for automatic theme switching.
 */

import { StyleSheet } from 'react-native-unistyles';

// ─────────────────────────────────────────────────────────────────────────────
// Text Styles
// ─────────────────────────────────────────────────────────────────────────────

export const text = StyleSheet.create((t) => ({
  base: {
    fontWeight: t.typography.body.fontWeight as any,
  },
  // Sizes
  title: {
    fontSize: t.typography.title.fontSize,
    fontWeight: t.typography.title.fontWeight as any,
    letterSpacing: t.typography.title.letterSpacing,
    color: t.colors.text,
  },
  heading: {
    fontSize: t.typography.heading.fontSize,
    fontWeight: t.typography.heading.fontWeight as any,
    color: t.colors.text,
  },
  body: {
    fontSize: t.typography.body.fontSize,
    fontWeight: t.typography.body.fontWeight as any,
    lineHeight: t.typography.body.lineHeight,
    color: t.colors.text,
  },
  caption: {
    fontSize: t.typography.caption.fontSize,
    fontWeight: t.typography.caption.fontWeight as any,
    color: t.colors.dim,
  },
  mono: {
    fontSize: t.typography.mono.fontSize,
    fontWeight: t.typography.mono.fontWeight as any,
    letterSpacing: t.typography.mono.letterSpacing,
    color: t.colors.faint,
    fontFamily: 'monospace',
  },
  // Colors
  text: { color: t.colors.text },
  dim: { color: t.colors.dim },
  faint: { color: t.colors.faint },
  accent: { color: t.colors.accent },
  success: { color: t.colors.success },
  warn: { color: t.colors.warn },
  danger: { color: t.colors.danger },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Button Styles
// ─────────────────────────────────────────────────────────────────────────────

export const button = StyleSheet.create((t) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radii.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Sizes
  sm: {
    height: 32,
    paddingHorizontal: t.space.md,
    gap: t.space.xs,
  },
  md: {
    height: 40,
    paddingHorizontal: t.space.lg,
    gap: t.space.sm,
  },
  lg: {
    height: 48,
    paddingHorizontal: t.space.xl,
    gap: t.space.sm,
  },
  // Variants
  solid: {
    backgroundColor: t.colors.accent,
  },
  solidDefault: {
    backgroundColor: t.colors.text,
  },
  solidSuccess: {
    backgroundColor: t.colors.success,
  },
  solidDanger: {
    backgroundColor: t.colors.danger,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  // States
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  // Text
  textSolid: {
    color: t.colors.bg,
    fontWeight: '600',
  },
  textOutline: {
    color: t.colors.text,
    fontWeight: '600',
  },
  textGhost: {
    color: t.colors.text,
    fontWeight: '600',
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Input Styles
// ─────────────────────────────────────────────────────────────────────────────

export const input = StyleSheet.create((t) => ({
  base: {
    backgroundColor: t.colors.muted,
    borderRadius: t.radii.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
    fontSize: t.typography.body.fontSize,
  },
  // Sizes
  sm: {
    height: 36,
    paddingHorizontal: t.space.sm,
  },
  md: {
    height: 44,
    paddingHorizontal: t.space.md,
  },
  lg: {
    height: 52,
    paddingHorizontal: t.space.lg,
  },
  // Variants
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  filled: {
    backgroundColor: t.colors.muted,
    borderWidth: 0,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  // States
  focus: {
    borderColor: t.colors.accent,
  },
  error: {
    borderColor: t.colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  // Multi-line
  multi: {
    height: 'auto',
    minHeight: 80,
    paddingVertical: t.space.sm,
    textAlignVertical: 'top',
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Badge Styles
// ─────────────────────────────────────────────────────────────────────────────

export const badge = StyleSheet.create((t) => ({
  base: {
    paddingHorizontal: t.space.sm,
    paddingVertical: t.space.xxs,
    borderRadius: t.radii.sm,
    alignSelf: 'flex-start',
  },
  // Tints
  default: {
    backgroundColor: t.colors.muted,
  },
  accent: {
    backgroundColor: t.colors.accent,
  },
  success: {
    backgroundColor: t.colors.success,
  },
  danger: {
    backgroundColor: t.colors.danger,
  },
  warn: {
    backgroundColor: t.colors.warn,
  },
  // Text
  text: {
    fontSize: t.typography.caption.fontSize,
    fontWeight: '600',
    color: t.colors.text,
  },
  textTinted: {
    fontSize: t.typography.caption.fontSize,
    fontWeight: '600',
    color: t.colors.bg,
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Divider Styles
// ─────────────────────────────────────────────────────────────────────────────

export const divider = StyleSheet.create((t) => ({
  horizontal: {
    height: 1,
    width: '100%',
    backgroundColor: t.colors.border,
  },
  vertical: {
    width: 1,
    height: '100%',
    backgroundColor: t.colors.border,
  },
  subtle: {
    backgroundColor: t.colors.borderSubtle,
  },
  strong: {
    backgroundColor: t.colors.borderStrong,
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Dot Styles
// ─────────────────────────────────────────────────────────────────────────────

export const dot = StyleSheet.create((t) => ({
  base: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: t.colors.accent,
  },
  glow: {
    shadowColor: t.colors.glow.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Line Styles
// ─────────────────────────────────────────────────────────────────────────────

export const line = StyleSheet.create((t) => ({
  base: {
    width: 2,
    backgroundColor: t.colors.border,
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Icon Styles
// ─────────────────────────────────────────────────────────────────────────────

export const icon = StyleSheet.create((t) => ({
  // Sizes (in pixels)
  xs: { size: 14 },
  sm: { size: 18 },
  md: { size: 22 },
  lg: { size: 28 },
  xl: { size: 36 },
  // Colors
  text: { color: t.colors.text },
  dim: { color: t.colors.dim },
  faint: { color: t.colors.faint },
  accent: { color: t.colors.accent },
  success: { color: t.colors.success },
  warn: { color: t.colors.warn },
  danger: { color: t.colors.danger },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Label Styles
// ─────────────────────────────────────────────────────────────────────────────

export const label = StyleSheet.create((t) => ({
  base: {
    fontSize: t.typography.caption.fontSize,
    fontWeight: '600',
    color: t.colors.dim,
    marginBottom: t.space.xs,
  },
  required: {
    color: t.colors.danger,
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Press Styles
// ─────────────────────────────────────────────────────────────────────────────

export const press = StyleSheet.create(() => ({
  base: {},
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
}));
