/**
 * useNavigator Hook
 *
 * Manages navigation state using Zustand store.
 * Follows LynxJS IFR patterns for optimal performance.
 */

import { useState } from '@lynx-js/react';
import {
  useNavigationStore,
  initializeNavigation,
  type FeatureName,
  type NavigationFrame,
  type NavigationListener,
  type NavigationEvent,
  type NavigationEventPayload,
} from './navigationStore';

// Re-export types
export type {
  FeatureName,
  NavigationFrame,
  NavigationListener,
  NavigationEvent,
  NavigationEventPayload,
};

/**
 * Navigator hook return type
 */
export interface NavigatorInstance {
  /** Current active frame */
  current: NavigationFrame;
  /** Navigation history stack */
  stack: NavigationFrame[];
  /** Navigate to a new feature */
  navigate: (feature: FeatureName, data?: any) => void;
  /** Go back to previous frame */
  goBack: () => void;
  /** Replace current frame */
  replace: (feature: FeatureName, data?: any) => void;
  /** Reset navigation to root */
  reset: (feature: FeatureName, data?: any) => void;
  /** Check if can go back */
  canGoBack: boolean;
  /** Subscribe to navigation events */
  on: (listener: NavigationListener) => () => void;
  /** Transition state */
  isTransitioning: boolean;
}

/**
 * useNavigator manages frame-based navigation using Zustand store.
 *
 * Follows LynxJS IFR pattern - initializes navigation on first render
 * without useEffect, ensuring instant first-frame rendering.
 *
 * @param initialFeature - Feature to show initially (defaults to 'lobby')
 *
 * @example
 * ```typescript
 * const navigator = useNavigator('lobby');
 *
 * // Listen to navigation events
 * useEffect(() => {
 *   const unsubscribe = navigator.on((event) => {
 *     console.log('Navigation:', event.type, event.to.feature);
 *   });
 *   return unsubscribe;
 * }, [navigator.on]);
 *
 * // Navigate to game
 * navigator.navigate('game', { sessionId: 'abc123' });
 *
 * // Go back
 * if (navigator.canGoBack) {
 *   navigator.goBack();
 * }
 * ```
 */
export function useNavigator(initialFeature: FeatureName = 'lobby'): NavigatorInstance {
  // IFR pattern: Initialize navigation on first render
  useState(() => {
    'background only';
    initializeNavigation(initialFeature);
  });

  // Subscribe to store state
  const stack = useNavigationStore((state) => state.stack);
  const isTransitioning = useNavigationStore((state) => state.isTransitioning);
  const navigate = useNavigationStore((state) => state.navigate);
  const goBack = useNavigationStore((state) => state.goBack);
  const replace = useNavigationStore((state) => state.replace);
  const reset = useNavigationStore((state) => state.reset);
  const subscribe = useNavigationStore((state) => state.subscribe);

  // Get current frame (last in stack)
  const current = stack[stack.length - 1] || {
    feature: initialFeature,
    id: 'loading',
    timestamp: Date.now(),
  };

  return {
    current,
    stack,
    navigate,
    goBack,
    replace,
    reset,
    canGoBack: stack.length > 1,
    on: subscribe,
    isTransitioning,
  };
}
