/**
 * Node System
 *
 * Modular content node system for Ripple.
 * Each content type is a "node" that can render in multiple view modes.
 *
 * @example
 * ```tsx
 * import { NodeProvider, useNodeRenderer, registerNodes } from '@ariob/ripple/nodes';
 *
 * // Register all node renderers
 * registerNodes([TextPostNode, VideoPostNode, ...]);
 *
 * // Wrap app with provider
 * function App() {
 *   return (
 *     <NodeProvider>
 *       <FeedScreen />
 *     </NodeProvider>
 *   );
 * }
 *
 * // Use in components
 * function FeedItem({ item }) {
 *   const { render } = useNodeRenderer();
 *   return render(item.type, 'preview', { data: item, nodeId: item.id });
 * }
 * ```
 */

// Types
export type {
  ViewMode,
  NodeType,
  NodeRenderer as NodeRendererType,
  NodeRenderProps,
  NodeMetadata,
  NodeRegistryEntry,
  NodeNavigationContext,
  UseNodeRendererResult,
} from './types';

// Registry
export {
  registerNode,
  registerNodes,
  getNodeRenderer,
  getNodeMetadata,
  isNodeRegistered,
  supportsImmersiveView,
  renderNode,
  getAllNodeTypes,
  getAllNodes,
  clearRegistry,
  getRegistrySize,
} from './registry';

// Context & Navigation
export { NodeProvider, useNodeNavigation, useViewMode, useCurrentNodeId } from './context';

// Hooks
export {
  useNodeRenderer,
  useNodeRendererForType,
  useNodeMetadata,
  useShouldOpenImmersive,
} from './hooks';
