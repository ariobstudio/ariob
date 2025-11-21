/**
 * Node Registry
 *
 * Central registry for all content node types and their renderers.
 * Provides functions to register, retrieve, and render nodes.
 */

import type {
  NodeType,
  NodeRegistry,
  NodeRegistryEntry,
  NodeRenderer,
  NodeMetadata,
  NodeRenderProps,
  ViewMode,
} from './types';

/**
 * Global node registry
 *
 * Stores all registered node renderers.
 */
const registry: NodeRegistry = new Map();

/**
 * Register a node type with its renderer and metadata
 *
 * @param entry - Node registry entry
 *
 * @example
 * ```typescript
 * registerNode({
 *   type: 'post',
 *   renderer: TextPostRenderer,
 *   metadata: {
 *     supportsImmersive: false,
 *     defaultView: 'full',
 *     displayName: 'Text Post',
 *   }
 * });
 * ```
 */
export function registerNode<T>(entry: NodeRegistryEntry<T>): void {
  if (registry.has(entry.type)) {
    console.warn(`Node type "${entry.type}" is already registered. Overwriting.`);
  }

  registry.set(entry.type, entry as NodeRegistryEntry);
}

/**
 * Register multiple nodes at once
 *
 * @param entries - Array of registry entries
 */
export function registerNodes(entries: NodeRegistryEntry[]): void {
  entries.forEach(registerNode);
}

/**
 * Get a registered node renderer
 *
 * @param type - Node type
 * @returns Node renderer or undefined if not registered
 */
export function getNodeRenderer(type: NodeType): NodeRenderer | undefined {
  const entry = registry.get(type);
  return entry?.renderer;
}

/**
 * Get node metadata
 *
 * @param type - Node type
 * @returns Node metadata or undefined if not registered
 */
export function getNodeMetadata(type: NodeType): NodeMetadata | undefined {
  const entry = registry.get(type);
  return entry?.metadata;
}

/**
 * Check if a node type is registered
 *
 * @param type - Node type
 * @returns True if registered
 */
export function isNodeRegistered(type: NodeType): boolean {
  return registry.has(type);
}

/**
 * Check if a node type supports immersive view
 *
 * @param type - Node type
 * @returns True if supports immersive view
 */
export function supportsImmersiveView(type: NodeType): boolean {
  const metadata = getNodeMetadata(type);
  return metadata?.supportsImmersive ?? false;
}

/**
 * Render a node in a specific view mode
 *
 * @param type - Node type
 * @param mode - View mode
 * @param props - Render props
 * @returns React node or null if not registered or mode not supported
 */
export function renderNode(
  type: NodeType,
  mode: ViewMode,
  props: NodeRenderProps
): React.ReactNode {
  const renderer = getNodeRenderer(type);

  if (!renderer) {
    console.warn(`No renderer registered for node type: ${type}`);
    return null;
  }

  // Get the appropriate render function for the mode
  const renderFn = renderer[mode];

  if (!renderFn) {
    console.warn(`Node type "${type}" does not support view mode: ${mode}`);
    // Fallback: try full view, then preview
    if (mode === 'immersive' && renderer.full) {
      return renderer.full(props);
    }
    if (renderer.preview) {
      return renderer.preview(props);
    }
    return null;
  }

  return renderFn(props);
}

/**
 * Get all registered node types
 *
 * @returns Array of registered node types
 */
export function getAllNodeTypes(): NodeType[] {
  return Array.from(registry.keys());
}

/**
 * Get all registry entries
 *
 * @returns Array of all entries
 */
export function getAllNodes(): NodeRegistryEntry[] {
  return Array.from(registry.values());
}

/**
 * Clear the registry (useful for testing)
 */
export function clearRegistry(): void {
  registry.clear();
}

/**
 * Get registry size
 *
 * @returns Number of registered nodes
 */
export function getRegistrySize(): number {
  return registry.size;
}
