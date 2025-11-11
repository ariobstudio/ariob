/**
 * Navigation Tracking
 *
 * Utilities for tracking screen views and navigation events
 * Useful for analytics integration
 */

import { useEffect, useRef } from '@lynx-js/react';
import { useNavigationStore } from './navigationStore';
import type { NavigationState, ParamListBase } from './types';

// ============================================================================
// Types
// ============================================================================

export interface ScreenTrackingOptions {
  /**
   * Function to call when screen changes
   */
  onScreenChange?: (screen: string, params?: object) => void;

  /**
   * Function to call when navigation state changes
   */
  onStateChange?: (state: NavigationState<ParamListBase>) => void;

  /**
   * Whether to track the initial screen
   * @default true
   */
  trackInitialScreen?: boolean;

  /**
   * Custom function to extract screen name from state
   */
  getScreenName?: (state: NavigationState<ParamListBase>) => string;
}

// ============================================================================
// Tracking Hook
// ============================================================================

/**
 * Track screen views for analytics
 *
 * @param options Tracking options
 *
 * @example
 * ```typescript
 * useNavigationTracking({
 *   onScreenChange: (screen, params) => {
 *     analytics.track('Screen View', { screen, ...params });
 *   },
 * });
 * ```
 */
export function useNavigationTracking(options: ScreenTrackingOptions = {}) {
  const {
    onScreenChange,
    onStateChange,
    trackInitialScreen = true,
    getScreenName: customGetScreenName,
  } = options;

  const { getActiveNavigator, addListener } = useNavigationStore();
  const previousScreenRef = useRef<string | null>(null);
  const hasTrackedInitial = useRef(false);

  // Get current screen name from state
  const getScreenName = (state: NavigationState<ParamListBase>): string => {
    if (customGetScreenName) {
      return customGetScreenName(state);
    }

    // Default: get the name of the active route
    const route = state.routes[state.index];
    return route?.name || 'Unknown';
  };

  // Track initial screen
  useEffect(() => {
    if (!trackInitialScreen || hasTrackedInitial.current) {
      return;
    }

    const navigator = getActiveNavigator();
    if (navigator) {
      const screenName = getScreenName(navigator.state);
      const route = navigator.state.routes[navigator.state.index];
      
      console.log('[useNavigationTracking] Initial screen:', screenName);
      
      if (onScreenChange) {
        onScreenChange(screenName, route?.params as object | undefined);
      }
      
      previousScreenRef.current = screenName;
      hasTrackedInitial.current = true;
    }
  }, [trackInitialScreen, onScreenChange, getActiveNavigator]);

  // Track navigation changes
  useEffect(() => {
    const navigator = getActiveNavigator();
    if (!navigator) {
      return;
    }

    const cleanup = addListener(navigator.id, 'state', (event) => {
      const state = event.data?.state as NavigationState<ParamListBase>;
      
      if (!state) {
        return;
      }

      console.log('[useNavigationTracking] State changed');

      // Call state change callback
      if (onStateChange) {
        onStateChange(state);
      }

      // Track screen change
      if (onScreenChange) {
        const screenName = getScreenName(state);
        const route = state.routes[state.index];

        // Only track if screen actually changed
        if (screenName !== previousScreenRef.current) {
          console.log('[useNavigationTracking] Screen changed to:', screenName);
          onScreenChange(screenName, route?.params as object | undefined);
          previousScreenRef.current = screenName;
        }
      }
    });

    return cleanup;
  }, [onScreenChange, onStateChange, getActiveNavigator, addListener]);
}

// ============================================================================
// Screen Analytics Helper
// ============================================================================

/**
 * Create a screen tracking function for common analytics platforms
 *
 * @param trackEvent Function to track events in your analytics platform
 * @returns Screen change handler
 *
 * @example
 * ```typescript
 * const trackScreen = createScreenTracker((event, properties) => {
 *   analytics.track(event, properties);
 * });
 *
 * useNavigationTracking({
 *   onScreenChange: trackScreen,
 * });
 * ```
 */
export function createScreenTracker(
  trackEvent: (event: string, properties: Record<string, any>) => void
) {
  return (screen: string, params?: object) => {
    console.log('[createScreenTracker] Tracking screen:', screen);
    
    trackEvent('Screen View', {
      screen_name: screen,
      ...params,
    });
  };
}

// ============================================================================
// Route Timing Tracker
// ============================================================================

/**
 * Track how long users spend on each screen
 *
 * @example
 * ```typescript
 * const timingTracker = useRouteTimingTracker({
 *   onRouteEnd: (screen, duration) => {
 *     analytics.track('Screen Duration', { screen, duration });
 *   },
 * });
 * ```
 */
export function useRouteTimingTracker(options: {
  onRouteStart?: (screen: string) => void;
  onRouteEnd?: (screen: string, durationMs: number) => void;
}) {
  const { onRouteStart, onRouteEnd } = options;
  const startTimeRef = useRef<number>(Date.now());
  const currentScreenRef = useRef<string | null>(null);

  useNavigationTracking({
    onScreenChange: (screen) => {
      const now = Date.now();

      // Track end of previous screen
      if (currentScreenRef.current && onRouteEnd) {
        const duration = now - startTimeRef.current;
        console.log('[useRouteTimingTracker] Screen ended:', currentScreenRef.current, 'Duration:', duration);
        onRouteEnd(currentScreenRef.current, duration);
      }

      // Track start of new screen
      if (onRouteStart) {
        console.log('[useRouteTimingTracker] Screen started:', screen);
        onRouteStart(screen);
      }

      currentScreenRef.current = screen;
      startTimeRef.current = now;
    },
  });
}

