/**
 * Tab Navigator Component
 *
 * Provides tab-based navigation with native iOS integration
 */

import { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from '@lynx-js/react';
import type {
  ParamListBase,
  TabNavigatorProps,
  TabScreenOptions,
  TabScreenComponentProps,
  Route,
  NavigationState,
  TabNavigationProp,
  RouteProp,
} from './types';
import {
  useNavigationStore,
  createNavigationState,
  generateRouteKey,
  type NavigatorConfig,
} from './navigationStore';

// ============================================================================
// Tab Navigator Context
// ============================================================================

interface TabNavigatorContext<ParamList extends ParamListBase> {
  navigatorId: string;
  registerTab: (name: keyof ParamList, config: any) => void;
}

const TabContext = createContext<TabNavigatorContext<any> | null>(null);

// ============================================================================
// Tab Navigator Component
// ============================================================================

export function createTabNavigator<ParamList extends ParamListBase>() {
  /**
   * Tab Navigator
   */
  function Navigator({
    initialRouteName,
    screenOptions,
    tabBarStyle,
    children,
  }: TabNavigatorProps<ParamList>) {
    const navigatorId = useRef(`tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`).current;
    const nativeRef = useRef<any>(null);

    const [tabs, setTabs] = useState<Map<keyof ParamList, any>>(new Map());
    const [isReady, setIsReady] = useState(false);

    const {
      registerNavigator,
      unregisterNavigator,
      getNavigator,
      dispatch,
      addListener,
    } = useNavigationStore();

    // Register tab from children
    const registerTab = useCallback((name: keyof ParamList, config: any) => {
      setTabs((prev) => {
        const next = new Map(prev);
        next.set(name, config);
        return next;
      });
    }, []);

    // Process children to extract tab configurations
    useEffect(() => {
      if (children) {
        const tabConfigs = new Map<keyof ParamList, any>();

        // Convert children to array and iterate
        const childrenArray = Array.isArray(children) ? children : [children];
        childrenArray.forEach((child: any) => {
          if (child && child.type === Screen) {
            const { name, component, initialParams, options, getOptions } = child.props;
            tabConfigs.set(name, {
              name,
              component,
              initialParams,
              options,
              getOptions,
            });
          }
        });

        setTabs(tabConfigs);
      }
    }, [children]);

    // Initialize navigator ONCE (but effect must run when tabs populate)
    useEffect(() => {
      if (tabs.size === 0) return;

      // Check if navigator already exists (don't re-initialize)
      const existingNavigator = getNavigator(navigatorId);
      if (existingNavigator) {
        setIsReady(true);
        return;
      }

      // Create routes for all tabs (tabs are all mounted at once)
      const tabRoutes: Route<ParamList>[] = Array.from(tabs.entries()).map(([name, config]) => ({
        key: generateRouteKey(name as string),
        name: name as string,
        params: config.initialParams,
      }));

      const initialIndex = initialRouteName
        ? Array.from(tabs.keys()).indexOf(initialRouteName)
        : 0;

      const initialState = createNavigationState<ParamList>(
        'tab',
        tabRoutes,
        initialIndex >= 0 ? initialIndex : 0
      );

      // Register navigator (only happens once due to guard above)
      const config: NavigatorConfig = {
        id: navigatorId,
        type: 'tab',
        initialRouteName: initialRouteName as string,
        routes: new Map(tabRoutes.map(route => [route.name, route])) as any,
        state: initialState as any,
      };

      registerNavigator(config);
      setIsReady(true);

      return () => {
        unregisterNavigator(navigatorId);
      };
    }, [tabs, navigatorId, initialRouteName, registerNavigator, unregisterNavigator, getNavigator]);

    // Listen for navigation state changes
    useEffect(() => {
      if (!isReady) return;

      const cleanup = addListener(navigatorId, 'state', (event) => {
        const state = event.data?.state as NavigationState<ParamList>;
        if (state && nativeRef.current) {
          // Sync state to native navigator
          updateNativeNavigator(state);
        }
      });

      return cleanup;
    }, [isReady, navigatorId, addListener]);

    // Update native navigator
    const updateNativeNavigator = useCallback((state: NavigationState<ParamList>) => {
      if (!nativeRef.current) return;

      // Parse screen options from props
      const defaultScreenOptions = screenOptions || {};

      // Convert tab configs to native format
      const nativeTabs = Array.from(tabs.entries()).map(([name, config]) => {
        const configTabOptions: TabScreenOptions =
          typeof config.options === 'function'
            ? config.options({})
            : config.options || defaultScreenOptions;

        return {
          name: name as string,
          title: configTabOptions.title || (name as string),
          icon: configTabOptions.tabBarIcon,
          activeIcon: configTabOptions.tabBarActiveIcon,
          badge: configTabOptions.tabBarBadge,
          tabBarLabel: typeof configTabOptions.tabBarLabel === 'string'
            ? configTabOptions.tabBarLabel
            : configTabOptions.title || (name as string),
        };
      });

      // Update native component props
      if (nativeRef.current.setNativeProps) {
        nativeRef.current.setNativeProps({
          tabs: nativeTabs,
          'selected-index': state.index,
          'tab-bar-tint-color': tabBarStyle?.tintColor,
          'tab-bar-background-color': tabBarStyle?.backgroundColor,
          'tab-bar-hidden': tabBarStyle?.hidden || false,
        });
      }
    }, [tabs, screenOptions, tabBarStyle]);

    // Get current navigation state
    const navigator = getNavigator(navigatorId);
    const currentState = navigator?.state;

    // Track which tabs have been visited (for lazy loading)
    const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set());

    // Update visited tabs when active tab changes
    useEffect(() => {
      if (currentState && currentState.routes[currentState.index]) {
        const activeRoute = currentState.routes[currentState.index];
        if (activeRoute) {
          setVisitedTabs(prev => {
            if (!prev.has(activeRoute.key)) {
              console.log('[TabNavigator] First visit to tab:', activeRoute.name);
              return new Set([...prev, activeRoute.key]);
            }
            return prev;
          });
        }
      }
    }, [currentState?.index, currentState?.routes]);

    // Render tabs with lazy loading support
    const allTabs = currentState?.routes.map((route, index) => {
      const tab = tabs.get(route.name as keyof ParamList);
      const isActive = index === currentState.index;

      if (!tab) return null;

      // Get tab options to check lazy flag
      const tabOptions = typeof tab.options === 'function'
        ? tab.options({})
        : tab.options || {};
      
      const isLazy = tabOptions.lazy !== false; // Default true
      const hasBeenVisited = visitedTabs.has(route.key);

      // Don't render lazy tabs until they've been visited
      if (isLazy && !hasBeenVisited && !isActive) {
        console.log('[TabNavigator] Skipping lazy tab:', route.name);
        return null;
      }

      return (
        <view
          key={route.key}
          className="flex-1"
          style={{ display: isActive ? 'flex' : 'none' }}
        >
          <TabScreenRenderer
            screen={tab}
            route={route}
            navigatorId={navigatorId}
            isActive={isActive}
          />
        </view>
      );
    });

    const contextValue = useMemo(
      () => ({
        navigatorId,
        registerTab,
      }),
      [navigatorId, registerTab]
    );

    if (!isReady || tabs.size === 0) {
      return null;
    }

    // Prepare tabs for native tab bar
    const nativeTabs = useMemo(() => {
      return Array.from(tabs.entries()).map(([name, config]) => {
        const options = typeof config.options === 'function'
          ? config.options({})
          : config.options || {};
        
        return {
          name: name as string,
          title: options.title || (name as string),
          icon: options.tabBarIcon,
          activeIcon: options.tabBarActiveIcon,
          badge: options.tabBarBadge,
          // System item (iOS)
          systemItem: options.tabBarSystemItem,
          // Badge styling
          badgeBackgroundColor: options.tabBarBadgeStyle?.backgroundColor,
          badgeColor: options.tabBarBadgeStyle?.color,
          // Label styling
          labelFontFamily: options.tabBarLabelStyle?.fontFamily,
          labelFontSize: options.tabBarLabelStyle?.fontSize,
          labelFontWeight: options.tabBarLabelStyle?.fontWeight,
          labelFontStyle: options.tabBarLabelStyle?.fontStyle,
          // Lazy loading
          lazy: options.lazy !== false, // Default true
          // Pop to top on blur
          popToTopOnBlur: options.popToTopOnBlur || false,
        };
      });
    }, [tabs]);

    // Get emitEvent from store
    const { emitEvent } = useNavigationStore();

    // Handle tab change from native
    const handleNativeTabChange = useCallback((event: any) => {
      'background only';
      const { tabName, index } = event.detail || {};
      
      console.log('[TabNavigator] Tab change event:', { tabName, index });
      
      if (typeof index === 'number') {
        // Emit transition start event
        emitEvent(navigatorId, {
          type: 'transitionStart',
          target: tabName,
          data: { index },
        });

        dispatch(navigatorId, {
          type: 'JUMP_TO',
          payload: { name: tabName },
        });

        // Emit transition end event after a short delay (native animation)
        setTimeout(() => {
          emitEvent(navigatorId, {
            type: 'transitionEnd',
            target: tabName,
            data: { index },
          });
        }, 300); // Typical iOS tab animation duration
      }
    }, [dispatch, navigatorId, emitEvent]);

    // Build native tab navigator props
    const tabNavigatorProps: any = {
      ref: nativeRef,
      tabs: nativeTabs,
      'initial-tab-index': currentState?.index || 0,
      'selected-index': currentState?.index || 0,
      'tab-bar-hidden': tabBarStyle?.hidden || false,
      bindtabchange: handleNativeTabChange,
    };

    // Basic colors
    if (tabBarStyle?.tintColor) {
      tabNavigatorProps['tab-bar-tint-color'] = tabBarStyle.tintColor;
    }
    if (tabBarStyle?.backgroundColor) {
      tabNavigatorProps['tab-bar-background-color'] = tabBarStyle.backgroundColor;
    }

    // Blur effect (iOS 18 and below)
    if (tabBarStyle?.blurEffect) {
      tabNavigatorProps['tab-bar-blur-effect'] = tabBarStyle.blurEffect;
    }

    // Controller mode (iOS 18+)
    if (tabBarStyle?.controllerMode) {
      tabNavigatorProps['tab-bar-controller-mode'] = tabBarStyle.controllerMode;
    }

    // Minimize behavior (iOS 26+)
    if (tabBarStyle?.minimizeBehavior) {
      tabNavigatorProps['tab-bar-minimize-behavior'] = tabBarStyle.minimizeBehavior;
    }

    // Label visibility mode (Android)
    if (tabBarStyle?.labelVisibilityMode) {
      tabNavigatorProps['tab-bar-label-visibility-mode'] = tabBarStyle.labelVisibilityMode;
    }

    // Ripple color (Android)
    if (tabBarStyle?.rippleColor) {
      tabNavigatorProps['tab-bar-ripple-color'] = tabBarStyle.rippleColor;
    }

    // Active indicator (Android)
    if (tabBarStyle?.activeIndicatorColor) {
      tabNavigatorProps['tab-bar-active-indicator-color'] = tabBarStyle.activeIndicatorColor;
    }
    if (tabBarStyle?.activeIndicatorEnabled !== undefined) {
      tabNavigatorProps['tab-bar-active-indicator-enabled'] = tabBarStyle.activeIndicatorEnabled;
    }

    return (
      <TabContext.Provider value={contextValue as any}>
        <view className="flex-1">
          {/* Native tab navigator - manages both UI and content */}
          <tab-navigator {...tabNavigatorProps}>
            {allTabs}
          </tab-navigator>
        </view>
      </TabContext.Provider>
    );
  }

  /**
   * Tab Screen
   */
  function Screen<RouteName extends keyof ParamList>(_props: TabScreenComponentProps<ParamList, RouteName>) {
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
// Tab Screen Renderer Component
// ============================================================================

interface TabScreenRendererProps {
  screen: any;
  route: Route;
  navigatorId: string;
  isActive: boolean;
}

function TabScreenRenderer({ screen, route, navigatorId, isActive }: TabScreenRendererProps) {
  const { dispatch, getNavigator, addListener, emitEvent } = useNavigationStore();

  // Emit focus/blur events when tab becomes active/inactive
  useEffect(() => {
    if (isActive) {
      emitEvent(navigatorId, {
        type: 'focus',
        target: route.key,
      });
    } else {
      emitEvent(navigatorId, {
        type: 'blur',
        target: route.key,
      });
    }
  }, [isActive, navigatorId, route.key, emitEvent]);

  // Create navigation prop
  const navigation: TabNavigationProp<any, any> = useMemo(() => {
    return {
      navigate: ((...args: any[]) => {
        'background only';
        const [screenName, params] = args;
        dispatch(navigatorId, {
          type: 'NAVIGATE',
          payload: { name: screenName, params },
        });
      }) as any,
      jumpTo: ((...args: any[]) => {
        'background only';
        const [screenName, params] = args;
        dispatch(navigatorId, {
          type: 'JUMP_TO',
          payload: { name: screenName, params },
        });
      }) as any,
      goBack: () => {
        'background only';
        // Tabs don't have a back action, but we keep it for API compatibility
        console.warn('goBack is not supported in tab navigation');
      },
      setTabBadge: (badge?: number | string) => {
        'background only';
        // This would need to be implemented to update the native tab bar badge
        console.log('Setting tab badge:', badge);
      },
      canGoBack: () => {
        return false; // Tabs don't have a back stack
      },
      getState: () => {
        const navigator = getNavigator(navigatorId);
        return navigator?.state!;
      },
      getParent: () => undefined,
      addListener: (type, callback) => {
        return addListener(navigatorId, type, callback);
      },
      removeListener: (_type, _callback) => {
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

  return <ScreenComponent navigation={navigation} route={routeProp} />;
}

// ============================================================================
// Hook to access Tab context
// ============================================================================

export function useTabNavigator<ParamList extends ParamListBase>() {
  const context = useContext<TabNavigatorContext<ParamList>>(TabContext as any);

  if (!context) {
    throw new Error('useTabNavigator must be used within a Tab.Navigator');
  }

  return context;
}

// ============================================================================
// Static API Support
// ============================================================================

/**
 * Create a native bottom tab navigator with static configuration
 * Follows React Navigation's static API pattern
 */
export function createNativeBottomTabNavigator<ParamList extends ParamListBase>(config?: {
  screens: {
    [K in keyof ParamList]: {
      component: React.ComponentType<any>;
      options?: TabScreenOptions;
      initialParams?: ParamList[K];
    };
  };
  screenOptions?: TabScreenOptions;
  initialRouteName?: keyof ParamList;
  tabBarStyle?: TabNavigatorProps<ParamList>['tabBarStyle'];
  backBehavior?: TabNavigatorProps<ParamList>['backBehavior'];
}) {
  console.log('[TabNavigator] Creating static tab navigator with config:', config ? Object.keys(config.screens || {}) : 'none');

  const Tab = createTabNavigator<ParamList>();

  // Return a pre-configured navigator component
  function StaticTabNavigator() {
    if (!config || !config.screens) {
      console.error('[TabNavigator] Static API requires screens configuration');
      return null;
    }

    const navigatorProps: any = {};
    if (config.initialRouteName) {
      navigatorProps.initialRouteName = config.initialRouteName;
    }
    if (config.screenOptions) {
      navigatorProps.screenOptions = config.screenOptions;
    }
    if (config.tabBarStyle) {
      navigatorProps.tabBarStyle = config.tabBarStyle;
    }

    return (
      <Tab.Navigator {...navigatorProps}>
        {Object.entries(config.screens).map(([name, screenConfig]: [string, any]) => (
          <Tab.Screen
            key={name}
            name={name as string & keyof ParamList}
            component={screenConfig.component}
            options={screenConfig.options}
            initialParams={screenConfig.initialParams}
          />
        ))}
      </Tab.Navigator>
    );
  }

  return StaticTabNavigator;
}
