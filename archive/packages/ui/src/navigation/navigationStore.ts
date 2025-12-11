/**
 * Navigation State Management
 *
 * Centralized navigation state using Zustand
 */

import { create } from 'zustand';
import type {
  NavigationState,
  ParamListBase,
  Route,
  NavigationEvent,
  NavigationEventName,
} from './types';

// ============================================================================
// Types
// ============================================================================

/**
 * Navigation action
 */
export type NavigationAction =
  | { type: 'NAVIGATE'; payload: { name: string; params?: any } }
  | { type: 'PUSH'; payload: { name: string; params?: any } }
  | { type: 'POP'; payload: { count?: number } }
  | { type: 'POP_TO_TOP' }
  | { type: 'GO_BACK' }
  | { type: 'REPLACE'; payload: { name: string; params?: any } }
  | { type: 'RESET'; payload: { state: Partial<NavigationState> } }
  | { type: 'JUMP_TO'; payload: { name: string; params?: any } }
  | { type: 'SET_PARAMS'; payload: { params: any } }
  | { type: 'UPDATE_STATE'; payload: { state: NavigationState } };

/**
 * Event listener
 */
export type NavigationListener = (event: NavigationEvent) => void;

/**
 * Navigator type
 */
export type NavigatorType = 'stack' | 'tab' | 'drawer';

/**
 * Navigator registry
 */
export interface NavigatorConfig {
  id: string;
  type: NavigatorType;
  initialRouteName?: string;
  routes: Map<string, Route>;
  state: NavigationState;
}

// ============================================================================
// Store Interface
// ============================================================================

interface NavigationStore {
  /**
   * Registered navigators
   */
  navigators: Map<string, NavigatorConfig>;

  /**
   * Current active navigator ID
   */
  activeNavigatorId: string | null;

  /**
   * Event listeners
   */
  listeners: Map<string, Set<NavigationListener>>;

  /**
   * Whether navigation is transitioning
   */
  isTransitioning: boolean;

  // Actions

  /**
   * Register a navigator
   */
  registerNavigator: (config: NavigatorConfig) => void;

  /**
   * Unregister a navigator
   */
  unregisterNavigator: (id: string) => void;

  /**
   * Get navigator by ID
   */
  getNavigator: (id: string) => NavigatorConfig | undefined;

  /**
   * Get active navigator
   */
  getActiveNavigator: () => NavigatorConfig | undefined;

  /**
   * Set active navigator
   */
  setActiveNavigator: (id: string) => void;

  /**
   * Dispatch navigation action
   */
  dispatch: (navigatorId: string, action: NavigationAction) => void;

  /**
   * Update navigation state
   */
  updateState: (navigatorId: string, state: NavigationState) => void;

  /**
   * Add event listener
   */
  addListener: (
    navigatorId: string,
    type: NavigationEventName,
    listener: NavigationListener
  ) => () => void;

  /**
   * Remove event listener
   */
  removeListener: (
    navigatorId: string,
    type: NavigationEventName,
    listener: NavigationListener
  ) => void;

  /**
   * Emit event
   */
  emitEvent: (navigatorId: string, event: NavigationEvent) => void;

  /**
   * Reset store
   */
  reset: () => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  navigators: new Map(),
  activeNavigatorId: null,
  listeners: new Map(),
  isTransitioning: false,

  registerNavigator: (config) => {
    set((state) => {
      const navigators = new Map(state.navigators);
      navigators.set(config.id, config);

      return {
        navigators,
        activeNavigatorId: state.activeNavigatorId || config.id,
      };
    });
  },

  unregisterNavigator: (id) => {
    set((state) => {
      const navigators = new Map(state.navigators);
      navigators.delete(id);

      const listeners = new Map(state.listeners);
      listeners.delete(id);

      return {
        navigators,
        listeners,
        activeNavigatorId:
          state.activeNavigatorId === id
            ? navigators.keys().next().value || null
            : state.activeNavigatorId,
      };
    });
  },

  getNavigator: (id) => {
    return get().navigators.get(id);
  },

  getActiveNavigator: () => {
    const { activeNavigatorId, navigators } = get();
    if (!activeNavigatorId) return undefined;
    return navigators.get(activeNavigatorId);
  },

  setActiveNavigator: (id) => {
    set({ activeNavigatorId: id });
  },

  dispatch: (navigatorId, action) => {
    const navigator = get().getNavigator(navigatorId);
    if (!navigator) return;

    set({ isTransitioning: true });

    try {
      const newState = navigationReducer(navigator.state, action, navigator);

      get().updateState(navigatorId, newState);

      // Emit state change event
      get().emitEvent(navigatorId, {
        type: 'state',
        data: { state: newState, action },
      });
    } finally {
      set({ isTransitioning: false });
    }
  },

  updateState: (navigatorId, state) => {
    set((store) => {
      const navigators = new Map(store.navigators);
      const navigator = navigators.get(navigatorId);

      if (navigator) {
        navigators.set(navigatorId, {
          ...navigator,
          state,
        });
      }

      return { navigators };
    });
  },

  addListener: (navigatorId, type, listener) => {
    set((state) => {
      const listeners = new Map(state.listeners);
      const key = `${navigatorId}:${type}`;

      if (!listeners.has(key)) {
        listeners.set(key, new Set());
      }

      listeners.get(key)!.add(listener);

      return { listeners };
    });

    // Return cleanup function
    return () => {
      get().removeListener(navigatorId, type, listener);
    };
  },

  removeListener: (navigatorId, type, listener) => {
    set((state) => {
      const listeners = new Map(state.listeners);
      const key = `${navigatorId}:${type}`;
      const listenerSet = listeners.get(key);

      if (listenerSet) {
        listenerSet.delete(listener);
        if (listenerSet.size === 0) {
          listeners.delete(key);
        }
      }

      return { listeners };
    });
  },

  emitEvent: (navigatorId, event) => {
    const { listeners } = get();
    const key = `${navigatorId}:${event.type}`;
    const listenerSet = listeners.get(key);

    if (listenerSet) {
      listenerSet.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in navigation event listener:', error);
        }
      });
    }
  },

  reset: () => {
    set({
      navigators: new Map(),
      activeNavigatorId: null,
      listeners: new Map(),
      isTransitioning: false,
    });
  },
}));

// ============================================================================
// Navigation Reducer
// ============================================================================

/**
 * Reduce navigation actions into state updates
 */
function navigationReducer(
  state: NavigationState,
  action: NavigationAction,
  navigator: NavigatorConfig
): NavigationState {
  switch (action.type) {
    case 'NAVIGATE':
    case 'PUSH': {
      const { name, params } = action.payload;

      // Find or create route
      const existingRoute = state.routes.find((r) => r.name === name);

      const newRoute: Route = existingRoute
        ? { ...existingRoute, params }
        : {
            key: `${name}-${Date.now()}`,
            name,
            params,
          };

      if (navigator.type === 'stack') {
        // Stack: push route onto stack
        return {
          ...state,
          index: state.routes.length,
          routes: [...state.routes, newRoute],
        };
      } else {
        // Tab/other: navigate to route (replace params if exists)
        const routeIndex = state.routes.findIndex((r) => r.name === name);
        if (routeIndex >= 0) {
          const routes = [...state.routes];
          routes[routeIndex] = newRoute;
          return {
            ...state,
            index: routeIndex,
            routes,
          };
        } else {
          // Add new route
          return {
            ...state,
            index: state.routes.length,
            routes: [...state.routes, newRoute],
          };
        }
      }
    }

    case 'POP': {
      if (navigator.type !== 'stack') return state;

      const count = action.payload.count || 1;
      const newRoutes = state.routes.slice(0, -count);

      if (newRoutes.length === 0) {
        // Can't pop last route
        return state;
      }

      return {
        ...state,
        index: newRoutes.length - 1,
        routes: newRoutes,
      };
    }

    case 'POP_TO_TOP': {
      if (navigator.type !== 'stack') return state;

      return {
        ...state,
        index: 0,
        routes: state.routes.slice(0, 1),
      };
    }

    case 'GO_BACK': {
      if (state.index > 0) {
        return {
          ...state,
          index: state.index - 1,
        };
      }
      return state;
    }

    case 'REPLACE': {
      const { name, params } = action.payload;

      const newRoute: Route = {
        key: `${name}-${Date.now()}`,
        name,
        params,
      };

      const routes = [...state.routes];
      routes[state.index] = newRoute;

      return {
        ...state,
        routes,
      };
    }

    case 'RESET': {
      return {
        ...state,
        ...action.payload.state,
      };
    }

    case 'JUMP_TO': {
      const { name } = action.payload;
      const routeIndex = state.routes.findIndex((r) => r.name === name);

      if (routeIndex >= 0) {
        return {
          ...state,
          index: routeIndex,
        };
      }

      return state;
    }

    case 'SET_PARAMS': {
      const routes = [...state.routes];
      const currentRoute = routes[state.index];

      if (currentRoute) {
        routes[state.index] = {
          ...currentRoute,
          params: {
            ...currentRoute.params,
            ...action.payload.params,
          },
        };
      }

      return {
        ...state,
        routes,
      };
    }

    case 'UPDATE_STATE': {
      return action.payload.state;
    }

    default:
      return state;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate unique key for a route
 */
export function generateRouteKey(name: string): string {
  return `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create initial navigation state
 */
export function createNavigationState<ParamList extends ParamListBase>(
  type: NavigatorType,
  routes: Route<ParamList>[],
  initialIndex: number = 0
): NavigationState<ParamList> {
  return {
    type,
    key: `navigator-${Date.now()}`,
    index: initialIndex,
    routes,
    transitioning: false,
    stale: false,
  };
}
