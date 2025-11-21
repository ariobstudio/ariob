/**
 * Image Post Node Renderer
 *
 * Renders image posts with gallery support
 * - preview: Grid of images (max 4) in feed
 * - full: Full gallery with swipe
 * - immersive: Not supported (uses full)
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ImagePost } from '../../schemas';
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
 * Preview: Grid layout showing up to 4 images
 */
function PreviewView({ data, nodeId, onPress }: NodeRenderProps<ImagePost>) {
  const imageCount = data.images.length;
  const displayImages = data.images.slice(0, 4);

  return (
    <Pressable onPress={onPress} style={styles.previewContainer}>
      {/* Header */}
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

      {/* Caption */}
      {data.caption && (
        <Text style={styles.previewCaption} numberOfLines={2}>
          {data.caption}
        </Text>
      )}

      {/* Image Grid */}
      <View style={[styles.imageGrid, imageCount === 1 && styles.imageGridSingle]}>
        {displayImages.map((img, idx) => (
          <View
            key={idx}
            style={[
              styles.gridImage,
              imageCount === 1 && styles.gridImageSingle,
              imageCount === 2 && styles.gridImageHalf,
              imageCount >= 3 && styles.gridImageQuarter,
            ]}
          >
            <ImageBackground source={{ uri: img.url }} style={styles.imageBg} imageStyle={styles.imageBgStyle}>
              {idx === 3 && imageCount > 4 && (
                <View style={styles.moreOverlay}>
                  <Text style={styles.moreText}>+{imageCount - 4}</Text>
                </View>
              )}
            </ImageBackground>
          </View>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="heart-outline" size={16} color="#8E8E93" />
          <Text style={styles.statText}>0</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble-outline" size={16} color="#8E8E93" />
          <Text style={styles.statText}>0</Text>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Full: Gallery view with horizontal scroll
 */
function FullView({ data, nodeId, navigation }: NodeRenderProps<ImagePost>) {
  return (
    <ScrollView style={styles.fullContainer} contentContainerStyle={styles.fullContent}>
      {/* Header */}
      <View style={styles.fullHeader}>
        <Pressable onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>
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
          <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Image Gallery */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.gallery}
      >
        {data.images.map((img, idx) => (
          <View key={idx} style={styles.galleryImageContainer}>
            <ImageBackground
              source={{ uri: img.url }}
              style={styles.galleryImage}
              imageStyle={styles.galleryImageStyle}
              resizeMode="contain"
            >
              {/* Image Counter */}
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {idx + 1} / {data.images.length}
                </Text>
              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>

      {/* Caption */}
      {data.caption && (
        <View style={styles.captionSection}>
          <Text style={styles.fullCaption}>{data.caption}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.actionButton}>
          <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>Like</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={22} color="#FFFFFF" />
          <Text style={styles.actionText}>Comment</Text>
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
    </ScrollView>
  );
}

export const ImagePostNodeRenderer: NodeRenderer<ImagePost> = {
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
  header: {
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
  meta: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 13,
    color: '#8E8E93',
  },
  previewCaption: {
    fontSize: 15,
    lineHeight: 20,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    marginBottom: 8,
  },
  imageGridSingle: {
    aspectRatio: 4 / 3,
  },
  gridImage: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridImageSingle: {
    width: '100%',
    height: '100%',
  },
  gridImageHalf: {
    width: 'calc(50% - 1px)',
    aspectRatio: 1,
  },
  gridImageQuarter: {
    width: 'calc(50% - 1px)',
    aspectRatio: 1,
  },
  imageBg: {
    width: '100%',
    height: '100%',
  },
  imageBgStyle: {
    borderRadius: 8,
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stats: {
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

  // Full View
  fullContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullContent: {
    paddingBottom: 40,
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
    marginRight: 8,
  },
  avatarLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarTextLarge: {
    fontSize: 16,
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
  },
  fullTimestamp: {
    fontSize: 13,
    color: '#8E8E93',
  },
  moreButton: {
    padding: 8,
  },
  gallery: {
    maxHeight: 500,
  },
  galleryImageContainer: {
    width: 375, // Will adjust based on screen
    height: 500,
  },
  galleryImage: {
    flex: 1,
  },
  galleryImageStyle: {
    borderRadius: 0,
  },
  imageCounter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    fontSize: 13,
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
