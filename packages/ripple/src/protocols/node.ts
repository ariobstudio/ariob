/**
 * Node Protocol - Block editor-inspired node extensibility
 *
 * Like Gutenberg blocks define their own toolbars, Ripple nodes define
 * their bar context. Each node type implements NodeProtocol to:
 * - Define its schema and validation
 * - Provide render function for different variants
 * - Specify bar actions contextual to the node
 *
 * This enables nodes to control the Bar without coupling to Bar internals.
 */

import type { ReactElement } from 'react';
import type { ZodSchema } from 'zod';
import type { BarFrame, BarStore } from './bar';
import type { Variant, Degree } from '../nodes/_shared';

// ─────────────────────────────────────────────────────────────────────────────
// NodeContext - Runtime context passed to nodes
// ─────────────────────────────────────────────────────────────────────────────

export interface NodeContext {
  // Identity
  /** Current degree (0=Me, 1=Friends, 2=World, etc.) */
  degree: Degree;
  /** Render variant */
  variant: Variant;
  /** Is current user the owner of this node */
  isOwner: boolean;
  /** Current user's public key (if authenticated) */
  currentUserPub?: string;

  // Navigation
  /** Go back to previous screen */
  goBack: () => void;
  /** Navigate to a path */
  navigate: (path: string) => void;

  // Bar control
  /** Direct access to bar store */
  bar: BarStore;

  // Common sheets (convenience methods)
  /** Open settings sheet */
  openSettings: () => void;
  /** Open compose menu */
  openCompose: () => void;
  /** Open overflow menu */
  openMenu: () => void;
  /** Open chat/message */
  openChat: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// NodeProtocol - Core interface for node types
// ─────────────────────────────────────────────────────────────────────────────

export interface NodeProtocol<T> {
  /** Unique node type identifier */
  type: string;

  /** Zod schema for validation */
  schema: ZodSchema<T>;

  /**
   * Render the node for display
   *
   * @param data - Validated node data
   * @param context - Runtime context
   * @returns React element to render
   */
  render: (data: T, context: NodeContext) => ReactElement;

  /**
   * Get bar frame for this node (optional)
   *
   * Called when node is in focus (e.g., full view).
   * Return null to use default bar behavior.
   *
   * @param data - Validated node data
   * @param context - Runtime context
   * @returns BarFrame to push, or null for default
   */
  getBarFrame?: (data: T, context: NodeContext) => BarFrame | null;

  /**
   * Default actions for this node type
   *
   * These are registered with the action registry
   * and available via context menu or bar.
   */
  actions?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// NodeRegistry - Collection of registered node types
// ─────────────────────────────────────────────────────────────────────────────

const nodeRegistry = new Map<string, NodeProtocol<unknown>>();

/**
 * Register a node type
 */
export function registerNode<T>(protocol: NodeProtocol<T>): void {
  nodeRegistry.set(protocol.type, protocol as NodeProtocol<unknown>);
}

/**
 * Get a registered node type
 */
export function getNode(type: string): NodeProtocol<unknown> | undefined {
  return nodeRegistry.get(type);
}

/**
 * Get all registered node types
 */
export function getAllNodes(): NodeProtocol<unknown>[] {
  return Array.from(nodeRegistry.values());
}

/**
 * Check if a node type is registered
 */
export function hasNode(type: string): boolean {
  return nodeRegistry.has(type);
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory Helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create and register a node protocol
 *
 * @example
 * ```ts
 * const ProfileNode = createNode({
 *   type: 'profile',
 *   schema: ProfileSchema,
 *   render: (data, ctx) => <Profile data={data} variant={ctx.variant} />,
 *   getBarFrame: (data, ctx) => {
 *     if (ctx.variant !== 'full') return null;
 *     return {
 *       id: 'profile-actions',
 *       mode: 'action',
 *       actions: {
 *         primary: { icon: 'add', onPress: ctx.openCompose }
 *       }
 *     };
 *   },
 *   actions: ['edit', 'connect', 'message', 'share'],
 * });
 * ```
 */
export function createNode<T>(protocol: NodeProtocol<T>): NodeProtocol<T> {
  registerNode(protocol);
  return protocol;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context Factory
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateNodeContextParams {
  degree: Degree;
  variant: Variant;
  currentUserPub?: string;
  nodePub?: string;
  bar: BarStore;
  goBack: () => void;
  navigate: (path: string) => void;
}

/**
 * Create a NodeContext from params
 *
 * Handles isOwner detection and provides convenience methods.
 */
export function createNodeContext(params: CreateNodeContextParams): NodeContext {
  const { degree, variant, currentUserPub, nodePub, bar, goBack, navigate } = params;

  return {
    degree,
    variant,
    isOwner: !!(currentUserPub && nodePub && currentUserPub === nodePub),
    currentUserPub,
    goBack,
    navigate,
    bar,

    // Convenience methods
    openSettings: () => {
      bar.openSheet(null, { height: 'auto' }); // Will be replaced with actual content
    },
    openCompose: () => {
      bar.openSheet(null, { height: 'auto' }); // Will be replaced with actual content
    },
    openMenu: () => {
      bar.openSheet(null, { height: 'auto' }); // Will be replaced with actual content
    },
    openChat: () => {
      navigate('/message'); // Default behavior
    },
  };
}
