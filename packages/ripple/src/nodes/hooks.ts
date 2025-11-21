/**
 * Node System Hooks
 *
 * React hooks for working with the node renderer system.
 */

import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { NodeType, ViewMode, NodeRenderProps, NodeMetadata, UseNodeRendererResult } from './types';
import {
  getNodeRenderer,
  getNodeMetadata,
  isNodeRegistered,
  supportsImmersiveView,
  renderNode,
} from './registry';

/**
 * Hook to access node renderer functionality
 *
 * Provides functions to render nodes, get metadata, and check capabilities.
 *
 * @returns Node renderer utilities
 *
 * @example
 * ```tsx
 * function FeedItem({ item }) {
 *   const { render, supportsImmersive } = useNodeRenderer();
 *
 *   return (
 *     <View>
 *       {render(item.type, 'preview', { data: item, nodeId: item.id })}
 *       {supportsImmersive(item.type) && (
 *         <Button>View Full Screen</Button>
 *       )}
 *     </View>
 *   );
 * }
 * ```
 */
export function useNodeRenderer(): UseNodeRendererResult {
  /**
   * Render a node in the specified view mode
   */
  const render = useCallback(
    (nodeType: NodeType, viewMode: ViewMode, props: NodeRenderProps): ReactNode => {
      return renderNode(nodeType, viewMode, props);
    },
    []
  );

  /**
   * Get metadata for a node type
   */
  const getMetadata = useCallback((nodeType: NodeType): NodeMetadata | undefined => {
    return getNodeMetadata(nodeType);
  }, []);

  /**
   * Check if a node type is registered
   */
  const isRegistered = useCallback((nodeType: NodeType): boolean => {
    return isNodeRegistered(nodeType);
  }, []);

  /**
   * Check if a node type supports immersive view
   */
  const supportsImmersive = useCallback((nodeType: NodeType): boolean => {
    return supportsImmersiveView(nodeType);
  }, []);

  return useMemo(
    () => ({
      render,
      getMetadata,
      isRegistered,
      supportsImmersive,
    }),
    [render, getMetadata, isRegistered, supportsImmersive]
  );
}

/**
 * Hook to get renderer for a specific node type
 *
 * @param nodeType - Node type
 * @returns Renderer functions or undefined
 *
 * @example
 * ```tsx
 * function PostComponent({ data }) {
 *   const renderer = useNodeRendererForType('post');
 *
 *   if (!renderer) {
 *     return <Text>Unknown post type</Text>;
 *   }
 *
 *   return renderer.preview({ data, nodeId: data.id });
 * }
 * ```
 */
export function useNodeRendererForType(nodeType: NodeType) {
  return useMemo(() => getNodeRenderer(nodeType), [nodeType]);
}

/**
 * Hook to get metadata for a specific node type
 *
 * @param nodeType - Node type
 * @returns Node metadata or undefined
 */
export function useNodeMetadata(nodeType: NodeType): NodeMetadata | undefined {
  return useMemo(() => getNodeMetadata(nodeType), [nodeType]);
}

/**
 * Hook to check if a node should open in immersive view by default
 *
 * @param nodeType - Node type
 * @returns True if should open in immersive view
 */
export function useShouldOpenImmersive(nodeType: NodeType): boolean {
  const metadata = useNodeMetadata(nodeType);
  return metadata?.defaultView === 'immersive' && (metadata?.supportsImmersive ?? false);
}
