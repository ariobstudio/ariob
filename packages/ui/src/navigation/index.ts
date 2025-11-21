/**
 * Ariob Navigation System
 *
 * Type-safe navigation for Ariob apps inspired by React Navigation
 * Now powered by TanStack Router with ExplorerModule integration
 */

// Legacy exports for backward compatibility
export { createStackNavigator } from './Stack';
export { createTabNavigator, createNativeBottomTabNavigator } from './Tabs';
export { NavigationContainer } from './NavigationContainer';
export { Link } from './Link';
export type { LinkProps } from './Link';

// New TanStack Router based navigation
export * from './router';

// Actions
export { CommonActions, StackActions, TabActions, DrawerActions } from './actions';

// Hooks
export {
  useNavigation,
  useRoute,
  useFocusEffect,
  useIsFocused,
  useNavigationState,
  useNavigationBuilder,
  useScrollToTop,
  useLinkTo,
  useLinkProps,
  useLinkBuilder,
  usePreventRemove,
} from './hooks';

// Store
export { useNavigationStore, createNavigationState, generateRouteKey } from './navigationStore';

// Persistence & Linking
export {
  getStateFromPath,
  getPathFromState,
  validateState,
  serializeState,
  deserializeState,
} from './persistence';

// Tracking & Analytics
export {
  useNavigationTracking,
  createScreenTracker,
  useRouteTimingTracker,
} from './tracking';
export type { ScreenTrackingOptions } from './tracking';

// Types
export type {
  // Core types
  ParamListBase,
  DefaultParamList,
  NavigationState,
  Route,

  // Screen types
  ScreenProps,
  StackScreenProps,
  TabScreenProps,

  // Route prop
  RouteProp,

  // Navigation props
  NavigationProp,
  StackNavigationProp,
  TabNavigationProp,

  // Options
  StackScreenOptions,
  TabScreenOptions,
  ScreenConfig,

  // Navigator props
  StackNavigatorProps,
  TabNavigatorProps,
  ScreenComponentProps,

  // Events
  NavigationEventName,
  NavigationEvent,

  // Deep linking
  LinkingConfig,
  PathConfig,

  // Container
  NavigationContainerProps,
  NavigationTheme,

  // Plugins & Effects
  NavigatorPlugin,
  NavigatorEffects,

  // Utilities
  RouteNames,
  RouteParams,
} from './types';

// Re-export commonly used patterns
export type { NavigationAction, NavigationListener, NavigatorType } from './navigationStore';
