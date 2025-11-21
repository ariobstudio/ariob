/**
 * ImmersiveView Component
 *
 * Full-screen immersive view for specialized content (videos, DMs).
 * Handles TikTok-style video viewing and chat interfaces.
 */

import React from 'react';
import { Modal, View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { NodeRenderer, type FeedItem } from '@ariob/ripple';

export interface ImmersiveViewProps {
  /** Item to display */
  item: FeedItem | null;

  /** Whether the view is visible */
  visible: boolean;

  /** Callback when close is requested */
  onClose: () => void;
}

/**
 * ImmersiveView - Full-screen specialized view
 *
 * Renders nodes in immersive mode:
 * - Videos: TikTok-style vertical swipeable
 * - DMs: Full chat interface
 */
export function ImmersiveView({ item, visible, onClose }: ImmersiveViewProps) {
  if (!item) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      {/* Hide status bar for true full-screen */}
      <StatusBar hidden />

      <SafeAreaView style={styles.container}>
        {/* Immersive Node Renderer */}
        <NodeRenderer item={item} viewMode="immersive" />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
