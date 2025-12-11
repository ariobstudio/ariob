/**
 * Navigation Container
 *
 * Root component for navigation system
 */

import { useEffect, useState, useRef } from '@lynx-js/react';
import type { NavigationContainerProps } from './types';
import { useNavigationStore } from './navigationStore';
import { getStateFromPath } from './persistence';

/**
 * Navigation Container
 *
 * Wraps the entire app and provides navigation context
 */
export function NavigationContainer({
  children,
  linking,
  fallback,
  theme,
  onStateChange,
  onReady,
}: NavigationContainerProps) {
  const [isReady, setIsReady] = useState(false);
  const { reset, dispatch, getActiveNavigator } = useNavigationStore();
  const linkingSubscriptionRef = useRef<(() => void) | null>(null);

  // Initialize navigation and handle initial deep link
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('[NavigationContainer] Initializing...');

        // Handle initial deep link if configured
        if (linking?.enabled !== false && linking?.getInitialURL) {
          await handleInitialDeepLink(linking);
        }

        setIsReady(true);
        console.log('[NavigationContainer] Ready');
        onReady?.();
      } catch (error) {
        console.error('[NavigationContainer] Failed to initialize:', error);
        setIsReady(true); // Still mark as ready to show UI
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      console.log('[NavigationContainer] Cleaning up');
      reset();
    };
  }, [linking, onReady, reset]);

  // Subscribe to URL changes for deep linking
  useEffect(() => {
    if (!isReady || !linking?.enabled || !linking?.subscribe) {
      return;
    }

    console.log('[NavigationContainer] Subscribing to URL changes');

    const unsubscribe = linking.subscribe((url: string) => {
      console.log('[NavigationContainer] URL changed:', url);
      handleDeepLink(url, linking);
    });

    linkingSubscriptionRef.current = unsubscribe;

    return () => {
      console.log('[NavigationContainer] Unsubscribing from URL changes');
      linkingSubscriptionRef.current?.();
      linkingSubscriptionRef.current = null;
    };
  }, [isReady, linking]);

  // Handle initial deep link
  async function handleInitialDeepLink(linkingConfig: NonNullable<NavigationContainerProps['linking']>) {
    try {
      const url = await linkingConfig.getInitialURL?.();
      
      if (url) {
        console.log('[NavigationContainer] Initial URL:', url);
        await handleDeepLink(url, linkingConfig);
      }
    } catch (error) {
      console.error('[NavigationContainer] Failed to get initial URL:', error);
    }
  }

  // Handle deep link navigation
  async function handleDeepLink(
    url: string,
    linkingConfig: NonNullable<NavigationContainerProps['linking']>
  ) {
    try {
      // Convert URL to navigation state
      const state = await getStateFromPath(url, linkingConfig);

      if (!state) {
        console.warn('[NavigationContainer] Could not parse URL:', url);
        return;
      }

      console.log('[NavigationContainer] Navigating to state from URL:', state);

      // Get the active navigator and dispatch navigation
      const navigator = getActiveNavigator();
      if (navigator) {
        // Navigate to the first route in the state
        const route = state.routes[state.index];
        if (route) {
          dispatch(navigator.id, {
            type: 'NAVIGATE',
            payload: {
              name: route.name,
              params: route.params,
            },
          });
        }
      }
    } catch (error) {
      console.error('[NavigationContainer] Failed to handle deep link:', error);
    }
  }

  // Listen for state changes
  useEffect(() => {
    if (!isReady) return;

    const { addListener, getActiveNavigator } = useNavigationStore.getState();
    const navigator = getActiveNavigator();

    if (!navigator) return;

    const cleanup = addListener(navigator.id, 'state', (event) => {
      onStateChange?.(event.data?.state);
    });

    return cleanup;
  }, [isReady, onStateChange]);

  if (!isReady && fallback) {
    return <>{fallback}</>;
  }

  return (
    <view className="flex-1">
      {children}
    </view>
  );
}

