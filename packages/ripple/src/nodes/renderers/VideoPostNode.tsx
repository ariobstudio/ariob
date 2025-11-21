/**
 * Video Post Node Renderer
 *
 * Renders video posts in three view modes:
 * - preview: Thumbnail with play icon in feed
 * - full: Video player with comments
 * - immersive: TikTok-style full-screen swipeable view
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { VideoPost } from '../../schemas';
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

// Helper to format duration (seconds to MM:SS)
function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Preview mode: Thumbnail with play button
 */
function PreviewView({ data, nodeId, onPress }: NodeRenderProps<VideoPost>) {
  const thumbnailUrl = data.video.thumbnail || data.video.url;

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

        <View style={styles.videoBadge}>
          <Ionicons name="play" size={12} color="#FFFFFF" />
          <Text style={styles.videoBadgeText}>Video</Text>
        </View>
      </View>

      {/* Video Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <ImageBackground
          source={{ uri: thumbnailUrl }}
          style={styles.thumbnail}
          imageStyle={styles.thumbnailImage}
        >
          {/* Play Button Overlay */}
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={32} color="#FFFFFF" />
            </View>
          </View>

          {/* Duration Badge */}
          {data.video.duration && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{formatDuration(data.video.duration)}</Text>
            </View>
          )}
        </ImageBackground>
      </View>

      {/* Caption */}
      {data.caption && (
        <Text style={styles.previewCaption} numberOfLines={2}>
          {data.caption}
        </Text>
      )}

      {/* Quick Stats */}
      <View style={styles.previewStats}>
        <View style={styles.statItem}>
          <Ionicons name="play-outline" size={14} color="#8E8E93" />
          <Text style={styles.statText}>0 views</Text>
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
 * Full mode: Video player with comments
 */
function FullView({ data, nodeId, navigation }: NodeRenderProps<VideoPost>) {
  return (
    <View style={styles.fullContainer}>
      {/* Header */}
      <View style={styles.fullHeader}>
        <Pressable onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.fullTitle}>Video</Text>
        <Pressable style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Video Player Placeholder */}
      <View style={styles.videoPlayerContainer}>
        <View style={styles.videoPlaceholder}>
          <Ionicons name="play-circle" size={64} color="#FFFFFF" />
          <Text style={styles.placeholderText}>Video Player</Text>
          <Text style={styles.placeholderSubtext}>
            Will integrate expo-video here
          </Text>
        </View>
      </View>

      {/* Author Info */}
      <View style={styles.authorSection}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTextLarge}>
            {(data.authorAlias || data.author || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.fullAuthorName}>{data.authorAlias || data.author}</Text>
          <Text style={styles.fullTimestamp}>{formatTime(data.created)}</Text>
        </View>
        <Pressable style={styles.followButton}>
          <Text style={styles.followButtonText}>Follow</Text>
        </Pressable>
      </View>

      {/* Caption */}
      {data.caption && (
        <View style={styles.captionSection}>
          <Text style={styles.fullCaption}>{data.caption}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={styles.actionButton}>
          <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionCount}>0</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={22} color="#FFFFFF" />
          <Text style={styles.actionCount}>0</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <Ionicons name="share-outline" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>Comments</Text>
        <Text style={styles.commentsEmpty}>No comments yet</Text>
      </View>
    </View>
  );
}

/**
 * Immersive mode: TikTok-style full-screen view
 * Note: This will be enhanced with actual video player in Phase 2
 */
function ImmersiveView({ data, nodeId, navigation }: NodeRenderProps<VideoPost>) {
  return (
    <View style={styles.immersiveContainer}>
      {/* Video Player (Full Screen) - Placeholder */}
      <View style={styles.immersiveVideo}>
        <View style={styles.videoPlaceholder}>
          <Ionicons name="play-circle" size={80} color="#FFFFFF" />
          <Text style={styles.immersivePlaceholderText}>
            TikTok-Style Video Player
          </Text>
        </View>
      </View>

      {/* Top Bar */}
      <View style={styles.immersiveTopBar}>
        <Pressable
          onPress={() => navigation?.goBack()}
          style={styles.immersiveBackButton}
        >
          <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Side Actions */}
      <View style={styles.immersiveSideActions}>
        {/* Author Avatar */}
        <Pressable style={styles.immersiveAvatar}>
          <Text style={styles.immersiveAvatarText}>
            {(data.authorAlias || data.author || '?').charAt(0).toUpperCase()}
          </Text>
          <View style={styles.immersiveFollowButton}>
            <Ionicons name="add" size={16} color="#000000" />
          </View>
        </Pressable>

        {/* Like Button */}
        <Pressable style={styles.immersiveActionButton}>
          <Ionicons name="heart" size={32} color="#FFFFFF" />
          <Text style={styles.immersiveActionText}>0</Text>
        </Pressable>

        {/* Comment Button */}
        <Pressable style={styles.immersiveActionButton}>
          <Ionicons name="chatbubble" size={28} color="#FFFFFF" />
          <Text style={styles.immersiveActionText}>0</Text>
        </Pressable>

        {/* Share Button */}
        <Pressable style={styles.immersiveActionButton}>
          <Ionicons name="paper-plane" size={28} color="#FFFFFF" />
          <Text style={styles.immersiveActionText}>Share</Text>
        </Pressable>

        {/* More Button */}
        <Pressable style={styles.immersiveActionButton}>
          <Ionicons name="ellipsis-horizontal" size={28} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Bottom Info */}
      <View style={styles.immersiveBottomInfo}>
        <Text style={styles.immersiveAuthor}>@{data.authorAlias || data.author}</Text>
        {data.caption && (
          <Text style={styles.immersiveCaption} numberOfLines={2}>
            {data.caption}
          </Text>
        )}
        {data.soundtrack && (
          <View style={styles.immersiveSoundtrack}>
            <Ionicons name="musical-notes" size={14} color="#FFFFFF" />
            <Text style={styles.immersiveSoundtrackText}>{data.soundtrack}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Video Post Node Renderer
 */
export const VideoPostNodeRenderer: NodeRenderer<VideoPost> = {
  preview: PreviewView,
  full: FullView,
  immersive: ImmersiveView, // TikTok-style full-screen
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
    marginBottom: 12,
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
  },
  dot: {
    fontSize: 15,
    color: '#8E8E93',
  },
  timestamp: {
    fontSize: 13,
    color: '#8E8E93',
  },
  videoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF375F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  thumbnailContainer: {
    marginBottom: 8,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 400,
  },
  thumbnailImage: {
    borderRadius: 12,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewCaption: {
    fontSize: 15,
    lineHeight: 20,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  previewStats: {
    flexDirection: 'row',
    gap: 16,
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
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  backButton: {
    padding: 4,
  },
  fullTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginRight: 32,
  },
  moreButton: {
    padding: 8,
  },
  videoPlayerContainer: {
    backgroundColor: '#000000',
    aspectRatio: 9 / 16,
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
  },
  placeholderText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  authorSection: {
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
  authorInfo: {
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
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#0A84FF',
    borderRadius: 20,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  captionSection: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  fullCaption: {
    fontSize: 15,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  actionButtons: {
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
  actionCount: {
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

  // Immersive View Styles (TikTok-style)
  immersiveContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  immersiveVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  immersivePlaceholderText: {
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 16,
  },
  immersiveTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 60,
  },
  immersiveBackButton: {
    padding: 8,
  },
  immersiveSideActions: {
    position: 'absolute',
    right: 12,
    bottom: 120,
    alignItems: 'center',
    gap: 20,
  },
  immersiveAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  immersiveAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  immersiveFollowButton: {
    position: 'absolute',
    bottom: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF375F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  immersiveActionButton: {
    alignItems: 'center',
    gap: 2,
  },
  immersiveActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  immersiveBottomInfo: {
    position: 'absolute',
    left: 12,
    right: 80,
    bottom: 120,
  },
  immersiveAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  immersiveCaption: {
    fontSize: 14,
    lineHeight: 18,
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  immersiveSoundtrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  immersiveSoundtrackText: {
    fontSize: 13,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
