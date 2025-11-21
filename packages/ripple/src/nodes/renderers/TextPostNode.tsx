/**
 * Text Post Node Renderer
 *
 * Renders standard text posts in three view modes:
 * - preview: Compact card in feed
 * - full: Detailed view with comments and interactions
 * - immersive: Not supported (uses full view)
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Post } from '../../schemas';
import type { NodeRenderer, NodeRenderProps } from '../types';

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
    <Pressable onPress={onPress} style={styles.previewContainer}>
      {/* Author Header */}
      <View style={styles.previewHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(data.authorAlias || data.author || '?').charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.previewMeta}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName} numberOfLines={1}>
              {data.authorAlias || data.author}
            </Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.timestamp}>{formatTime(data.created)}</Text>
          </View>
        </View>
      </View>

      {/* Content Preview */}
      <Text style={styles.previewContent} numberOfLines={4}>
        {data.content}
      </Text>

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {data.tags.slice(0, 3).map((tag, idx) => (
            <Text key={idx} style={styles.tag}>
              #{tag}
            </Text>
          ))}
          {data.tags.length > 3 && <Text style={styles.tagMore}>+{data.tags.length - 3}</Text>}
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.previewStats}>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble-outline" size={14} color="#8E8E93" />
          <Text style={styles.statText}>0</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="heart-outline" size={14} color="#8E8E93" />
          <Text style={styles.statText}>0</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="repeat-outline" size={14} color="#8E8E93" />
          <Text style={styles.statText}>0</Text>
        </View>
      </View>
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
          <Text style={styles.avatarTextLarge}>
            {(data.authorAlias || data.author || '?').charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.fullHeaderText}>
          <Text style={styles.fullAuthorName}>{data.authorAlias || data.author}</Text>
          <Text style={styles.fullTimestamp}>{formatTime(data.created)}</Text>
        </View>

        <Pressable style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
        </Pressable>
      </View>

      {/* Full Content */}
      <Text style={styles.fullContent}>{data.content}</Text>

      {/* Media (if any) */}
      {data.media && data.media.length > 0 && (
        <View style={styles.mediaContainer}>
          {data.media.map((item, idx) => (
            <View key={idx} style={styles.mediaPlaceholder}>
              <Ionicons name="image-outline" size={32} color="#8E8E93" />
            </View>
          ))}
        </View>
      )}

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <View style={styles.fullTagsRow}>
          {data.tags.map((tag, idx) => (
            <Pressable key={idx} style={styles.fullTag}>
              <Text style={styles.fullTagText}>#{tag}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Engagement Stats */}
      <View style={styles.engagementStats}>
        <Text style={styles.engagementStatText}>
          <Text style={styles.engagementNumber}>0</Text> reactions
        </Text>
        <Text style={styles.engagementStatText}>
          <Text style={styles.engagementNumber}>0</Text> comments
        </Text>
        <Text style={styles.engagementStatText}>
          <Text style={styles.engagementNumber}>0</Text> shares
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={22} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Comment</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <Ionicons name="heart-outline" size={22} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Like</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <Ionicons name="repeat-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Share</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <Ionicons name="share-outline" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Comments Section Placeholder */}
      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>Comments</Text>
        <Text style={styles.commentsEmpty}>No comments yet. Be the first!</Text>
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

const styles = StyleSheet.create({
  // Preview Styles
  previewContainer: {
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  dot: {
    fontSize: 15,
    color: '#8E8E93',
  },
  timestamp: {
    fontSize: 13,
    color: '#8E8E93',
  },
  previewContent: {
    fontSize: 15,
    lineHeight: 20,
    color: '#FFFFFF',
    marginBottom: 8,
    paddingLeft: 52,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingLeft: 52,
    marginBottom: 8,
  },
  tag: {
    fontSize: 14,
    color: '#0A84FF',
  },
  tagMore: {
    fontSize: 14,
    color: '#8E8E93',
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
    fontSize: 13,
    color: '#8E8E93',
  },

  // Full View Styles
  fullContainer: {
    backgroundColor: '#000000',
    flex: 1,
  },
  fullHeader: {
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
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fullHeaderText: {
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
  moreButton: {
    padding: 8,
  },
  fullContent: {
    fontSize: 17,
    lineHeight: 24,
    color: '#FFFFFF',
    padding: 16,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  mediaPlaceholder: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  fullTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0A84FF15',
    borderRadius: 16,
  },
  fullTagText: {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '500',
  },
  engagementStats: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#38383A',
  },
  engagementStatText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  engagementNumber: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
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
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
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
