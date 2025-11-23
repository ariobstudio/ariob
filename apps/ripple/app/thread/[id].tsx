import { useLocalSearchParams, router } from 'expo-router';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Node, Pill, useMetaActions, type ActionType, type NodeData } from '@ariob/ripple';
import { useState, useEffect } from 'react';
import { useAuth } from '@ariob/core';
import Animated, { SlideInRight } from 'react-native-reanimated';

// Mock data fetcher
const getNode = (id: string): NodeData => {
  return {
    id,
    type: 'message',
    author: 'Ripple',
    timestamp: 'Just now',
    degree: 0,
    avatar: 'sparkles',
    message: {
      id: 'msg-1',
      messages: [
        { id: 'r0', from: 'them', content: "This is the full thread view.", time: '00:00' },
        { id: 'r1', from: 'them', content: "You navigated here from the feed.", time: 'Now' },
      ],
    },
  };
};

export default function Thread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  
  const [data, setData] = useState<NodeData | null>(null);
  
  useEffect(() => {
    if (id) {
      setData(getNode(id));
    }
  }, [id]);

  // Full View Context for Pill
  const fullViewData = {
    author: data?.author,
    type: data?.type,
    isMe: false, // Check logic here later
  };

  const meta = useMetaActions(0, isAuthenticated, fullViewData);

  const handleAction = (action: ActionType) => {
    switch (action) {
      case 'back':
        router.back();
        return;
      case 'options':
        console.log('Options tapped');
        return;
      case 'reply_full':
        console.log('Reply full tapped');
        return;
      default:
        console.log('Thread action:', action);
    }
  };

  if (!data) return null;

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[styles.content, { paddingTop: insets.top }]}
        entering={SlideInRight}
      >
        <Node 
          data={data} 
          isLast={true}
          // No press handler here to prevent recursion
        />
        
        <View style={styles.comments}>
          <Text style={styles.commentHeader}>Replies coming soon...</Text>
        </View>
      </Animated.View>

      <Pill 
        left={meta.left || undefined}
        center={meta.center}
        right={meta.right || undefined}
        onAction={handleAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  comments: {
    marginTop: 24,
    paddingLeft: 24,
    opacity: 0.5,
  },
  commentHeader: {
    color: '#71767B',
    fontSize: 14,
  },
});

