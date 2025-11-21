/**
 * TextPostCard - Refined text post display
 *
 * Clean typography with generous breathing room
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Post } from '../schemas';
import { ContentCard } from './ContentCard';
import { theme } from '../../../../apps/ripple/theme';
import { Ionicons } from '@expo/vector-icons';

interface TextPostCardProps {
  post: Post;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function TextPostCard({ post, onPress, onLongPress }: TextPostCardProps) {
  return (
    <ContentCard onPress={onPress} onLongPress={onLongPress}>
      {/* Author header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {post.authorAlias?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>

        <View style={styles.meta}>
          <Text style={styles.authorName}>{post.authorAlias || 'Anonymous'}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.timestamp}>{formatTimestamp(post.created)}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.degree}>Degree {post.degree}</Text>
          </View>
        </View>
      </View>

      {/* Content with fluid spacing */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Tags with liquid accents */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tags}>
          {post.tags.map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Interaction bar - FROM BELOW philosophy */}
      <View style={styles.actions}>
        <ActionButton icon="chatbubble-outline" count={0} />
        <ActionButton icon="repeat-outline" count={0} />
        <ActionButton icon="heart-outline" count={0} />
        <ActionButton icon="share-outline" />
      </View>
    </ContentCard>
  );
}

function ActionButton({ icon, count }: { icon: any; count?: number }) {
  return (
    <View style={styles.actionButton}>
      <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
      {count !== undefined && count > 0 && (
        <Text style={styles.actionCount}>{count}</Text>
      )}
    </View>
  );
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.text}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  meta: {
    flex: 1,
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestamp: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  dot: {
    fontSize: 14,
    color: theme.colors.textTertiary,
  },
  degree: {
    fontSize: 14,
    color: theme.colors.textTertiary,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    letterSpacing: 0.2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  tag: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.colors.text}08`,
    borderWidth: 1,
    borderColor: `${theme.colors.text}15`,
  },
  tagText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: `${theme.colors.border}40`,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  actionCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});
