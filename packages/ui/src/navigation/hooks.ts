/**
 * Navigation Hooks
 *
 * Hooks for accessing navigation functionality in components
 */

import { useEffect, useRef, useCallback } from '@lynx-js/react';
import type {
  NavigationProp,
  ParamListBase,
  RouteProp,
  NavigationState,
  NavigationEventName,
} from './types';
import { useNavigationStore } from './navigationStore';

// ============================================================================
// useNavigation Hook
// ============================================================================

/**
 * Get the navigation object for the current screen
 */
export function useNavigation<
  T extends NavigationProp<ParamListBase> = NavigationProp<ParamListBase>
>(): T {
  const { getActiveNavigator, dispatch, addListener } = useNavigationStore();

  const navigator = getActiveNavigator();

  if (!navigator) {
    throw new Error('useNavigation must be used within a Navigator');
  }

  const navigatorId = navigator.id;

  const navigation: NavigationProp<any> = {
    navigate: ((...args: any[]) => {
      'background only';
      const [screen, params] = args;
      dispatch(navigatorId, {
        type: 'NAVIGATE',
        payload: { name: screen, params },
      });
    }) as any,
    goBack: () => {
      'background only';
      dispatch(navigatorId, {
        type: 'GO_BACK',
      });
    },
    canGoBack: () => {
      return navigator.state.index > 0;
    },
    getState: () => {
      return navigator.state;
    },
    getParent: () => undefined,
    addListener: (type: NavigationEventName, callback: any) => {
      return addListener(navigatorId, type, callback);
    },
    removeListener: () => {
      // Implemented via cleanup function from addListener
    },
  };

  return navigation as T;
}

// ============================================================================
// useRoute Hook
// ============================================================================

/**
 * Get the route object for the current screen
 */
export function useRoute<T extends RouteProp<ParamListBase, string> = RouteProp<ParamListBase, string>>(): T {
  const { getActiveNavigator } = useNavigationStore();

  const navigator = getActiveNavigator();

  if (!navigator) {
    throw new Error('useRoute must be used within a Navigator');
  }

  const currentRoute = navigator.state.routes[navigator.state.index];

  if (!currentRoute) {
    throw new Error('useRoute: No active route found');
  }

  return {
    ...currentRoute,
    params: currentRoute.params || {},
  } as T;
}

// ============================================================================
// useFocusEffect Hook
// ============================================================================

/**
 * Run an effect when the screen comes into focus
 *
 * @param effect Effect to run when screen focuses
 */
export function useFocusEffect(effect: () => void | (() => void)): void {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      return effect();
    }
  }, [isFocused, effect]);
}

// ============================================================================
// useIsFocused Hook
// ============================================================================

/**
 * Check if the current screen is focused
 */
export function useIsFocused(): boolean {
  const { getActiveNavigator, addListener } = useNavigationStore();
  const isFocusedRef = useRef(true);

  const navigator = getActiveNavigator();

  if (!navigator) {
    return false;
  }

  useEffect(() => {
    const cleanupFocus = addListener(navigator.id, 'focus', () => {
      isFocusedRef.current = true;
    });

    const cleanupBlur = addListener(navigator.id, 'blur', () => {
      isFocusedRef.current = false;
    });

    return () => {
      cleanupFocus();
      cleanupBlur();
    };
  }, [navigator.id, addListener]);

  return isFocusedRef.current;
}

// ============================================================================
// useNavigationState Hook
// ============================================================================

/**
 * Get a value from the navigation state
 *
 * @param selector Selector function to extract value from state
 */
export function useNavigationState<T>(
  selector: (state: NavigationState) => T
): T {
  const { getActiveNavigator } = useNavigationStore();

  const navigator = getActiveNavigator();

  if (!navigator) {
    throw new Error('useNavigationState must be used within a Navigator');
  }

  return selector(navigator.state);
}

// ============================================================================
// useNavigationBuilder Hook
// ============================================================================

/**
 * Low-level hook for building custom navigators
 *
 * @param type Navigator type
 * @param initialState Initial navigation state
 */
export function useNavigationBuilder(
  type: string,
  initialState: NavigationState
) {
  const {
    registerNavigator,
    unregisterNavigator,
    getNavigator,
    dispatch,
    addListener,
  } = useNavigationStore();

  const navigatorId = useRef(`${type}-${Date.now()}`).current;

  useEffect(() => {
    registerNavigator({
      id: navigatorId,
      type: type as any,
      routes: new Map(),
      state: initialState,
    });

    return () => {
      unregisterNavigator(navigatorId);
    };
  }, []);

  const navigator = getNavigator(navigatorId);

  return {
    navigatorId,
    state: navigator?.state,
    dispatch: (action: any) => dispatch(navigatorId, action),
    addListener: (type: NavigationEventName, callback: any) =>
      addListener(navigatorId, type, callback),
  };
}

// ============================================================================
// useScrollToTop Hook
// ============================================================================

/**
 * Scroll to top when tab is pressed
 * Commonly used in tab navigators to scroll content to top when tapping active tab
 *
 * @param ref Ref to scrollable element
 */
export function useScrollToTop(ref: React.RefObject<any>): void {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const unsubscribe = navigation.addListener('tabPress' as any, () => {
      console.log('[useScrollToTop] Tab pressed, scrolling to top');

      // Scroll to top
      if (ref.current) {
        if (typeof ref.current.scrollToTop === 'function') {
          ref.current.scrollToTop();
        } else if (typeof ref.current.scrollTo === 'function') {
          ref.current.scrollTo({ y: 0, animated: true });
        }
      }
    });

    return unsubscribe;
  }, [navigation, isFocused, ref]);
}

// ============================================================================
// useLinkTo Hook
// ============================================================================

/**
 * Navigate using path strings
 * Useful for deep linking and URL-based navigation
 *
 * @returns Function to navigate to a path
 */
export function useLinkTo() {
  const navigation = useNavigation();

  return useCallback((path: string) => {
    console.log('[useLinkTo] Navigating to path:', path);

    // Parse path and extract screen name and params
    // Format: /screen?param1=value1&param2=value2
    const pathParts = path.split('?');
    const screenPath = pathParts[0];
    const queryString = pathParts[1];
    
    if (!screenPath) {
      console.warn('[useLinkTo] Invalid path:', path);
      return;
    }
    
    const screenName = screenPath.replace(/^\//, ''); // Remove leading slash

    // Parse query params
    const params: any = {};
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    // Navigate
    navigation.navigate(screenName as any, params);
  }, [navigation]);
}

// ============================================================================
// useLinkProps Hook
// ============================================================================

/**
 * Get props for Link component
 * Returns onPress handler and accessibility props
 *
 * @param to Path or screen to navigate to
 * @returns Props for link component
 */
export function useLinkProps({ to }: { to: string }) {
  const linkTo = useLinkTo();

  return {
    onPress: useCallback(() => {
      linkTo(to);
    }, [linkTo, to]),
    accessibilityRole: 'link' as const,
  };
}

// ============================================================================
// useLinkBuilder Hook
// ============================================================================

/**
 * Build navigation links
 * Returns a function to build links from screen names and params
 *
 * @returns Function to build links
 */
export function useLinkBuilder() {
  return useCallback((screen: string, params?: object) => {
    console.log('[useLinkBuilder] Building link:', { screen, params });

    let path = `/${screen}`;

    if (params && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
      path += `?${queryString}`;
    }

    return path;
  }, []);
}

// ============================================================================
// usePreventRemove Hook
// ============================================================================

/**
 * Prevent navigation away from screen
 * Useful for unsaved changes warnings
 *
 * @param shouldPrevent Whether to prevent navigation
 * @param callback Callback to run when navigation is attempted
 */
export function usePreventRemove(
  shouldPrevent: boolean,
  callback?: (data: { action: any }) => void
): void {
  const navigation = useNavigation();

  useEffect(() => {
    if (!shouldPrevent) {
      return;
    }

    console.log('[usePreventRemove] Preventing navigation removal');

    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      // Prevent default behavior
      e.preventDefault();

      console.log('[usePreventRemove] Navigation prevented, calling callback');

      // Call callback if provided
      if (callback) {
        callback({ action: e.data?.action });
      }
    });

    return unsubscribe;
  }, [navigation, shouldPrevent, callback]);
}
