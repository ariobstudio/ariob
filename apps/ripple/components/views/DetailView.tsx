/**
 * DetailView Component
 *
 * Full view modal/page for displaying content in detail with interactions.
 * Shows the full node renderer in 'full' mode.
 */

import React from 'react';
import { Modal, View, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NodeRenderer, useNodeNavigation, type FeedItem } from '@ariob/ripple';

export interface DetailViewProps {
  /** Item to display */
  item: FeedItem | null;

  /** Whether the view is visible */
  visible: boolean;

  /** Callback when close is requested */
  onClose: () => void;
}

/**
 * DetailView - Modal detail view for content
 */
export function DetailView({ item, visible, onClose }: DetailViewProps) {
  const navigation = useNodeNavigation();

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Close Button */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Full Node Renderer */}
        <NodeRenderer item={item} viewMode="full" />
      </SafeAreaView>
    </Modal>
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
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
