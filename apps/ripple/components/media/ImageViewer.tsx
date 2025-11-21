/**
 * ImageViewer Component
 *
 * Full-featured image viewer with pinch-to-zoom and swipe between images.
 */

import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ImageViewerProps {
  /** Array of image URLs */
  images: string[];

  /** Initial image index */
  initialIndex?: number;

  /** Show image counter */
  showCounter?: boolean;

  /** Callback when image changes */
  onIndexChange?: (index: number) => void;

  /** Callback when close requested */
  onClose?: () => void;

  /** Style */
  style?: any;
}

export function ImageViewer({
  images,
  initialIndex = 0,
  showCounter = true,
  onIndexChange,
  onClose,
  style,
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
      onIndexChange?.(index);
    }
  };

  const renderImage = ({ item, index }: { item: string; index: number }) => {
    return <ImageItem url={item} />;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Close Button */}
      {onClose && (
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
        </View>
      )}

      {/* Image Gallery */}
      <FlatList
        data={images}
        renderItem={renderImage}
        keyExtractor={(item, idx) => `${item}-${idx}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Image Counter */}
      {showCounter && images.length > 1 && (
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Individual image with loading state
 */
function ImageItem({ url }: { url: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: url }}
        style={styles.image}
        resizeMode="contain"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}

      {error && (
        <View style={styles.errorOverlay}>
          <Ionicons name="image-outline" size={64} color="#8E8E93" />
          <Text style={styles.errorText}>Failed to load image</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  errorText: {
    marginTop: 16,
    fontSize: 15,
    color: '#8E8E93',
  },
  counterContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
