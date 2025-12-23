/**
 * Node Renderers
 *
 * Andromeda components for rendering Social OS nodes.
 * NodeRenderer dispatches to the correct component based on node.type.
 *
 * @example
 * ```tsx
 * import { NodeRenderer } from '@ariob/andromeda/nodes';
 *
 * <NodeRenderer
 *   node={profileNode}
 *   variant="card"
 *   userId={currentUser.pub}
 *   onNavigate={router.navigate}
 * />
 * ```
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import type { SchemaNode as Node, Variant } from '@ariob/ripple';
import type { NodeBarConfig } from '@ariob/ripple';

import { ProfileCard, type ProfileCardProps } from './ProfileCard';
import { AICard, type AICardProps } from './AICard';

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export { ProfileCard, type ProfileCardProps } from './ProfileCard';
export { AICard, type AICardProps } from './AICard';

// ─────────────────────────────────────────────────────────────────────────────
// NodeRenderer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Props for NodeRenderer
 */
export interface NodeRendererProps {
  /** The node to render */
  node: Node;

  /** Current user ID for ownership check */
  userId?: string;

  /** Render variant */
  variant?: Variant;

  /** Navigation callback */
  onNavigate?: NodeBarConfig['onNavigate'];

  /** Action callback */
  onAction?: NodeBarConfig['onAction'];

  /** Press callback */
  onPress?: () => void;

  /** Additional styles */
  style?: ViewStyle;
}

/**
 * NodeRenderer - dispatches to correct component based on node.type
 *
 * Supports:
 * - profile → ProfileCard
 * - ai → AICard
 *
 * For post, message, etc., use the existing components from @ariob/ripple
 * until they are migrated to this pattern.
 */
export function NodeRenderer({
  node,
  userId,
  variant = 'card',
  onNavigate,
  onAction,
  onPress,
  style,
}: NodeRendererProps) {
  switch (node.type) {
    case 'profile':
      return (
        <ProfileCard
          node={node}
          userId={userId}
          variant={variant}
          onNavigate={onNavigate}
          onAction={onAction}
          onPress={onPress}
          style={style}
        />
      );

    case 'ai':
      return (
        <AICard
          node={node}
          variant={variant}
          onNavigate={onNavigate}
          onAction={onAction}
          onPress={onPress}
          style={style}
        />
      );

    default:
      // For now, return null for unsupported types
      // In future, could render a generic card or fallback
      console.warn(`[NodeRenderer] No renderer for node type: ${node.type}`);
      return null;
  }
}
