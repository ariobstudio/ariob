/**
 * FeedView Component
 *
 * Vertical scrolling feed showing content nodes in preview mode.
 * Handles infinite scroll, pull-to-refresh, and node navigation.
 */

// CRITICAL: Import Unistyles configuration first
import '../../unistyles.config';

import React, { useCallback } from 'react';
import { FlatList, View, Text, RefreshControl } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { NodeRenderer, useNodeNavigation, type FeedItem } from '@ariob/ripple';

export interface FeedViewProps {
  /** Feed items to display */
  items: FeedItem[];

  /** Loading state */
  loading?: boolean;

  /** Refreshing state */
  refreshing?: boolean;

  /** Callback for pull-to-refresh */
  onRefresh?: () => void;

  /** Callback for loading more items */
  onLoadMore?: () => void;

  /** Has more items to load */
  hasMore?: boolean;

  /** Empty state component */
  EmptyComponent?: React.ReactNode;
}

const stylesheet = StyleSheet.create((theme) => ({
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 100, // Space for tab bar
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    color: theme.colors.textTertiary,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
}));

/**
 * FeedView - Scrollable feed of content nodes
 */
export function FeedView({
  items,
  loading = false,
  refreshing = false,
  onRefresh,
  onLoadMore,
  hasMore = false,
  EmptyComponent,
}: FeedViewProps) {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  const { navigate } = useNodeNavigation();

  const handleItemPress = useCallback(
    (item: FeedItem) => {
      const nodeId = item['#'] || `${item.type}-${Date.now()}`;

      // Determine view mode based on node type
      // Video and message threads open in immersive view by default
      const immersiveTypes = ['video-post', 'thread'];
      const viewMode = immersiveTypes.includes(item.type) ? 'immersive' : 'full';

      navigate(viewMode, nodeId);
    },
    [navigate]
  );

  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => (
      <NodeRenderer
        item={item}
        viewMode="preview"
        onPress={() => handleItemPress(item)}
      />
    ),
    [handleItemPress]
  );

  const keyExtractor = useCallback(
    (item: FeedItem, index: number) => {
      // Use Gun soul (#) if available, otherwise construct from type and created timestamp and index
      if (item['#']) return item['#'];
      if (item.id) return item.id;
      const created = (item as any).created || (item as any).createdAt || Date.now();
      return `${item.type}-${created}-${index}`;
    },
    []
  );

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;

    return (
      <View style={styles.footer}>
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  }, [hasMore]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;

    if (EmptyComponent) {
      return <>{EmptyComponent}</>;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>◯</Text>
        <Text style={styles.emptyText}>No posts yet</Text>
        <Text style={styles.emptySubtext}>Check back later for updates</Text>
      </View>
    );
  }, [loading, EmptyComponent]);

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        ) : undefined
      }
    />
  );
}
