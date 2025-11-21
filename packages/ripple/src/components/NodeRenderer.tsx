/**
 * NodeRenderer Component
 *
 * Universal component that renders any content node in any view mode.
 * This is the primary component used throughout the app for rendering content.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { FeedItem } from '../schemas';
import type { ViewMode } from '../nodes/types';
import { useNodeRenderer, useNodeNavigation } from '../nodes';

export interface NodeRendererProps {
  /** The content item to render */
  item: FeedItem;

  /** View mode to render in */
  viewMode: ViewMode;

  /** Callback when item is pressed */
  onPress?: () => void;

  /** Additional props to pass to renderer */
  [key: string]: any;
}

/**
 * NodeRenderer - Universal content renderer
 *
 * Automatically selects the correct renderer based on content type
 * and renders it in the specified view mode.
 *
 * @example
 * ```tsx
 * // In feed
 * <NodeRenderer item={post} viewMode="preview" onPress={() => navigate(post)} />
 *
 * // In detail view
 * <NodeRenderer item={post} viewMode="full" />
 *
 * // In immersive view
 * <NodeRenderer item={video} viewMode="immersive" />
 * ```
 */
export function NodeRenderer({ item, viewMode, onPress, ...rest }: NodeRendererProps) {
  const { render, isRegistered } = useNodeRenderer();
  const navigation = useNodeNavigation();

  // Check if node type is registered
  if (!isRegistered(item.type)) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unknown content type: {item.type}</Text>
      </View>
    );
  }

  // Generate node ID from item
  const nodeId = item['#'] || `${item.type}-${Date.now()}`;

  // Render the node
  const rendered = render(item.type, viewMode, {
    data: item,
    nodeId,
    navigation,
    onPress,
    ...rest,
  });

  return <>{rendered}</>;
}

const styles = StyleSheet.create({
  errorContainer: {
    padding: 20,
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
  },
});
