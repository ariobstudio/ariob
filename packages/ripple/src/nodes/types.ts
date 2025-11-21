/**
 * Node System Types
 *
 * Type definitions for the modular content node system.
 * Each content type (post, video, message, etc.) is a "node" that can render
 * in multiple view modes.
 *
 * Terminology aligns with Gun.js graph concepts where everything is a node.
 */

import type { ReactNode } from 'react';
import type { FeedItem } from '../schemas';

/**
 * View modes for content nodes
 *
 * - preview: Compact view shown in feed/list (thumbnail, summary)
 * - full: Detailed view with all content and interactions
 * - immersive: Specialized full-screen view (TikTok video, chat, etc.)
 */
export type ViewMode = 'preview' | 'full' | 'immersive';

/**
 * Navigation context for view transitions
 */
export interface NodeNavigationContext {
  /** Current view mode */
  mode: ViewMode;
  /** Navigate to a specific view mode */
  navigate: (mode: ViewMode, nodeId: string) => void;
  /** Go back to previous view */
  goBack: () => void;
  /** Current node being viewed */
  currentNodeId?: string;
}

/**
 * Props passed to node renderer functions
 */
export interface NodeRenderProps<T = FeedItem> {
  /** The content data */
  data: T;
  /** Node ID */
  nodeId: string;
  /** Navigation context */
  navigation?: NodeNavigationContext;
  /** Callback when node is pressed/tapped */
  onPress?: () => void;
  /** Additional props for specific renderers */
  [key: string]: any;
}

/**
 * Node renderer definition
 *
 * Each content type has a renderer that defines how to display
 * the content in each view mode.
 */
export interface NodeRenderer<T = FeedItem> {
  /** Render in preview mode (feed/list view) */
  preview: (props: NodeRenderProps<T>) => ReactNode;

  /** Render in full mode (detail view with interactions) */
  full: (props: NodeRenderProps<T>) => ReactNode;

  /** Optional: Render in immersive mode (specialized full-screen view) */
  immersive?: (props: NodeRenderProps<T>) => ReactNode;
}

/**
 * Node type identifier
 *
 * Maps to the content type from schemas.
 */
export type NodeType =
  | 'post'
  | 'image-post'
  | 'video-post'
  | 'poll'
  | 'share'
  | 'thread'
  | 'comment';

/**
 * Node metadata
 *
 * Additional information about how a node should be rendered.
 */
export interface NodeMetadata {
  /** Does this node support immersive view? */
  supportsImmersive: boolean;

  /** Default view mode when opened */
  defaultView: ViewMode;

  /** Display name for this node type */
  displayName: string;

  /** Icon identifier */
  icon?: string;
}

/**
 * Registry entry for a node type
 */
export interface NodeRegistryEntry<T = FeedItem> {
  /** Node type identifier */
  type: NodeType;

  /** Renderer functions */
  renderer: NodeRenderer<T>;

  /** Metadata */
  metadata: NodeMetadata;
}

/**
 * Complete node registry
 *
 * Maps node types to their renderers and metadata.
 */
export type NodeRegistry = Map<NodeType, NodeRegistryEntry>;

/**
 * Hook return type for useNodeRenderer
 */
export interface UseNodeRendererResult {
  /** Render a node in the specified view mode */
  render: (nodeType: NodeType, viewMode: ViewMode, props: NodeRenderProps) => ReactNode;

  /** Get metadata for a node type */
  getMetadata: (nodeType: NodeType) => NodeMetadata | undefined;

  /** Check if a node type is registered */
  isRegistered: (nodeType: NodeType) => boolean;

  /** Check if a node type supports immersive view */
  supportsImmersive: (nodeType: NodeType) => boolean;
}
