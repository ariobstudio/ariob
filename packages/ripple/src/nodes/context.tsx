/**
 * Node Navigation Context
 *
 * React context for managing node view navigation and state.
 * Provides navigation between preview/full/immersive views.
 */

import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { ViewMode, NodeNavigationContext } from './types';

/**
 * Navigation state
 */
interface NavigationState {
  /** Current view mode */
  mode: ViewMode;
  /** ID of currently viewed node */
  nodeId?: string;
  /** Navigation history stack */
  history: Array<{ mode: ViewMode; nodeId?: string }>;
}

/**
 * Context value type
 */
interface NodeContextValue extends NodeNavigationContext {
  /** Full navigation state */
  state: NavigationState;
  /** Reset navigation to initial state */
  reset: () => void;
}

/**
 * Initial navigation state
 */
const initialState: NavigationState = {
  mode: 'preview',
  nodeId: undefined,
  history: [],
};

/**
 * Node context
 */
const NodeContext = createContext<NodeContextValue | null>(null);

/**
 * Node provider props
 */
interface NodeProviderProps {
  children: ReactNode;
  /** Initial view mode */
  initialMode?: ViewMode;
  /** Callback when navigation changes */
  onNavigationChange?: (mode: ViewMode, nodeId?: string) => void;
}

/**
 * Node Provider
 *
 * Provides node navigation context to the app.
 *
 * @example
 * ```tsx
 * <NodeProvider>
 *   <App />
 * </NodeProvider>
 * ```
 */
export function NodeProvider({
  children,
  initialMode = 'preview',
  onNavigationChange,
}: NodeProviderProps) {
  const [state, setState] = useState<NavigationState>({
    ...initialState,
    mode: initialMode,
  });

  /**
   * Navigate to a specific view mode for a node
   */
  const navigate = useCallback(
    (mode: ViewMode, nodeId: string) => {
      setState((prev) => ({
        mode,
        nodeId,
        history: [...prev.history, { mode: prev.mode, nodeId: prev.nodeId }],
      }));

      // Notify callback
      onNavigationChange?.(mode, nodeId);
    },
    [onNavigationChange]
  );

  /**
   * Go back to previous view
   */
  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.history.length === 0) {
        // No history, reset to preview mode
        return { ...initialState, mode: 'preview' };
      }

      // Pop last item from history
      const newHistory = [...prev.history];
      const previous = newHistory.pop()!;

      return {
        mode: previous.mode,
        nodeId: previous.nodeId,
        history: newHistory,
      };
    });
  }, []);

  /**
   * Reset navigation to initial state
   */
  const reset = useCallback(() => {
    setState({ ...initialState, mode: initialMode });
  }, [initialMode]);

  /**
   * Context value
   */
  const value = useMemo<NodeContextValue>(
    () => ({
      mode: state.mode,
      navigate,
      goBack,
      currentNodeId: state.nodeId,
      state,
      reset,
    }),
    [state, navigate, goBack, reset]
  );

  return <NodeContext.Provider value={value}>{children}</NodeContext.Provider>;
}

/**
 * Hook to access node navigation context
 *
 * @returns Node navigation context
 * @throws Error if used outside NodeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { navigate, mode, goBack } = useNodeNavigation();
 *
 *   return (
 *     <button onClick={() => navigate('full', 'post-123')}>
 *       View Post
 *     </button>
 *   );
 * }
 * ```
 */
export function useNodeNavigation(): NodeContextValue {
  const context = useContext(NodeContext);

  if (!context) {
    throw new Error('useNodeNavigation must be used within a NodeProvider');
  }

  return context;
}

/**
 * Hook to check current view mode
 *
 * @returns Current view mode
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const mode = useViewMode();
 *   const isPreview = mode === 'preview';
 *   // ...
 * }
 * ```
 */
export function useViewMode(): ViewMode {
  const { mode } = useNodeNavigation();
  return mode;
}

/**
 * Hook to get current node ID
 *
 * @returns Current node ID or undefined
 */
export function useCurrentNodeId(): string | undefined {
  const { currentNodeId } = useNodeNavigation();
  return currentNodeId;
}
