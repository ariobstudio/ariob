/**
 * Navigation Store (Zustand)
 *
 * Centralized navigation state management with event system.
 * Follows LynxJS IFR patterns for optimal performance.
 */

import { create } from 'zustand';

/**
 * Feature names (in-app features)
 */
export type FeatureName = 'welcome' | 'lobby' | 'game' | 'settings' | 'variantSelector';

/**
 * Navigation event types
 */
export type NavigationEvent = 'navigate' | 'back' | 'replace' | 'reset';

/**
 * Navigation frame
 */
export interface NavigationFrame {
  /** Feature to load */
  feature: FeatureName;
  /** Optional data to pass to feature */
  data?: any;
  /** Unique ID for this navigation instance */
  id: string;
  /** Timestamp when frame was created */
  timestamp: number;
}

/**
 * Navigation event payload
 */
export interface NavigationEventPayload {
  /** Event type */
  type: NavigationEvent;
  /** Previous frame (if any) */
  from?: NavigationFrame;
  /** Target frame */
  to: NavigationFrame;
  /** Current stack after event */
  stack: NavigationFrame[];
}

/**
 * Navigation event listener
 */
export type NavigationListener = (event: NavigationEventPayload) => void;

/**
 * Navigation store state
 */
interface NavigationState {
  /** Navigation history stack */
  stack: NavigationFrame[];
  /** Transition state */
  isTransitioning: boolean;
  /** Event listeners */
  listeners: Set<NavigationListener>;
}

/**
 * Navigation store actions
 */
interface NavigationActions {
  /** Navigate to a new feature */
  navigate: (feature: FeatureName, data?: any) => void;
  /** Go back to previous frame */
  goBack: () => void;
  /** Replace current frame */
  replace: (feature: FeatureName, data?: any) => void;
  /** Reset navigation to root */
  reset: (feature: FeatureName, data?: any) => void;
  /** Subscribe to navigation events */
  subscribe: (listener: NavigationListener) => () => void;
  /** Set transition state */
  setIsTransitioning: (isTransitioning: boolean) => void;
}

/**
 * Generate unique frame ID
 */
function generateFrameId(): string {
  'background only';
  return `frame-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create a new navigation frame
 */
function createFrame(feature: FeatureName, data?: any): NavigationFrame {
  'background only';
  return {
    feature,
    data,
    id: generateFrameId(),
    timestamp: Date.now(),
  };
}

/**
 * Emit navigation event to all listeners
 */
function emitEvent(
  listeners: Set<NavigationListener>,
  event: NavigationEventPayload
): void {
  'background only';
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (err) {
      console.error('[NavigationStore] Error in event listener:', err);
    }
  });
}

/**
 * Navigation store with Zustand
 *
 * Manages navigation stack, transitions, and events.
 * All navigation actions run on background thread.
 */
export const useNavigationStore = create<NavigationState & NavigationActions>(
  (set, get) => ({
    // Initial state
    stack: [],
    isTransitioning: false,
    listeners: new Set(),

    // Navigate to new feature (push to stack)
    navigate: (feature: FeatureName, data?: any) => {
      'background only';

      const newFrame = createFrame(feature, data);
      const { stack, listeners } = get();

      set({
        stack: [...stack, newFrame],
        isTransitioning: true,
      });

      // Emit event
      emitEvent(listeners, {
        type: 'navigate',
        from: stack[stack.length - 1],
        to: newFrame,
        stack: [...stack, newFrame],
      });

      console.log('[NavigationStore] Navigated to:', feature, data);

      // Reset transition after animation
      setTimeout(() => {
        set({ isTransitioning: false });
      }, 300);
    },

    // Go back (pop from stack)
    goBack: () => {
      'background only';

      const { stack, listeners } = get();

      if (stack.length <= 1) {
        console.warn('[NavigationStore] Cannot go back from root');
        return;
      }

      const newStack = stack.slice(0, -1);
      const from = stack[stack.length - 1];
      const to = newStack[newStack.length - 1];

      set({
        stack: newStack,
        isTransitioning: true,
      });

      // Emit event
      emitEvent(listeners, {
        type: 'back',
        from,
        to,
        stack: newStack,
      });

      console.log('[NavigationStore] Went back to:', to.feature);

      // Reset transition after animation
      setTimeout(() => {
        set({ isTransitioning: false });
      }, 300);
    },

    // Replace current frame
    replace: (feature: FeatureName, data?: any) => {
      'background only';

      const newFrame = createFrame(feature, data);
      const { stack, listeners } = get();

      if (stack.length === 0) {
        console.warn('[NavigationStore] Cannot replace empty stack');
        return;
      }

      const newStack = [...stack.slice(0, -1), newFrame];

      set({
        stack: newStack,
        isTransitioning: true,
      });

      // Emit event
      emitEvent(listeners, {
        type: 'replace',
        from: stack[stack.length - 1],
        to: newFrame,
        stack: newStack,
      });

      console.log('[NavigationStore] Replaced with:', feature, data);

      // Reset transition after animation
      setTimeout(() => {
        set({ isTransitioning: false });
      }, 300);
    },

    // Reset to root
    reset: (feature: FeatureName, data?: any) => {
      'background only';

      const newFrame = createFrame(feature, data);
      const newStack = [newFrame];
      const { stack, listeners } = get();

      set({
        stack: newStack,
        isTransitioning: true,
      });

      // Emit event
      emitEvent(listeners, {
        type: 'reset',
        from: stack[stack.length - 1],
        to: newFrame,
        stack: newStack,
      });

      console.log('[NavigationStore] Reset to:', feature, data);

      // Reset transition after animation
      setTimeout(() => {
        set({ isTransitioning: false });
      }, 300);
    },

    // Subscribe to navigation events
    subscribe: (listener: NavigationListener) => {
      'background only';

      const { listeners } = get();
      listeners.add(listener);

      // Return unsubscribe function
      return () => {
        listeners.delete(listener);
      };
    },

    // Set transition state
    setIsTransitioning: (isTransitioning: boolean) => {
      'background only';
      set({ isTransitioning });
    },
  })
);

/**
 * Initialize navigation store with initial feature
 */
export function initializeNavigation(initialFeature: FeatureName): void {
  'background only';

  const { stack, reset } = useNavigationStore.getState();

  // Only initialize if stack is empty
  if (stack.length === 0) {
    console.log('[NavigationStore] Initializing with:', initialFeature);
    reset(initialFeature);
    // Clear transition immediately since this is initialization
    useNavigationStore.getState().setIsTransitioning(false);
  }
}
