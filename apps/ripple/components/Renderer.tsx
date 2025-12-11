/**
 * Renderer - Modular wrapper that transforms feed items to Node components
 *
 * This component bridges application-level feed items to the @ariob/ripple
 * Node component system. It provides:
 * - Type mapping (app types → node types)
 * - Data transformation (feed items → NodeData)
 * - Timestamp formatting
 * - Event handlers (press, avatar, reply)
 *
 * ## Customization
 * The Renderer can be extended by:
 * 1. Adding new type mappings in `mapItemTypeToNodeType`
 * 2. Adding new data transformers in `transformToNodeData`
 * 3. Wrapping with custom gesture handlers
 *
 * @example
 * ```tsx
 * import { Renderer } from '../components/Renderer';
 *
 * <Renderer
 *   item={feedItem}
 *   onPress={() => router.push(`/thread/${item.id}`)}
 *   onAvatarPress={() => router.push(`/user/${item.author}`)}
 * />
 * ```
 */

import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Node, type NodeData, type NodeType } from '@ariob/ripple';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FeedItem {
  id?: string;
  '#'?: string;
  type: string;
  author?: string;
  handle?: string;
  avatar?: string;
  content?: string;
  text?: string;
  created?: number;
  createdAt?: number;
  timestamp?: string;
  degree?: number;
  images?: string[];
  messages?: Array<{ id: string; from: 'me' | 'them'; content: string; time?: string }>;
  name?: string;
  bio?: string;
  verified?: boolean;
  stats?: { posts: number; followers: number; following: number };
  [key: string]: any;
}

export type ViewMode = 'preview' | 'full' | 'immersive';

export interface RendererProps {
  /** Feed item data to render */
  item: FeedItem;
  /** View mode affects layout and detail level */
  viewMode?: ViewMode;
  /** Called when user taps the node */
  onPress?: () => void;
  /** Called when user taps the avatar */
  onAvatarPress?: () => void;
  /** Called when user taps Reply on a message node */
  onReplyPress?: () => void;
  /** Whether this is the last item in the list (affects connector line) */
  isLast?: boolean;
  /** Custom type mapper (overrides default mapping) */
  typeMapper?: (itemType: string) => NodeType;
  /** Custom data transformer (extends default transformation) */
  dataTransformer?: (item: FeedItem, baseData: NodeData) => NodeData;
}

// ─────────────────────────────────────────────────────────────────────────────
// Type Mapping
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default mapping from feed item types to node types.
 * Override by passing `typeMapper` prop.
 */
const defaultTypeMapper = (itemType: string): NodeType => {
  switch (itemType) {
    case 'post':
    case 'image-post':
    case 'video-post':
      return 'post';
    case 'message':
    case 'thread':
      return 'message';
    case 'profile':
      return 'profile';
    case 'auth':
      return 'auth';
    case 'sync':
      return 'sync';
    case 'ghost':
      return 'ghost';
    case 'suggestion':
      return 'suggestion';
    case 'ai-model':
      return 'ai-model';
    default:
      return 'post';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format timestamp from unix epoch to relative time string
 */
export const formatTimestamp = (timestamp?: number): string => {
  if (!timestamp) return 'now';

  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return new Date(timestamp).toLocaleDateString();
};

// ─────────────────────────────────────────────────────────────────────────────
// Data Transformation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transforms a FeedItem into NodeData for the Node component.
 * Extend by passing `dataTransformer` prop.
 */
const transformToNodeData = (
  item: FeedItem,
  typeMapper: (itemType: string) => NodeType,
  dataTransformer?: (item: FeedItem, baseData: NodeData) => NodeData,
): NodeData => {
  const nodeType = typeMapper(item.type);
  const nodeId = item['#'] || item.id || `${item.type}-${Date.now()}`;

  const baseData: NodeData = {
    id: nodeId,
    type: nodeType,
    author: item.author || 'Unknown',
    timestamp: item.timestamp || formatTimestamp(item.created || item.createdAt),
    degree: item.degree || 1,
    handle: item.handle,
    avatar: item.avatar,
  };

  // Add type-specific data
  switch (nodeType) {
    case 'post':
      baseData.post = {
        id: nodeId,
        content: item.content || item.text || '',
        images: item.images,
      };
      break;
    case 'message':
      baseData.message = {
        id: nodeId,
        messages: item.messages?.map(m => ({
          ...m,
          time: m.time || baseData.timestamp,
        })) || [
          {
            id: '1',
            from: 'them' as const,
            content: item.content || item.text || '',
            time: baseData.timestamp,
          },
        ],
      };
      break;
    case 'profile':
      baseData.profile = {
        mode: 'view',
        handle: item.handle || item.author || 'unknown',
        name: item.name || item.author || 'Unknown',
        bio: item.bio || '',
        verified: item.verified || false,
        stats: item.stats || { posts: 0, followers: 0, following: 0 },
      };
      break;
    // Additional types handled by Node component defaults
  }

  // Apply custom transformer if provided
  if (dataTransformer) {
    return dataTransformer(item, baseData);
  }

  return baseData;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const Renderer = ({
  item,
  viewMode = 'preview',
  onPress,
  onAvatarPress,
  onReplyPress,
  isLast = false,
  typeMapper = defaultTypeMapper,
  dataTransformer,
}: RendererProps) => {
  const nodeData = transformToNodeData(item, typeMapper, dataTransformer);

  return (
    <View style={styles.container}>
      <Node
        data={nodeData}
        isLast={isLast}
        onPress={onPress}
        onAvatarPress={onAvatarPress}
        onReplyPress={onReplyPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
