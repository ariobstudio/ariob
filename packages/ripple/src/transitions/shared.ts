/**
 * Shared Element Transitions
 *
 * Configuration for seamless navigation between views.
 * Uses React Native Reanimated 4's native shared element system.
 *
 * @note In Reanimated 4.x, shared transitions are handled automatically
 * when using `sharedTransitionTag` on Animated.View components.
 * The native layer handles the animation - no custom transition builders needed.
 */

import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

// ─────────────────────────────────────────────────────────────────────────────
// Spring Configs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default spring configuration for smooth, snappy animations.
 */
export const springConfig: WithSpringConfig = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
};

/**
 * Faster spring for quick interactions.
 */
export const fastSpringConfig: WithSpringConfig = {
  damping: 25,
  stiffness: 300,
  mass: 0.6,
};

/**
 * Gentle spring for subtle movements.
 */
export const gentleSpringConfig: WithSpringConfig = {
  damping: 15,
  stiffness: 120,
  mass: 1,
};

// ─────────────────────────────────────────────────────────────────────────────
// Timing Configs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fast timing for quick fades.
 */
export const fastTimingConfig: WithTimingConfig = {
  duration: 150,
};

/**
 * Normal timing for standard transitions.
 */
export const normalTimingConfig: WithTimingConfig = {
  duration: 250,
};

// ─────────────────────────────────────────────────────────────────────────────
// Duration Constants
// ─────────────────────────────────────────────────────────────────────────────

export const TRANSITION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Transition Tag Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a unique transition tag for a node.
 * Use the same tag on source and destination views for shared element animation.
 *
 * @example
 * ```tsx
 * // In feed
 * <Animated.View sharedTransitionTag={getNodeTag(item.id)}>
 *   <Node data={item} />
 * </Animated.View>
 *
 * // In thread detail (same tag)
 * <Animated.View sharedTransitionTag={getNodeTag(id)}>
 *   <Node data={threadData} />
 * </Animated.View>
 * ```
 */
export function getNodeTag(nodeId: string): string {
  return `node-${nodeId}`;
}

/**
 * Generate a transition tag for an avatar.
 */
export function getAvatarTag(userId: string): string {
  return `avatar-${userId}`;
}

/**
 * Generate a transition tag for a shell/card.
 */
export function getShellTag(nodeId: string): string {
  return `shell-${nodeId}`;
}
