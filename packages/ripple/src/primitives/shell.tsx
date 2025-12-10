/**
 * Shell - Base container primitive for Ripple nodes
 *
 * The foundational wrapper component for all feed items. Provides consistent
 * styling, press interactions, and optional long-press context menu support.
 *
 * @example
 * ```tsx
 * // Basic pressable shell
 * <Shell onPress={() => navigate('/detail')}>
 *   <Text>Feed item content</Text>
 * </Shell>
 *
 * // With context menu support
 * <Shell nodeRef={{ type: 'post', data: post }} onPress={openDetail}>
 *   <PostContent data={post} />
 * </Shell>
 *
 * // Ghost variant (for placeholders)
 * <Shell variant="ghost">
 *   <Text>Loading...</Text>
 * </Shell>
 *
 * // Glow variant (for highlighted/active items)
 * <Shell variant="glow">
 *   <Text>Featured content</Text>
 * </Shell>
 * ```
 *
 * **Variants:**
 * - `default`: Semi-transparent dark surface with shadow
 * - `ghost`: Transparent with dashed border (loading/empty states)
 * - `glow`: Cyan bioluminescent glow effect (Liquid Trust accent)
 *
 * @see useHold - Long-press gesture hook for context menus
 */

import { Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { GestureDetector } from 'react-native-gesture-handler';
import type { ReactNode } from 'react';
import { useHold } from '../gesture/hold';
import type { NodeRef } from '../menu/state';

/**
 * Props for the Shell component
 */
interface ShellProps {
  /** Content to render inside the shell */
  children: ReactNode;
  /** Callback fired on tap */
  onPress?: () => void;
  /** Callback fired when press begins */
  onPressIn?: () => void;
  /** Callback fired when press ends */
  onPressOut?: () => void;
  /** Visual style variant */
  variant?: 'default' | 'ghost' | 'glow';
  /** Additional styles */
  style?: any;
  /** Node reference for context menu (enables long-press) */
  nodeRef?: NodeRef;
}

/**
 * Base container primitive for Ripple feed items.
 */
export const Shell = ({
  children,
  onPress,
  onPressIn,
  onPressOut,
  variant = 'default',
  style,
  nodeRef,
}: ShellProps) => {
  // Set up long-press gesture if nodeRef provided
  const holdGesture = nodeRef ? useHold(nodeRef) : null;

  const content = (
    <Pressable
      style={[
        styles.shell,
        variant === 'ghost' && styles.ghost,
        variant === 'glow' && styles.glow,
        style,
      ]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      {children}
    </Pressable>
  );

  // Wrap with gesture detector if we have a gesture
  if (holdGesture) {
    return (
      <GestureDetector gesture={holdGesture}>
        {content}
      </GestureDetector>
    );
  }

  return content;
};

const styles = StyleSheet.create((theme) => ({
  shell: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    overflow: 'hidden',
    // Medium shadow preset
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed' as const,
    borderColor: theme.colors.borderSubtle,
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  glow: {
    borderColor: theme.colors.accentGlow,
    borderWidth: 1.5,
    // Bioluminescent cyan glow effect
    shadowColor: theme.colors.accentGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
}));
