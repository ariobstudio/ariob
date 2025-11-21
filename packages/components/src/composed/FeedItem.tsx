/**
 * FeedItem - Unified feed item component
 *
 * Visual differentiation by type:
 * - Post: Square corners, #121212
 * - Message/Thread: Rounded corners, #1a1a1a
 * - Notification: Sharp corners, subtle variant
 */

import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useStyles } from 'react-native-unistyles';
import { Text } from '../primitives/Text';
import { Avatar } from './Avatar';
import { Card } from '../primitives/Card';

export type FeedItemType = 'post' | 'thread' | 'notification';

export interface FeedItemData {
  id: string;
  type: FeedItemType;
  author?: string;
  authorAlias?: string;
  content?: string;
  text?: string;
  lastMessage?: string;
  participants?: string[];
  created: number;
  unread?: boolean;
}

export interface FeedItemProps {
  item: { id: string; data: FeedItemData };
  onPress?: () => void;
}

export const FeedItem: React.FC<FeedItemProps> = ({ item, onPress }) => {
  const { theme } = useStyles();
  const { data } = item;

  // Visual differentiation by type
  const radius = data.type === 'thread' ? 'soft' : data.type === 'post' ? 'subtle' : 'sharp';
  const backgroundColor = data.type === 'thread' ? theme.colors.surface : theme.colors.depth;

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card
          variant="outlined"
          padding="medium"
          radius={radius}
          style={[
            styles.container,
            { backgroundColor },
            pressed && styles.pressed,
            data.unread && styles.unread,
          ]}
        >
          {/* Header: Avatar + Author + Time */}
          <View style={styles.header}>
            <Avatar
              name={data.authorAlias || data.author || 'Unknown'}
              size="medium"
            />

            <View style={styles.headerText}>
              <Text variant="body" weight="semibold" color="cream">
                {data.authorAlias || data.author || 'Unknown'}
              </Text>
              <Text variant="mono" color="ash">
                {formatTime(data.created)}
              </Text>
            </View>

            {/* Type indicator (subtle icon or label) */}
            <View style={styles.typeIndicator}>
              <Text variant="label" color="ash">
                {data.type === 'thread' ? 'DM' : data.type === 'post' ? 'POST' : 'NOTE'}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text
              variant="body"
              color="cream"
              numberOfLines={4}
              style={styles.contentText}
            >
              {data.content || data.text || data.lastMessage || ''}
            </Text>
          </View>

          {/* Micro-preview (hidden, shown on focus/hover) */}
          {data.unread && (
            <View style={styles.unreadIndicator} />
          )}
        </Card>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    marginBottom: theme.spacing.md,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  unread: {
    borderColor: theme.colors.cream,
    borderWidth: 1.5,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },

  headerText: {
    flex: 1,
    gap: theme.spacing.xs,
  },

  typeIndicator: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.ripple,
    borderRadius: theme.borderRadius.subtle,
  },

  content: {
    gap: theme.spacing.sm,
  },

  contentText: {
    lineHeight: theme.fontSizes.body * theme.lineHeights.relaxed,
  },

  unreadIndicator: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.cream,
  },
}));
