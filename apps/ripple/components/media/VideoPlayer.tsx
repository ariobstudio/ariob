/**
 * VideoPlayer Component
 *
 * Full-featured video player using expo-video.
 * Supports standard and TikTok-style immersive playback.
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { VideoView, useVideoPlayer, type VideoSource } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface VideoPlayerProps {
  /** Video source URL */
  source: string;

  /** Video thumbnail URL (shown while loading) */
  thumbnail?: string;

  /** Auto-play when mounted */
  autoPlay?: boolean;

  /** Loop video playback */
  loop?: boolean;

  /** Muted by default */
  muted?: boolean;

  /** Show controls */
  showControls?: boolean;

  /** Immersive mode (TikTok-style, minimal UI) */
  immersive?: boolean;

  /** Callback when video ends */
  onEnd?: () => void;

  /** Callback when video is ready */
  onReady?: () => void;

  /** Style */
  style?: any;
}

export function VideoPlayer({
  source,
  thumbnail,
  autoPlay = false,
  loop = false,
  muted = false,
  showControls = true,
  immersive = false,
  onEnd,
  onReady,
  style,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isControlsVisible, setIsControlsVisible] = useState(!immersive);

  // Create video player
  const player = useVideoPlayer(source as VideoSource, (player) => {
    player.loop = loop;
    player.muted = muted;
    if (autoPlay) {
      player.play();
    }
  });

  // Handle loading state
  useEffect(() => {
    if (player) {
      const statusListener = player.addListener('statusChange', (status) => {
        if (status === 'loading') {
          setIsLoading(true);
        } else if (status === 'readyToPlay') {
          setIsLoading(false);
          onReady?.();
        } else if (status === 'error') {
          setIsLoading(false);
          setError('Failed to load video');
        }
      });

      return () => {
        statusListener.remove();
      };
    }
  }, [player, onReady]);

  // Handle video end
  useEffect(() => {
    if (player) {
      const playingListener = player.addListener('playingChange', (isPlaying) => {
        if (!isPlaying && player.currentTime >= player.duration - 0.1) {
          onEnd?.();
        }
      });

      return () => {
        playingListener.remove();
      };
    }
  }, [player, onEnd]);

  // Toggle play/pause
  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Toggle mute
  const toggleMute = () => {
    player.muted = !player.muted;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Toggle controls visibility (for immersive mode)
  const toggleControls = () => {
    if (immersive) {
      setIsControlsVisible(!isControlsVisible);
    }
  };

  if (error) {
    return (
      <View style={[styles.container, style, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <Pressable onPress={toggleControls} style={[styles.container, style]}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="contain"
        nativeControls={false}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          {thumbnail && <Text style={styles.loadingText}>Loading video...</Text>}
        </View>
      )}

      {/* Controls (shown based on mode) */}
      {showControls && (!immersive || isControlsVisible) && !isLoading && (
        <View style={[styles.controls, immersive && styles.controlsImmersive]}>
          {/* Play/Pause Button */}
          <Pressable onPress={togglePlayPause} style={styles.playButton}>
            <Ionicons
              name={player.playing ? 'pause' : 'play'}
              size={immersive ? 48 : 32}
              color="#FFFFFF"
            />
          </Pressable>

          {/* Mute Button */}
          <Pressable onPress={toggleMute} style={styles.muteButton}>
            <Ionicons
              name={player.muted ? 'volume-mute' : 'volume-high'}
              size={24}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
  },
  errorText: {
    marginTop: 12,
    fontSize: 15,
    color: '#FF3B30',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlsImmersive: {
    bottom: 40,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  muteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
