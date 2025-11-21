/**
 * FeedItem - Smart component that renders the correct card type
 *
 * Discriminated union pattern for type-safe rendering
 */

import React from 'react';
import type { FeedItem as FeedItemType } from '../schemas';
import { isPost, isPoll, isThread } from '../schemas';
import { TextPostCard } from './TextPostCard';
import { PollCard } from './PollCard';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../../../apps/ripple/theme';

interface FeedItemProps {
  item: FeedItemType;
  onPress?: (item: FeedItemType) => void;
  onLongPress?: (item: FeedItemType) => void;
}

export function FeedItem({ item, onPress, onLongPress }: FeedItemProps) {
  const handlePress = () => onPress?.(item);
  const handleLongPress = () => onLongPress?.(item);

  // Type-safe rendering based on discriminated union
  if (isPost(item)) {
    return (
      <TextPostCard
        post={item}
        onPress={handlePress}
        onLongPress={handleLongPress}
      />
    );
  }

  if (isPoll(item)) {
    return (
      <PollCard poll={item} onPress={handlePress} />
    );
  }

  if (isThread(item)) {
    // TODO: Implement DMThreadCard
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>DM Thread (coming soon)</Text>
      </View>
    );
  }

  // Fallback for unimplemented types
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>
        Content type: {item.type} (not yet implemented)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  placeholderText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});
