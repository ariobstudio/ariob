/**
 * Toast Styles
 *
 * Uses static styles. Dynamic theme colors are applied at runtime
 * via useUnistyles() hook in the components.
 */

import { StyleSheet } from 'react-native';

// Static spacing values
const space = { sm: 8, md: 12, lg: 16 };
const radii = { md: 12, xl: 24 };
const font = { body: 15, caption: 12 };

export const toastStyles = StyleSheet.create({
  // Container for all toasts
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    pointerEvents: 'box-none',
  },

  // Individual toast wrapper
  wrapper: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    pointerEvents: 'auto',
  },

  // Toast root - base styles, colors applied dynamically
  root: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },

  // Icon container
  icon: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconSuccess: {
    backgroundColor: 'rgba(0,186,124,0.15)',
  },

  iconWarning: {
    backgroundColor: 'rgba(245,165,36,0.15)',
  },

  iconDanger: {
    backgroundColor: 'rgba(249,24,128,0.15)',
  },

  // Content
  content: {
    flex: 1,
    gap: 2,
  },

  // Label/title
  label: {
    fontSize: font.body,
    fontWeight: '500',
  },

  // Description
  description: {
    fontSize: font.caption,
  },

  // Action button
  action: {
    borderRadius: radii.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },

  actionLabel: {
    fontSize: font.caption,
    fontWeight: '600',
  },

  // Close button
  close: {
    width: 28,
    height: 28,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export type ToastVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger';
