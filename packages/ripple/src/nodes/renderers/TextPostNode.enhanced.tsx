/**
 * Enhanced Text Post Node - "Liquid Trust" Design
 *
 * Features:
 * - Degree-based glowing borders
 * - Fluid hover animations
 * - Bioluminescent accents
 * - Refined typography hierarchy
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Post } from '../../schemas';
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

// Degree color mapping
const DEGREE_COLORS = {
  '0': '#FF6B9D',
  '1': '#00E5FF',
  '2': '#7C4DFF',
  '3': '#FFC107',
  '4': '#78909C',
};

/**
 * Preview: Polished card with degree-based glow
 */
function PreviewView({ data, nodeId, onPress }: NodeRenderProps<Post>) {
  const degreeColor = DEGREE_COLORS[data.degree] || DEGREE_COLORS['1'];

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View style={[styles.previewContainer, pressed && styles.previewPressed]}>
          {/* Degree indicator - glowing left border */}
          <View style={[styles.degreeIndicator, { backgroundColor: degreeColor }]} />

          {/* Content */}
          <View style={styles.previewContent}>
            {/* Author header */}
            <View style={styles.authorRow}>
              <View style={[styles.avatar, { borderColor: degreeColor }]}>
                <Text style={styles.avatarText}>
                  {(data.authorAlias || data.author || '?').charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.authorInfo}>
                <Text style={styles.authorName} numberOfLines={1}>
                  {data.authorAlias || data.author}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.timestamp}>{formatTime(data.created)}</Text>
                  <View style={[styles.degreeBadge, { backgroundColor: `${degreeColor}15` }]}>
                    <Text style={[styles.degreeText, { color: degreeColor }]}>
                      {data.degree}°
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Post content */}
            <Text style={styles.contentPreview} numberOfLines={4}>
              {data.content}
            </Text>

            {/* Tags */}
            {data.tags && data.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {data.tags.slice(0, 3).map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
                {data.tags.length > 3 && (
                  <Text style={styles.tagMore}>+{data.tags.length - 3}</Text>
                )}
              </View>
            )}

            {/* Engagement row */}
            <View style={styles.engagementRow}>
              <View style={styles.engagementItem}>
                <Ionicons name="chatbubble-outline" size={16} color="#9BA8B8" />
                <Text style={styles.engagementText}>0</Text>
              </View>
              <View style={styles.engagementItem}>
                <Ionicons name="heart-outline" size={16} color="#9BA8B8" />
                <Text style={styles.engagementText}>0</Text>
              </View>
              <View style={styles.engagementItem}>
                <Ionicons name="repeat-outline" size={18} color="#9BA8B8" />
                <Text style={styles.engagementText}>0</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

/**
 * Full view: Immersive detail with all interactions
 */
function FullView({ data, nodeId, navigation }: NodeRenderProps<Post>) {
  const degreeColor = DEGREE_COLORS[data.degree] || DEGREE_COLORS['1'];

  return (
    <View style={styles.fullContainer}>
      {/* Glowing header */}
      <LinearGradient
        colors={['rgba(0, 229, 255, 0.05)', 'transparent']}
        style={styles.headerGradient}
      >
        <View style={styles.fullHeader}>
          <Pressable onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#ECEFF4" />
          </Pressable>

          <View style={styles.fullAuthorSection}>
            <View style={[styles.avatarLarge, { borderColor: degreeColor }]}>
              <Text style={styles.avatarTextLarge}>
                {(data.authorAlias || data.author || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.fullAuthorInfo}>
              <Text style={styles.fullAuthorName}>{data.authorAlias || data.author}</Text>
              <View style={styles.fullMetaRow}>
                <Text style={styles.fullTimestamp}>{formatTime(data.created)}</Text>
                <View style={[styles.fullDegreeBadge, { backgroundColor: `${degreeColor}20` }]}>
                  <Text style={[styles.fullDegreeText, { color: degreeColor }]}>
                    {data.degree}° connection
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <Pressable style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#9BA8B8" />
          </Pressable>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.fullContentSection}>
        <Text style={styles.fullContent}>{data.content}</Text>

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <View style={styles.fullTagsContainer}>
            {data.tags.map((tag, idx) => (
              <Pressable key={idx} style={styles.fullTag}>
                <Text style={styles.fullTagText}>#{tag}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Stats bar with glow */}
      <View style={styles.statsBar}>
        <Text style={styles.statText}>
          <Text style={styles.statNumber}>0</Text> reactions
        </Text>
        <Text style={styles.statDivider}>·</Text>
        <Text style={styles.statText}>
          <Text style={styles.statNumber}>0</Text> comments
        </Text>
        <Text style={styles.statDivider}>·</Text>
        <Text style={styles.statText}>
          <Text style={styles.statNumber}>0</Text> shares
        </Text>
      </View>

      {/* Action buttons with glow effect */}
      <View style={styles.actionsBar}>
        <Pressable style={styles.actionButton}>
          {({ pressed }) => (
            <>
              <Ionicons
                name={pressed ? 'heart' : 'heart-outline'}
                size={24}
                color={pressed ? '#FF6B9D' : '#9BA8B8'}
              />
              <Text style={[styles.actionText, pressed && styles.actionTextActive]}>
                Like
              </Text>
            </>
          )}
        </Pressable>

        <View style={styles.actionDivider} />

        <Pressable style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={22} color="#9BA8B8" />
          <Text style={styles.actionText}>Comment</Text>
        </Pressable>

        <View style={styles.actionDivider} />

        <Pressable style={styles.actionButton}>
          <Ionicons name="repeat-outline" size={26} color="#9BA8B8" />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>
      </View>

      {/* Comments section */}
      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>Comments</Text>
        <View style={styles.emptyComments}>
          <Ionicons name="chatbubbles-outline" size={40} color="#3D4857" />
          <Text style={styles.emptyCommentsText}>No comments yet</Text>
          <Text style={styles.emptyCommentsSubtext}>Be the first to share your thoughts</Text>
        </View>
      </View>
    </View>
  );
}

export const EnhancedTextPostNodeRenderer: NodeRenderer<Post> = {
  preview: PreviewView,
  full: FullView,
};

const styles = StyleSheet.create({
  // Preview styles
  previewContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C2533',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 168, 184, 0.08)',
    overflow: 'hidden',
  },
  previewPressed: {
    backgroundColor: '#252F42',
  },
  degreeIndicator: {
    width: 3,
    opacity: 0.8,
  },
  previewContent: {
    flex: 1,
    padding: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#243447',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ECEFF4',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ECEFF4',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timestamp: {
    fontSize: 13,
    color: '#9BA8B8',
  },
  degreeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  degreeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  contentPreview: {
    fontSize: 15,
    lineHeight: 22,
    color: '#ECEFF4',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  tagText: {
    fontSize: 13,
    color: '#00E5FF',
    fontWeight: '500',
  },
  tagMore: {
    fontSize: 13,
    color: '#5F6D7E',
    paddingHorizontal: 8,
  },
  engagementRow: {
    flexDirection: 'row',
    gap: 20,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  engagementText: {
    fontSize: 13,
    color: '#9BA8B8',
  },

  // Full view styles
  fullContainer: {
    flex: 1,
    backgroundColor: '#0A0E14',
  },
  headerGradient: {
    paddingTop: 60,
  },
  fullHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 168, 184, 0.08)',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  fullAuthorSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#243447',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarTextLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ECEFF4',
  },
  fullAuthorInfo: {
    flex: 1,
  },
  fullAuthorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ECEFF4',
    marginBottom: 4,
  },
  fullMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullTimestamp: {
    fontSize: 13,
    color: '#9BA8B8',
  },
  fullDegreeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  fullDegreeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreButton: {
    padding: 8,
  },
  fullContentSection: {
    padding: 20,
  },
  fullContent: {
    fontSize: 17,
    lineHeight: 26,
    color: '#ECEFF4',
    marginBottom: 20,
  },
  fullTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fullTag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  fullTagText: {
    fontSize: 14,
    color: '#00E5FF',
    fontWeight: '500',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(155, 168, 184, 0.08)',
    backgroundColor: '#111820',
  },
  statText: {
    fontSize: 14,
    color: '#9BA8B8',
  },
  statNumber: {
    fontWeight: '600',
    color: '#ECEFF4',
  },
  statDivider: {
    fontSize: 14,
    color: '#5F6D7E',
    marginHorizontal: 12,
  },
  actionsBar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 168, 184, 0.08)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  actionDivider: {
    width: 1,
    backgroundColor: 'rgba(155, 168, 184, 0.08)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9BA8B8',
  },
  actionTextActive: {
    color: '#FF6B9D',
  },
  commentsSection: {
    flex: 1,
    padding: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ECEFF4',
    marginBottom: 20,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCommentsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9BA8B8',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyCommentsSubtext: {
    fontSize: 14,
    color: '#5F6D7E',
  },
});
