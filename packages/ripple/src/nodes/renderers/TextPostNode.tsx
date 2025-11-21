/**
 * Text Post Node Renderer
 *
 * Renders standard text posts in three view modes:
 * - preview: Compact card in feed
 * - full: Detailed view with comments and interactions
 * - immersive: Not supported (uses full view)
 */

// import React from 'react';
import { View, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import type { Post } from '../../schemas';
import type { NodeRenderer, NodeRenderProps } from '../types';
import { Card, Text, Button } from '@ariob/components';

// Helper to format timestamps
function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

/**
 * Preview mode: Compact view for feed
 */
function PreviewView({ data, nodeId, onPress }: NodeRenderProps<Post>) {
  return (
    <Pressable onPress={onPress}>
      <Card variant="flat" padding="medium" style={styles.previewContainer}>
        {/* Author Header */}
        <View style={styles.previewHeader}>
          <View style={styles.avatar}>
            <Text variant="bodySmall" style={styles.avatarText}>
              {(data.authorAlias || data.author || '?').charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.previewMeta}>
            <View style={styles.authorRow}>
              <Text variant="label" style={styles.authorName} numberOfLines={1}>
                {data.authorAlias || data.author}
              </Text>
              <Text variant="bodySmall" style={styles.dot}>·</Text>
              <Text variant="bodySmall" style={styles.timestamp}>{formatTime(data.created)}</Text>
            </View>
          </View>
        </View>

        {/* Content Preview */}
        <Text variant="body" style={styles.previewContent} numberOfLines={4}>
          {data.content}
        </Text>

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {data.tags.slice(0, 3).map((tag, idx) => (
              <Text key={idx} variant="bodySmall" style={styles.tag}>
                #{tag}
              </Text>
            ))}
            {data.tags.length > 3 && <Text variant="bodySmall" style={styles.tagMore}>+{data.tags.length - 3}</Text>}
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.previewStats}>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={14} color={styles.iconColor.color} />
            <Text variant="bodySmall" style={styles.statText}>0</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={14} color={styles.iconColor.color} />
            <Text variant="bodySmall" style={styles.statText}>0</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="repeat-outline" size={14} color={styles.iconColor.color} />
            <Text variant="bodySmall" style={styles.statText}>0</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

/**
 * Full mode: Detailed view with all interactions
 */
function FullView({ data, nodeId, navigation }: NodeRenderProps<Post>) {
  return (
    <View style={styles.fullContainer}>
      {/* Author Header */}
      <View style={styles.fullHeader}>
        <View style={styles.avatarLarge}>
          <Text variant="h3" style={styles.avatarTextLarge}>
            {(data.authorAlias || data.author || '?').charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.fullHeaderText}>
          <Text variant="h4" style={styles.fullAuthorName}>{data.authorAlias || data.author}</Text>
          <Text variant="bodySmall" style={styles.fullTimestamp}>{formatTime(data.created)}</Text>
        </View>

        <Pressable style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={styles.iconColor.color} />
        </Pressable>
      </View>

      {/* Full Content */}
      <Text variant="bodyLarge" style={styles.fullContent}>{data.content}</Text>

      {/* Media (if any) */}
      {data.media && data.media.length > 0 && (
        <View style={styles.mediaContainer}>
          {data.media.map((item, idx) => (
            <View key={idx} style={styles.mediaPlaceholder}>
              <Ionicons name="image-outline" size={32} color={styles.iconColor.color} />
            </View>
          ))}
        </View>
      )}

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <View style={styles.fullTagsRow}>
          {data.tags.map((tag, idx) => (
            <Pressable key={idx} style={styles.fullTag}>
              <Text variant="bodySmall" style={styles.fullTagText}>#{tag}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Engagement Stats */}
      <View style={styles.engagementStats}>
        <Text variant="bodySmall" style={styles.engagementStatText}>
          <Text variant="label" style={styles.engagementNumber}>0</Text> reactions
        </Text>
        <Text variant="bodySmall" style={styles.engagementStatText}>
          <Text variant="label" style={styles.engagementNumber}>0</Text> comments
        </Text>
        <Text variant="bodySmall" style={styles.engagementStatText}>
          <Text variant="label" style={styles.engagementNumber}>0</Text> shares
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={22} color={styles.actionIconColor.color} />
          <Text variant="label" style={styles.actionButtonText}>Comment</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <Ionicons name="heart-outline" size={22} color={styles.actionIconColor.color} />
          <Text variant="label" style={styles.actionButtonText}>Like</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <Ionicons name="repeat-outline" size={24} color={styles.actionIconColor.color} />
          <Text variant="label" style={styles.actionButtonText}>Share</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <Ionicons name="share-outline" size={22} color={styles.actionIconColor.color} />
        </Pressable>
      </View>

      {/* Comments Section Placeholder */}
      <View style={styles.commentsSection}>
        <Text variant="h4" style={styles.commentsTitle}>Comments</Text>
        <Text variant="body" style={styles.commentsEmpty}>No comments yet. Be the first!</Text>
      </View>
    </View>
  );
}

/**
 * Text Post Node Renderer
 */
export const TextPostNodeRenderer: NodeRenderer<Post> = {
  preview: PreviewView,
  full: FullView,
  // No immersive view for text posts
};

const styles = StyleSheet.create((theme) => ({
  // Preview Styles
  previewContainer: {
    marginBottom: 1, // Separator
    borderRadius: 0, // List style
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarText: {
    color: theme.colors.text,
  },
  previewMeta: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    color: theme.colors.text,
    flex: 1,
  },
  dot: {
    color: theme.colors.textTertiary,
  },
  timestamp: {
    color: theme.colors.textTertiary,
  },
  previewContent: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    paddingLeft: 52,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingLeft: 52,
    marginBottom: theme.spacing.sm,
  },
  tag: {
    color: theme.colors.primary,
  },
  tagMore: {
    color: theme.colors.textTertiary,
  },
  previewStats: {
    flexDirection: 'row',
    gap: 16,
    paddingLeft: 52,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: theme.colors.textTertiary,
  },
  iconColor: {
    color: theme.colors.textTertiary,
  },

  // Full View Styles
  fullContainer: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  fullHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarTextLarge: {
    color: theme.colors.text,
  },
  fullHeaderText: {
    flex: 1,
  },
  fullAuthorName: {
    color: theme.colors.text,
    marginBottom: 2,
  },
  fullTimestamp: {
    color: theme.colors.textTertiary,
  },
  moreButton: {
    padding: 8,
  },
  fullContent: {
    color: theme.colors.text,
    padding: theme.spacing.md,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  mediaPlaceholder: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  fullTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: 16,
  },
  fullTagText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  engagementStats: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: theme.colors.border,
  },
  engagementStatText: {
    color: theme.colors.textTertiary,
  },
  engagementNumber: {
    color: theme.colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  actionButtonText: {
    color: theme.colors.text,
  },
  actionIconColor: {
    color: theme.colors.text,
  },
  commentsSection: {
    padding: theme.spacing.md,
  },
  commentsTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  commentsEmpty: {
    color: theme.colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 32,
  },
}));
