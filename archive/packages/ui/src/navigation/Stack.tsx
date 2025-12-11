/**
 * Stack Navigator Component
 *
 * Provides stack-based navigation with native iOS integration
 */

import { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from '@lynx-js/react';
import type {
  ParamListBase,
  StackNavigatorProps,
  StackScreenOptions,
  StackScreenComponentProps,
  Route,
  NavigationState,
  StackNavigationProp,
  RouteProp,
} from './types';
import {
  useNavigationStore,
  createNavigationState,
  generateRouteKey,
  type NavigatorConfig,
} from './navigationStore';

// ============================================================================
// Stack Navigator Context
// ============================================================================

interface StackNavigatorContext<ParamList extends ParamListBase> {
  navigatorId: string;
  registerScreen: (name: keyof ParamList, config: any) => void;
}

const StackContext = createContext<StackNavigatorContext<any> | null>(null);

// ============================================================================
// Stack Navigator Component
// ============================================================================

export function createStackNavigator<ParamList extends ParamListBase>() {
  /**
   * Stack Navigator
   */
  function Navigator({
    initialRouteName,
    screenOptions,
    children,
  }: StackNavigatorProps<ParamList>) {
    const navigatorId = useRef(`stack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`).current;

    const [screens, setScreens] = useState<Map<keyof ParamList, any>>(new Map());
    const [isReady, setIsReady] = useState(false);

    const {
      registerNavigator,
      unregisterNavigator,
      getNavigator,
      dispatch,
      addListener,
    } = useNavigationStore();

    // Register screen from children
    const registerScreen = useCallback((name: keyof ParamList, config: any) => {
      setScreens((prev) => {
        const next = new Map(prev);
        next.set(name, config);
        return next;
      });
    }, []);

    // Process children to extract screen configurations
    useEffect(() => {
      if (children) {
        const screenConfigs = new Map<keyof ParamList, any>();

        // Convert children to array and iterate
        const childrenArray = Array.isArray(children) ? children : [children];
        childrenArray.forEach((child: any) => {
          if (child && child.type === Screen) {
            const { name, component, initialParams, options, getOptions } = child.props;
            screenConfigs.set(name, {
              name,
              component,
              initialParams,
              options,
              getOptions,
            });
          }
        });

        setScreens(screenConfigs);
      }
    }, [children]);

    // Initialize navigator ONCE (but effect must run when screens populate)
    useEffect(() => {
      if (screens.size === 0) return;

      // Check if navigator already exists (don't re-initialize)
      const existingNavigator = getNavigator(navigatorId);
      if (existingNavigator) {
        setIsReady(true);
        return;
      }

      // Create initial route
      const firstScreenName = initialRouteName || Array.from(screens.keys())[0];
      const firstScreen = screens.get(firstScreenName);

      if (!firstScreen) return;

      const initialRoute: Route<ParamList> = {
        key: generateRouteKey(firstScreenName as string),
        name: firstScreenName as string,
        params: firstScreen.initialParams,
      };

      const initialState = createNavigationState<ParamList>(
        'stack',
        [initialRoute],
        0
      );

      // Register navigator (only happens once due to guard above)
      const config: NavigatorConfig = {
        id: navigatorId,
        type: 'stack',
        initialRouteName: firstScreenName as string,
        routes: new Map([[firstScreenName as string, initialRoute]]) as any,
        state: initialState as any,
      };

      registerNavigator(config);
      setIsReady(true);

      return () => {
        unregisterNavigator(navigatorId);
      };
    }, [screens, navigatorId, initialRouteName, registerNavigator, unregisterNavigator, getNavigator]);

    // Note: Native navigator sync removed - we're using pure React rendering now

    // Get current navigation state
    const navigator = getNavigator(navigatorId);
    const currentState = navigator?.state;

    const contextValue = useMemo(
      () => ({
        navigatorId,
        registerScreen,
      }),
      [navigatorId, registerScreen]
    );

    if (!isReady || !currentState) {
      return null;
    }

    // Render ALL screens in the stack (like React Navigation does)
    const allScreens = currentState.routes.map((route, index) => {
      const screen = screens.get(route.name as keyof ParamList);
      const isActive = index === currentState.index;

      if (!screen) return null;

      return (
        <view
          key={route.key}
          className="absolute top-0 left-0 right-0 bottom-0"
          style={{
            display: isActive ? 'flex' : 'none',
            zIndex: index
          }}
        >
          <ScreenRenderer
            screen={screen}
            route={route}
            navigatorId={navigatorId}
          />
        </view>
      );
    });

    return (
      <StackContext.Provider value={contextValue as any}>
        <view className="flex-1 relative">
          {allScreens}
        </view>
      </StackContext.Provider>
    );
  }

  /**
   * Stack Screen
   */
  function Screen<RouteName extends keyof ParamList>({
    name,
    component,
    initialParams,
    options,
    getOptions,
  }: StackScreenComponentProps<ParamList, RouteName>) {
    // Screen is declarative - it doesn't render anything directly
    // The Navigator processes Screen children to build configuration
    return null;
  }

  return {
    Navigator,
    Screen,
  };
}

// ============================================================================
// Screen Renderer Component
// ============================================================================

interface ScreenRendererProps {
  screen: any;
  route: Route;
  navigatorId: string;
}

function ScreenRenderer({ screen, route, navigatorId }: ScreenRendererProps) {
  const { dispatch, getNavigator, addListener } = useNavigationStore();

  // Create navigation prop
  const navigation: StackNavigationProp<any, any> = useMemo(() => {
    return {
      navigate: ((...args: any[]) => {
        'background only';
        const [screenName, params] = args;
        dispatch(navigatorId, {
          type: 'NAVIGATE',
          payload: { name: screenName, params },
        });
      }) as any,
      push: ((...args: any[]) => {
        'background only';
        const [screenName, params] = args;
        console.log('[Stack] PUSH action:', screenName, 'params:', params);
        dispatch(navigatorId, {
          type: 'PUSH',
          payload: { name: screenName, params },
        });
      }) as any,
      pop: (count = 1) => {
        'background only';
        dispatch(navigatorId, {
          type: 'POP',
          payload: { count },
        });
      },
      popToTop: () => {
        'background only';
        dispatch(navigatorId, {
          type: 'POP_TO_TOP',
        });
      },
      goBack: () => {
        'background only';
        dispatch(navigatorId, {
          type: 'GO_BACK',
        });
      },
      replace: ((...args: any[]) => {
        'background only';
        const [screenName, params] = args;
        dispatch(navigatorId, {
          type: 'REPLACE',
          payload: { name: screenName, params },
        });
      }) as any,
      reset: (state: any) => {
        'background only';
        dispatch(navigatorId, {
          type: 'RESET',
          payload: { state },
        });
      },
      canGoBack: () => {
        const navigator = getNavigator(navigatorId);
        return navigator ? navigator.state.index > 0 : false;
      },
      getState: () => {
        const navigator = getNavigator(navigatorId);
        return navigator?.state!;
      },
      getParent: () => undefined,
      addListener: (type, callback) => {
        return addListener(navigatorId, type, callback);
      },
      removeListener: (type, callback) => {
        // Implemented in store
      },
    };
  }, [navigatorId, dispatch, getNavigator, addListener]);

  // Create route prop
  const routeProp: RouteProp<any, any> = useMemo(() => {
    return {
      ...route,
      params: route.params || {},
    };
  }, [route]);

  const ScreenComponent = screen.component;

  return (
    <view className="flex-1">
      <ScreenComponent navigation={navigation} route={routeProp} />
    </view>
  );
}

// ============================================================================
// Hook to access Stack context
// ============================================================================

export function useStackNavigator<ParamList extends ParamListBase>() {
  const context = useContext<StackNavigatorContext<ParamList>>(StackContext as any);

  if (!context) {
    throw new Error('useStackNavigator must be used within a Stack.Navigator');
  }

  return context;
}
