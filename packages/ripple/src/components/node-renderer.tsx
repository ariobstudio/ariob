/**
 * NodeRenderer - Wrapper component that renders nodes with quick action support
 *
 * This component bridges feed items to the Node component and provides
 * long press interaction for quick actions.
 */

import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Node, type NodeData, type NodeType } from './node';

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
  [key: string]: any;
}

export type ViewMode = 'preview' | 'full' | 'immersive';

interface NodeRendererProps {
  item: FeedItem;
  viewMode?: ViewMode;
  onPress?: () => void;
  onAvatarPress?: () => void;
  /** Called when user taps Reply on a message node */
  onReplyPress?: () => void;
  isLast?: boolean;
}

/**
 * Maps feed item types to node types
 */
const mapItemTypeToNodeType = (itemType: string): NodeType => {
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
    default:
      return 'post';
  }
};

/**
 * Transforms a FeedItem into NodeData
 */
const transformToNodeData = (item: FeedItem): NodeData => {
  const nodeType = mapItemTypeToNodeType(item.type);
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
        messages: item.messages || [
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
        handle: item.handle || item.author,
        name: item.name || item.author,
        bio: item.bio || '',
        verified: item.verified || false,
        stats: item.stats || { posts: 0, followers: 0, following: 0 },
      };
      break;
    // Add other types as needed
  }

  return baseData;
};

/**
 * Format timestamp from unix epoch
 */
const formatTimestamp = (timestamp?: number): string => {
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

export const NodeRenderer = ({
  item,
  viewMode = 'preview',
  onPress,
  onAvatarPress,
  onReplyPress,
  isLast = false,
}: NodeRendererProps) => {
  const nodeData = transformToNodeData(item);

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
