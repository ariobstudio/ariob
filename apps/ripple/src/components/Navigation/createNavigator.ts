/**
 * Create Navigator
 *
 * Factory for creating navigator instances for standalone feature bundles.
 * Production-ready implementation using the shared navigation store.
 */

import {
  useNavigationStore,
  type FeatureName,
  type NavigationFrame,
} from './navigationStore';
import type { Navigator } from './useNavigator';

/**
 * Create a navigator instance for standalone feature bundles.
 *
 * This creates a real navigator that can be used in standalone mode
 * (when a bundle is loaded independently for development/testing).
 *
 * The navigator connects to the shared Zustand store, so navigation
 * actions will work correctly when the bundle is integrated into the app.
 *
 * @param feature - The feature this navigator belongs to
 * @returns Navigator instance
 *
 * @example
 * ```typescript
 * // In feature bundle root (e.g., src/thread/index.tsx)
 * export default function ThreadFeatureRoot() {
 *   const navigator = createNavigator('thread');
 *   return <ThreadFeature navigator={navigator} />;
 * }
 * ```
 */
export function createNavigator(feature: FeatureName): Navigator {
  'background only';

  // Initialize the store with this feature if empty
  const { stack, reset } = useNavigationStore.getState();
  if (stack.length === 0) {
    reset(feature);
    // Clear transition immediately since this is initialization
    useNavigationStore.getState().setIsTransitioning(false);
  }

  // Get current state
  const currentState = useNavigationStore.getState();

  // Create navigator object that reads from store
  const navigator: Navigator = {
    get current(): NavigationFrame {
      const state = useNavigationStore.getState();
      return (
        state.stack[state.stack.length - 1] || {
          feature,
          id: 'standalone-root',
          timestamp: Date.now(),
        }
      );
    },

    get stack(): NavigationFrame[] {
      return useNavigationStore.getState().stack;
    },

    get isTransitioning(): boolean {
      return useNavigationStore.getState().isTransitioning;
    },

    get canGoBack(): boolean {
      return useNavigationStore.getState().stack.length > 1;
    },

    navigate: (targetFeature: FeatureName, data?: any) => {
      'background only';
      useNavigationStore.getState().navigate(targetFeature, data);
    },

    goBack: () => {
      'background only';
      useNavigationStore.getState().goBack();
    },

    replace: (targetFeature: FeatureName, data?: any) => {
      'background only';
      useNavigationStore.getState().replace(targetFeature, data);
    },

    reset: (targetFeature: FeatureName, data?: any) => {
      'background only';
      useNavigationStore.getState().reset(targetFeature, data);
    },

    on: (listener) => {
      'background only';
      return useNavigationStore.getState().subscribe(listener);
    },
  };

  return navigator;
}
