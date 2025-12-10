/**
 * Navigation Hook
 *
 * Provides type-safe navigation for node views.
 */

import { useCallback } from 'react';
import { router } from 'expo-router';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** View modes for node navigation */
export type ViewMode = 'preview' | 'full' | 'immersive';

/** Navigation options */
export interface NavigateOptions {
  /** Animation transition tag */
  transitionTag?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Navigation hook for node views.
 *
 * @example
 * ```tsx
 * const { navigate, back } = useNodeNavigation();
 *
 * // Navigate to thread detail
 * navigate('abc123', 'full');
 *
 * // Navigate to message/chat
 * navigate('xyz789', 'immersive');
 * ```
 */
export function useNodeNavigation() {
  /**
   * Navigate to a node view
   */
  const navigate = useCallback(
    (nodeId: string, mode: ViewMode = 'full', options?: NavigateOptions) => {
      switch (mode) {
        case 'full':
          router.push({
            pathname: '/thread/[id]',
            params: { id: nodeId },
          });
          break;
        case 'immersive':
          router.push({
            pathname: '/message/[id]',
            params: { id: nodeId },
          });
          break;
        case 'preview':
          // Preview mode doesn't navigate, used for focus state
          break;
      }
    },
    []
  );

  /**
   * Navigate back
   */
  const back = useCallback(() => {
    router.back();
  }, []);

  /**
   * Navigate to user profile
   */
  const toProfile = useCallback((userId: string) => {
    router.push({
      pathname: '/user/[id]',
      params: { id: userId },
    });
  }, []);

  return { navigate, back, toProfile };
}

/**
 * Generate a transition tag for a node
 */
export function getTransitionTag(nodeId: string, prefix = 'node'): string {
  return `${prefix}-${nodeId}`;
}
