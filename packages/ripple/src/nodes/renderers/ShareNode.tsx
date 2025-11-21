/**
 * Share Node Renderer
 *
 * Renders shared/reposted content
 * - preview: Shows share + nested original post
 * - full: Full view with original content embedded
 * - immersive: Not supported (uses full)
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Share } from '../../schemas';
import type { NodeRenderer, NodeRenderProps } from '../types';

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
 * Preview: Share with nested original post preview
 */
function PreviewView({ data, nodeId, onPress }: NodeRenderProps<Share>) {
  return (
    <Pressable onPress={onPress} style={styles.previewContainer}>
      {/* Share Header */}
      <View style={styles.shareHeader}>
        <Ionicons name="repeat" size={16} color="#34C759" />
        <Text style={styles.shareLabel}>
          {data.authorAlias || data.author} shared
        </Text>
      </View>

      {/* Sharer Info */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(data.authorAlias || data.author || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.authorName}>{data.authorAlias || data.author}</Text>
          <Text style={styles.timestamp}>{formatTime(data.created)}</Text>
        </View>
      </View>

      {/* Share Comment (if any) */}
      {data.comment && (
        <Text style={styles.shareComment} numberOfLines={3}>
          {data.comment}
        </Text>
      )}

      {/* Original Post (Nested) */}
      <View style={styles.originalPostContainer}>
        <View style={styles.originalPostHeader}>
          <View style={styles.originalAvatar}>
            <Text style={styles.originalAvatarText}>
              {(data.originalAuthorAlias || data.originalAuthor || '?')
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>
          <Text style={styles.originalAuthorName} numberOfLines={1}>
            {data.originalAuthorAlias || data.originalAuthor}
          </Text>
        </View>

        <Text style={styles.originalPostContent} numberOfLines={4}>
          [Original post content will be fetched from Gun.js]
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble-outline" size={14} color="#8E8E93" />
          <Text style={styles.statText}>0</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="heart-outline" size={14} color="#8E8E93" />
          <Text style={styles.statText}>0</Text>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Full: Full view with embedded original content
 */
function FullView({ data, nodeId, navigation }: NodeRenderProps<Share>) {
  return (
    <View style={styles.fullContainer}>
      {/* Header */}
      <View style={styles.fullHeader}>
        <Pressable onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.fullHeaderContent}>
          <Ionicons name="repeat" size={20} color="#34C759" style={styles.fullShareIcon} />
          <Text style={styles.fullTitle}>Shared Post</Text>
        </View>
        <Pressable style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Sharer Section */}
      <View style={styles.sharerSection}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTextLarge}>
            {(data.authorAlias || data.author || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.sharerInfo}>
          <Text style={styles.fullAuthorName}>{data.authorAlias || data.author}</Text>
          <Text style={styles.fullTimestamp}>{formatTime(data.created)}</Text>
        </View>
      </View>

      {/* Share Comment */}
      {data.comment && (
        <View style={styles.commentSection}>
          <Text style={styles.fullComment}>{data.comment}</Text>
        </View>
      )}

      {/* Original Post Card */}
      <View style={styles.originalPostCard}>
        <View style={styles.originalPostCardHeader}>
          <View style={styles.originalAvatarLarge}>
            <Text style={styles.originalAvatarTextLarge}>
              {(data.originalAuthorAlias || data.originalAuthor || '?')
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>
          <View style={styles.originalPostCardMeta}>
            <Text style={styles.originalPostCardAuthor}>
              {data.originalAuthorAlias || data.originalAuthor}
            </Text>
            <Text style={styles.originalPostCardTime}>Original post</Text>
          </View>
          <Pressable style={styles.originalPostCardMore}>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </Pressable>
        </View>

        <Text style={styles.originalPostCardContent}>
          [Original post content will be fetched from Gun.js reference: {data.originalPostRef}]
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={22} color="#FFFFFF" />
          <Text style={styles.actionText}>Comment</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <Ionicons name="heart-outline" size={22} color="#FFFFFF" />
          <Text style={styles.actionText}>Like</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <Ionicons name="share-outline" size={22} color="#FFFFFF" />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>
      </View>

      {/* Comments */}
      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>Comments</Text>
        <Text style={styles.commentsEmpty}>No comments yet</Text>
      </View>
    </View>
  );
}

export const ShareNodeRenderer: NodeRenderer<Share> = {
  preview: PreviewView,
  full: FullView,
};

const styles = StyleSheet.create({
  // Preview
  previewContainer: {
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  shareLabel: {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  meta: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  shareComment: {
    fontSize: 14,
    lineHeight: 18,
    color: '#FFFFFF',
    marginBottom: 12,
    paddingLeft: 46,
  },
  originalPostContainer: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#38383A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  originalPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  originalAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  originalAvatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  originalAuthorName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  originalPostContent: {
    fontSize: 13,
    lineHeight: 16,
    color: '#8E8E93',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    paddingLeft: 46,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#8E8E93',
  },

  // Full View
  fullContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  backButton: {
    padding: 4,
  },
  fullHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -32,
  },
  fullShareIcon: {
    marginRight: 8,
  },
  fullTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moreButton: {
    padding: 8,
  },
  sharerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarTextLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sharerInfo: {
    flex: 1,
  },
  fullAuthorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  fullTimestamp: {
    fontSize: 13,
    color: '#8E8E93',
  },
  commentSection: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  fullComment: {
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  originalPostCard: {
    margin: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#38383A',
  },
  originalPostCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  originalAvatarLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  originalAvatarTextLarge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  originalPostCardMeta: {
    flex: 1,
  },
  originalPostCardAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  originalPostCardTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  originalPostCardMore: {
    padding: 4,
  },
  originalPostCardContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8E8E93',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  commentsSection: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  commentsEmpty: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 32,
  },
});
