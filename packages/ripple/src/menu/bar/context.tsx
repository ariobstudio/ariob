/**
 * NodeBar Context
 *
 * React context for sharing NodeBar state across nested components.
 * Useful when action buttons are deeply nested within node renderers.
 *
 * Usage:
 * ```tsx
 * function ProfileCard({ node, userId }) {
 *   const bar = useNodeBar({ node, userId, degree: '1', variant: 'card' });
 *
 *   return (
 *     <NodeBarProvider bar={bar}>
 *       <ProfileHeader />
 *       <ProfileActions />
 *     </NodeBarProvider>
 *   );
 * }
 *
 * function ProfileActions() {
 *   const { primary, execute, loading } = useNodeBarContext();
 *   // render actions
 * }
 * ```
 */

import { createContext, useContext, type ReactNode } from 'react';
import type { NodeBarState } from './hook';

/**
 * Context for NodeBar state
 */
export const NodeBarContext = createContext<NodeBarState | null>(null);

/**
 * Hook to access NodeBar context
 *
 * Throws if used outside NodeBarProvider.
 */
export function useNodeBarContext(): NodeBarState {
  const ctx = useContext(NodeBarContext);
  if (!ctx) {
    throw new Error('useNodeBarContext must be used within NodeBarProvider');
  }
  return ctx;
}

/**
 * Safe version that returns null instead of throwing
 */
export function useNodeBarContextSafe(): NodeBarState | null {
  return useContext(NodeBarContext);
}

/**
 * Props for NodeBarProvider
 */
export interface NodeBarProviderProps {
  /** NodeBar state from useNodeBar() */
  bar: NodeBarState;
  /** Child components */
  children: ReactNode;
}

/**
 * Provider component for NodeBar context
 */
export function NodeBarProvider({ bar, children }: NodeBarProviderProps) {
  return <NodeBarContext.Provider value={bar}>{children}</NodeBarContext.Provider>;
}
