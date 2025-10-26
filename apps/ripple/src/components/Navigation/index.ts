/**
 * Navigation Components
 *
 * Frame-based navigation system for multi-bundle architecture.
 * Uses Zustand for state management with LynxJS IFR patterns.
 */

export {
  useNavigator,
  type Navigator,
  type FeatureName,
  type NavigationFrame,
  type NavigationEvent,
  type NavigationEventPayload,
  type NavigationListener,
} from './useNavigator';
export { Navigator as NavigatorContainer, type NavigatorProps } from './Navigator';
export { createNavigator } from './createNavigator';
export { useNavigationStore, initializeNavigation } from './navigationStore';
