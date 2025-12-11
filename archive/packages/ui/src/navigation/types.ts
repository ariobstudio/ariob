/**
 * Navigation Type Definitions
 *
 * Type-safe navigation system inspired by React Navigation,
 * adapted for Ariob/LynxJS patterns.
 */

// Use LynxJS types
type ReactNode = any;

// ============================================================================
// Core Navigation Types
// ============================================================================

/**
 * Base parameter list type
 * Maps route names to their parameter types
 * Keys must be strings for type safety
 */
export type ParamListBase = Record<string, object | undefined | void>;

/**
 * Default parameter list (no params for any route)
 */
export type DefaultParamList = Record<string, undefined>;

/**
 * Navigation state for a navigator
 */
export interface NavigationState<ParamList extends ParamListBase = ParamListBase> {
  /**
   * Type of navigator (stack, tab, drawer, etc.)
   */
  type: string;

  /**
   * Unique key for this navigation state
   */
  key: string;

  /**
   * Index of the current route
   */
  index: number;

  /**
   * Array of routes in the navigator
   */
  routes: Route<ParamList>[];

  /**
   * Whether this navigator is in transition
   */
  transitioning?: boolean;

  /**
   * Stale state (for async navigation)
   */
  stale?: boolean;
}

/**
 * A single route in the navigation state
 */
export interface Route<
  ParamList extends ParamListBase = ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList
> {
  /**
   * Unique key for this route
   */
  key: string;

  /**
   * Name of the route
   * Since ParamListBase keys are strings, this is always a string
   */
  name: RouteName & string;

  /**
   * Parameters for this route
   */
  params?: ParamList[RouteName];

  /**
   * Nested navigation state (if this route contains a navigator)
   */
  state?: NavigationState;
}

// ============================================================================
// Screen Component Props
// ============================================================================

/**
 * Props passed to screen components
 */
export interface ScreenProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList
> {
  /**
   * Navigation object for this screen
   */
  navigation: NavigationProp<ParamList, RouteName>;

  /**
   * Route object for this screen
   */
  route: RouteProp<ParamList, RouteName>;
}

/**
 * Stack screen props
 */
export type StackScreenProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList
> = {
  navigation: StackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

/**
 * Tab screen props
 */
export type TabScreenProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList
> = {
  navigation: TabNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

// ============================================================================
// Route Prop Type
// ============================================================================

/**
 * Route prop type for screens
 */
export type RouteProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList
> = Route<ParamList, RouteName> & {
  /**
   * Parameters for this route
   */
  params: ParamList[RouteName];
};

// ============================================================================
// Navigation Prop Types
// ============================================================================

/**
 * Base navigation prop
 */
export interface NavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList,
  NavigatorID extends string | undefined = string | undefined
> {
  /**
   * Navigate to a route
   */
  navigate<TargetRouteName extends keyof ParamList>(
    ...args: undefined extends ParamList[TargetRouteName]
      ? [screen: TargetRouteName] | [screen: TargetRouteName, params?: ParamList[TargetRouteName]]
      : [screen: TargetRouteName, params: ParamList[TargetRouteName]]
  ): void;

  /**
   * Go back to previous screen
   */
  goBack(): void;

  /**
   * Check if we can go back
   */
  canGoBack(): boolean;

  /**
   * Get current navigation state
   */
  getState(): NavigationState<ParamList>;

  /**
   * Get parent navigator (if exists)
   */
  getParent<T = NavigationProp<ParamListBase>>(): T | undefined;

  /**
   * Add navigation event listener
   */
  addListener(
    type: NavigationEventName,
    callback: (e: NavigationEvent) => void
  ): () => void;

  /**
   * Remove navigation event listener
   */
  removeListener(
    type: NavigationEventName,
    callback: (e: NavigationEvent) => void
  ): void;
}

/**
 * Stack navigation prop
 */
export interface StackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList
> extends NavigationProp<ParamList, RouteName> {
  /**
   * Push a new screen onto the stack
   */
  push<TargetRouteName extends keyof ParamList>(
    ...args: undefined extends ParamList[TargetRouteName]
      ? [screen: TargetRouteName] | [screen: TargetRouteName, params?: ParamList[TargetRouteName]]
      : [screen: TargetRouteName, params: ParamList[TargetRouteName]]
  ): void;

  /**
   * Pop N screens from the stack
   */
  pop(count?: number): void;

  /**
   * Pop to the top of the stack
   */
  popToTop(): void;

  /**
   * Replace the current screen
   */
  replace<TargetRouteName extends keyof ParamList>(
    ...args: undefined extends ParamList[TargetRouteName]
      ? [screen: TargetRouteName] | [screen: TargetRouteName, params?: ParamList[TargetRouteName]]
      : [screen: TargetRouteName, params: ParamList[TargetRouteName]]
  ): void;

  /**
   * Reset the navigation state
   */
  reset(state: Partial<NavigationState<ParamList>>): void;
}

/**
 * Tab navigation prop
 */
export interface TabNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList
> extends NavigationProp<ParamList, RouteName> {
  /**
   * Jump to a specific tab
   */
  jumpTo<TargetRouteName extends keyof ParamList>(
    ...args: undefined extends ParamList[TargetRouteName]
      ? [screen: TargetRouteName] | [screen: TargetRouteName, params?: ParamList[TargetRouteName]]
      : [screen: TargetRouteName, params: ParamList[TargetRouteName]]
  ): void;

  /**
   * Set tab badge
   */
  setTabBadge(badge?: number | string): void;
}

// ============================================================================
// Navigator Configuration Types
// ============================================================================

/**
 * Screen options for stack navigator
 */
export interface StackScreenOptions {
  /**
   * Screen title
   */
  title?: string;

  /**
   * Whether to show the header
   */
  headerShown?: boolean;

  /**
   * Header back button title
   */
  headerBackTitle?: string;

  /**
   * Header tint color
   */
  headerTintColor?: string;

  /**
   * Header background color
   */
  headerBackgroundColor?: string;

  /**
   * Custom header component
   */
  header?: () => ReactNode;

  /**
   * Animation type for transitions
   */
  animation?: 'default' | 'fade' | 'slide' | 'none';
}

/**
 * Screen options for tab navigator
 */
export interface TabScreenOptions {
  /**
   * Tab title
   */
  title?: string;

  /**
   * Tab bar icon (SF Symbol name)
   */
  tabBarIcon?: string;

  /**
   * Active tab bar icon (when selected)
   */
  tabBarActiveIcon?: string;

  /**
   * Tab bar badge
   */
  tabBarBadge?: number | string;

  /**
   * Custom tab bar label
   */
  tabBarLabel?: string | ((props: { focused: boolean }) => ReactNode);

  /**
   * Whether tab bar is visible for this screen
   */
  tabBarVisible?: boolean;

  /**
   * System tab bar item (iOS)
   * Uses built-in iOS tab bar items with standard styling
   */
  tabBarSystemItem?: 
    | 'bookmarks'
    | 'contacts'
    | 'downloads'
    | 'favorites'
    | 'featured'
    | 'history'
    | 'more'
    | 'mostRecent'
    | 'mostViewed'
    | 'recents'
    | 'search'
    | 'topRated';

  /**
   * Label visibility mode (Android)
   */
  tabBarLabelVisibilityMode?: 'auto' | 'selected' | 'labeled' | 'unlabeled';

  /**
   * Label styling
   */
  tabBarLabelStyle?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string | number;
    fontStyle?: 'normal' | 'italic';
  };

  /**
   * Badge styling
   */
  tabBarBadgeStyle?: {
    backgroundColor?: string;
    color?: string;
  };

  /**
   * Ripple color when pressing tab (Android)
   */
  tabBarRippleColor?: string;

  /**
   * Active indicator color (Android)
   */
  tabBarActiveIndicatorColor?: string;

  /**
   * Whether active indicator is enabled (Android)
   */
  tabBarActiveIndicatorEnabled?: boolean;

  /**
   * Active tint color
   */
  tabBarActiveTintColor?: string;

  /**
   * Inactive tint color (Android)
   */
  tabBarInactiveTintColor?: string;

  /**
   * Blur effect for tab bar (iOS 18 and below)
   */
  tabBarBlurEffect?:
    | 'none'
    | 'systemDefault'
    | 'extraLight'
    | 'light'
    | 'dark'
    | 'regular'
    | 'prominent'
    | 'systemUltraThinMaterial'
    | 'systemThinMaterial'
    | 'systemMaterial'
    | 'systemThickMaterial'
    | 'systemChromeMaterial'
    | 'systemUltraThinMaterialLight'
    | 'systemThinMaterialLight'
    | 'systemMaterialLight'
    | 'systemThickMaterialLight'
    | 'systemChromeMaterialLight'
    | 'systemUltraThinMaterialDark'
    | 'systemThinMaterialDark'
    | 'systemMaterialDark'
    | 'systemThickMaterialDark'
    | 'systemChromeMaterialDark';

  /**
   * Tab bar controller mode (iOS 18+)
   */
  tabBarControllerMode?: 'auto' | 'tabBar' | 'tabSidebar';

  /**
   * Tab bar minimize behavior (iOS 26+)
   */
  tabBarMinimizeBehavior?: 'auto' | 'never' | 'onScrollDown' | 'onScrollUp';

  /**
   * Tab bar style
   */
  tabBarStyle?: {
    backgroundColor?: string;
    shadowColor?: string;
  };

  /**
   * Whether this screen should render only after first access
   * @default true
   */
  lazy?: boolean;

  /**
   * Pop nested stack to top when navigating away from this tab
   * @default false
   */
  popToTopOnBlur?: boolean;

  /**
   * Accessibility label for tab
   */
  tabBarAccessibilityLabel?: string;

  /**
   * Test ID for tab
   */
  tabBarTestID?: string;

  /**
   * Header search bar options (iOS 26+ with search tab)
   */
  headerSearchBarOptions?: {
    placeholder?: string;
    hideWhenScrolling?: boolean;
    obscuresBackgroundDuringPresentation?: boolean;
  };
}

/**
 * Screen configuration
 */
export interface ScreenConfig<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList
> {
  /**
   * Screen name
   */
  name: RouteName;

  /**
   * Screen component
   */
  component: React.ComponentType<ScreenProps<ParamList, RouteName>>;

  /**
   * Initial parameters
   */
  initialParams?: ParamList[RouteName];

  /**
   * Screen options
   */
  options?: StackScreenOptions | TabScreenOptions;

  /**
   * Function to get screen options dynamically
   */
  getOptions?: (props: {
    route: RouteProp<ParamList, RouteName>;
    navigation: NavigationProp<ParamList, RouteName>;
  }) => StackScreenOptions | TabScreenOptions;
}

// ============================================================================
// Navigator Plugins
// ============================================================================

/**
 * Navigator plugin interface for extensibility
 */
export interface NavigatorPlugin {
  /**
   * Called when navigator mounts
   */
  onMount?: (navigator: { id: string; type: string }) => void;

  /**
   * Called on navigation action
   */
  onNavigate?: (action: { type: string; payload?: any }) => void;

  /**
   * Called when navigator unmounts
   */
  onUnmount?: (navigator: { id: string; type: string }) => void;
}

/**
 * Liquid glass effect options (iOS 26+)
 */
export interface LiquidGlassOptions {
  /**
   * Enable liquid glass effect
   */
  enabled?: boolean;

  /**
   * Blur intensity (0-1)
   */
  intensity?: number;

  /**
   * Tint color (#RRGGBB or #RRGGBBAA)
   */
  tintColor?: string;

  /**
   * Saturation level
   */
  saturation?: number;
}

/**
 * Navigator effects configuration
 */
export interface NavigatorEffects {
  /**
   * Liquid glass effect (iOS 26+)
   */
  liquidGlass?: LiquidGlassOptions;
}

// ============================================================================
// Navigator Props
// ============================================================================

/**
 * Stack navigator props
 */
export interface StackNavigatorProps<ParamList extends ParamListBase> {
  /**
   * Initial route name
   */
  initialRouteName?: keyof ParamList;

  /**
   * Screen definitions
   */
  screens?: Record<keyof ParamList, ScreenConfig<ParamList, keyof ParamList>>;

  /**
   * Children (Screen components)
   */
  children?: ReactNode;

  /**
   * Default screen options
   */
  screenOptions?: StackScreenOptions;

  /**
   * Visual effects configuration
   * @experimental
   */
  effects?: NavigatorEffects;

  /**
   * Navigator plugins for extensibility
   * @experimental
   */
  plugins?: NavigatorPlugin[];
}

/**
 * Tab navigator props
 */
export interface TabNavigatorProps<ParamList extends ParamListBase> {
  /**
   * Initial route name
   */
  initialRouteName?: keyof ParamList;

  /**
   * Screen definitions
   */
  screens?: Record<keyof ParamList, ScreenConfig<ParamList, keyof ParamList>>;

  /**
   * Children (Screen components)
   */
  children?: ReactNode;

  /**
   * Default screen options
   */
  screenOptions?: TabScreenOptions;

  /**
   * Tab bar position
   */
  tabBarPosition?: 'bottom' | 'top';

  /**
   * Tab bar style
   */
  tabBarStyle?: {
    tintColor?: string;
    backgroundColor?: string;
    hidden?: boolean;
    blurEffect?: TabScreenOptions['tabBarBlurEffect'];
    controllerMode?: TabScreenOptions['tabBarControllerMode'];
    minimizeBehavior?: TabScreenOptions['tabBarMinimizeBehavior'];
    labelVisibilityMode?: TabScreenOptions['tabBarLabelVisibilityMode'];
    rippleColor?: string;
    activeIndicatorColor?: string;
    activeIndicatorEnabled?: boolean;
  };

  /**
   * Back behavior when pressing back button
   */
  backBehavior?: 'firstRoute' | 'initialRoute' | 'order' | 'history' | 'fullHistory' | 'none';

  /**
   * Visual effects configuration
   * @experimental
   */
  effects?: NavigatorEffects;

  /**
   * Navigator plugins for extensibility
   * @experimental
   */
  plugins?: NavigatorPlugin[];
}

/**
 * Base screen component props (used internally)
 */
export interface ScreenComponentProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList
> {
  /**
   * Screen name
   */
  name: RouteName;

  /**
   * Screen component
   */
  component: React.ComponentType<ScreenProps<ParamList, RouteName>>;

  /**
   * Initial parameters
   */
  initialParams?: ParamList[RouteName];

  /**
   * Screen options
   */
  options?: StackScreenOptions | TabScreenOptions;

  /**
   * Function to get screen options dynamically
   */
  getOptions?: (props: {
    route: RouteProp<ParamList, RouteName>;
    navigation: NavigationProp<ParamList, RouteName>;
  }) => StackScreenOptions | TabScreenOptions;
}

/**
 * Stack screen component props
 */
export interface StackScreenComponentProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList
> {
  /**
   * Screen name
   */
  name: RouteName;

  /**
   * Screen component
   */
  component: React.ComponentType<StackScreenProps<ParamList, RouteName>>;

  /**
   * Initial parameters
   */
  initialParams?: ParamList[RouteName];

  /**
   * Screen options
   */
  options?: StackScreenOptions;

  /**
   * Function to get screen options dynamically
   */
  getOptions?: (props: {
    route: RouteProp<ParamList, RouteName>;
    navigation: StackNavigationProp<ParamList, RouteName>;
  }) => StackScreenOptions;
}

/**
 * Tab screen component props
 */
export interface TabScreenComponentProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList
> {
  /**
   * Screen name
   */
  name: RouteName;

  /**
   * Screen component
   */
  component: React.ComponentType<TabScreenProps<ParamList, RouteName>>;

  /**
   * Initial parameters
   */
  initialParams?: ParamList[RouteName];

  /**
   * Screen options
   */
  options?: TabScreenOptions;

  /**
   * Function to get screen options dynamically
   */
  getOptions?: (props: {
    route: RouteProp<ParamList, RouteName>;
    navigation: TabNavigationProp<ParamList, RouteName>;
  }) => TabScreenOptions;
}

// ============================================================================
// Navigation Events
// ============================================================================

/**
 * Navigation event names
 */
export type NavigationEventName =
  | 'focus'
  | 'blur'
  | 'beforeRemove'
  | 'state'
  | 'navigationchange'
  | 'tabchange'
  | 'transitionStart'
  | 'transitionEnd'
  | 'tabPress'
  | 'drawerOpen'
  | 'drawerClose';

/**
 * Navigation event
 */
export interface NavigationEvent {
  /**
   * Event type
   */
  type: NavigationEventName;

  /**
   * Target route key
   */
  target?: string;

  /**
   * Whether event can be prevented
   */
  canPreventDefault?: boolean;

  /**
   * Prevent default action
   */
  preventDefault?: () => void;

  /**
   * Event data
   */
  data?: any;
}

// ============================================================================
// Deep Linking Types
// ============================================================================

/**
 * Linking configuration
 */
export interface LinkingConfig<ParamList extends ParamListBase> {
  /**
   * Enable deep linking (default: true)
   */
  enabled?: boolean;

  /**
   * URL prefix (e.g., 'myapp://')
   */
  prefixes?: string[];

  /**
   * Route configuration
   */
  config?: {
    screens: {
      [K in keyof ParamList]?: string | PathConfig<ParamList[K]>;
    };
  };

  /**
   * Custom URL getter
   */
  getInitialURL?: () => Promise<string | null>;

  /**
   * Custom URL subscriber
   */
  subscribe?: (listener: (url: string) => void) => () => void;
}

/**
 * Path configuration for a route
 */
export interface PathConfig<Params> {
  /**
   * Path pattern (e.g., 'user/:id')
   */
  path?: string;

  /**
   * Exact match
   */
  exact?: boolean;

  /**
   * Parse function
   */
  parse?: {
    [K in keyof Params]?: (value: string) => any;
  };

  /**
   * Stringify function
   */
  stringify?: {
    [K in keyof Params]?: (value: any) => string;
  };

  /**
   * Nested screens
   */
  screens?: any;
}

// ============================================================================
// Navigation Container Types
// ============================================================================

/**
 * Navigation container props
 */
export interface NavigationContainerProps {
  /**
   * Root navigator
   */
  children: ReactNode;

  /**
   * Linking configuration
   */
  linking?: LinkingConfig<any>;

  /**
   * Fallback component while linking is being resolved
   */
  fallback?: ReactNode;

  /**
   * Theme
   */
  theme?: NavigationTheme;

  /**
   * Document title (for web)
   */
  documentTitle?: {
    enabled?: boolean;
    formatter?: (options: any) => string;
  };

  /**
   * Callback when state changes
   */
  onStateChange?: (state: NavigationState | undefined) => void;

  /**
   * Callback when ready
   */
  onReady?: () => void;
}

/**
 * Navigation theme
 */
export interface NavigationTheme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract route names from param list
 */
export type RouteNames<ParamList extends ParamListBase> = Extract<keyof ParamList, string>;

/**
 * Extract params for a route
 */
export type RouteParams<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList
> = ParamList[RouteName];
