import { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Pressable, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useAnimatedKeyboard, 
  useAnimatedStyle, 
  withSpring, 
  useDerivedValue 
} from 'react-native-reanimated';
import { Node, Notification, Pill, useMetaActions, type ActionType, type NodeData, Avatar } from '@ariob/ripple';
import { useAuth, create } from '@ariob/core';
import { router } from 'expo-router';

// Initial companion node
const INITIAL_COMPANION: NodeData = {
  id: 'message-ripple-genesis',
  type: 'message',
  author: 'Ripple',
  timestamp: 'Just now',
  degree: 0,
  avatar: 'sparkles',
  message: {
    id: 'msg-1',
    messages: [
      { id: 'r0', from: 'them', content: "Protocol initialized.", time: '00:00' },
      { id: 'r1', from: 'them', content: "Hi! I'm Ripple, your AI companion.", time: 'Now' },
      { id: 'r2', from: 'them', content: "I'm connected to the mesh. Anchor your identity to start.", time: 'Now' }
    ],
  },
};

const DEGREES = [
  { id: 0, label: 'Me' },
  { id: 1, label: 'Friends' },
  { id: 2, label: 'Global' },
];

export default function Index() {
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  
  // Fast, snappy keyboard transition for node movement
  const keyboardHeight = useDerivedValue(() => {
    return withSpring(keyboard.height.value, {
      damping: 50,    // Balanced damping
      stiffness: 500, // High stiffness for speed
      mass: 0.8,      // Low mass for quick start
      overshootClamping: true,
    });
  });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardHeight.value,
  }));

  const { isAuthenticated, user } = useAuth();
  const [feed, setFeed] = useState<NodeData[]>([INITIAL_COMPANION]);
  const [degree, setDegree] = useState(0);
  const [notification, setNotification] = useState<any>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  const meta = useMetaActions(degree, isAuthenticated, null, focusedNodeId);

  const handleAnchor = async (handle: string) => {
    const result = await create(handle);
    if (result.ok) {
      setFeed(prev => prev.map(n => 
        n.id === 'creation-node' 
        ? { 
            ...n, 
            type: 'profile', 
            timestamp: 'Just now',
            profile: { avatar: handle[0].toUpperCase(), handle: '@' + handle, mode: 'view' }
          }
        : n
      ));
      setNotification(null);
      setFocusedNodeId(null);
    }
  };

  // Initial onboarding nudge
  useEffect(() => {
    if (!isAuthenticated) {
      setTimeout(() => {
        setNotification({
          id: 'sys-setup',
          title: 'System Suggestion',
          message: 'Identity anchor required to unlock full graph features.',
          icon: 'lock',
          actionLabel: 'Initialize'
        });
      }, 1500);
    }
  }, [isAuthenticated]);

  const handleAction = (action: ActionType) => {
    switch (action) {
      case 'create':
        if (!isAuthenticated) {
          setFeed(prev => {
            if (prev.find(n => n.id === 'creation-node')) return prev;
            const newNode = {
              id: 'creation-node',
              type: 'profile',
              author: 'System',
              timestamp: 'Now',
              degree: 0,
              profile: { avatar: '?', handle: 'Anchor Identity', mode: 'create' }
            } as NodeData;
            // Auto-focus creation node
            setTimeout(() => setFocusedNodeId('creation-node'), 100);
            return [...prev, newNode];
          });
        } else {
          // Handle regular creation
        }
        return;
      case 'close':
        if (focusedNodeId === 'creation-node') {
          setFeed(prev => prev.filter(n => n.id !== 'creation-node'));
        }
        setFocusedNodeId(null);
        return;
      case 'settings':
        router.push('/profile');
        return;
      case 'profile_settings':
      case 'appearance':
      case 'qr_code':
      case 'saved_items':
      case 'find_friends':
      case 'trending':
      case 'search_global':
      case 'auth_options':
      case 'more':
        console.log(`[Pill] ${action} tapped`);
        return;
      case 'log_out':
        console.log('[Pill] log out requested');
        return;
      case 'reply_full':
      case 'edit_profile':
      case 'connect':
      case 'back':
      case 'options':
        console.log(`[Pill] action ${action} not wired yet`);
        return;
      default:
        console.log('[Pill] action ->', action);
    }
  };

  const handleNodePress = (item: NodeData) => {
    if (item.type === 'message') {
      router.push(`/message/${item.id}`);
    } else if (item.type === 'profile') {
      router.push('/profile');
    } else {
      router.push(`/thread/${item.id}`);
    }
  };

  const handleNodeFocus = (nodeId: string | null) => {
    setFocusedNodeId(nodeId);
  };

  const handleReply = (nodeId: string, text: string) => {
    if (nodeId === INITIAL_COMPANION.id) {
       setFeed(prev => prev.map(node => {
        if (node.id === nodeId && node.message) {
          return {
            ...node,
            message: {
              ...node.message,
              messages: [...node.message.messages, { id: `ai-${Date.now()}`, from: 'them', content: `Echo: ${text}`, time: 'Now' }]
            }
          };
        }
        return node;
      }));
    }
  };

  const renderItem = ({ item, index }: { item: NodeData; index: number }) => (
    <Node 
      data={item} 
      isLast={index === 0}
      onPress={() => handleNodePress(item)}
      onAnchor={handleAnchor}
      onFocus={handleNodeFocus}
      isFocused={focusedNodeId === item.id}
      onReply={(text) => handleReply(item.id, text)}
    />
  );

  // Filter feed by degree
  const visibleFeed = feed.filter(item => item.degree === degree);

  return (
    <Animated.View 
      style={[styles.container, animatedContainerStyle]}
    >
      {/* Top Bar: Profile & Filter (Z-50) */}
      <View style={[styles.filterContainer, { top: insets.top + 8 }]}>
        {/* Profile Access */}
        {isAuthenticated && (
          <Pressable 
            onPress={() => router.push('/profile')}
            style={styles.profileButton}
          >
            <Avatar 
              size="small" 
              char={user?.alias?.[0]?.toUpperCase() || '?'}
            />
          </Pressable>
        )}

        {/* Degree Filter */}
        <View style={styles.filter}>
          {DEGREES.map(d => (
            <Pressable 
              key={d.id}
              onPress={() => setDegree(d.id)}
              style={[
                styles.filterButton,
                degree === d.id && styles.filterActive
              ]}
            >
              <Text style={[
                styles.filterText,
                degree === d.id && styles.filterTextActive
              ]}>
                {d.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Notification (Z-40) */}
      {notification && (
        <Notification 
          data={notification} 
          onDismiss={() => setNotification(null)}
          onAction={() => handleAction('create')}
        />
      )}

      {/* Feed (Z-10) */}
      <FlatList
        data={[...visibleFeed].reverse()}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />

      {/* Pill (Z-70) */}
      <Pill 
        left={meta.left || undefined}
        center={meta.center}
        right={meta.right || undefined}
        onAction={handleAction}
        isActive={!!focusedNodeId}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  filterContainer: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    pointerEvents: 'box-none' as const,
    height: 44,
  },
  profileButton: {
    position: 'absolute',
    left: 20,
    pointerEvents: 'auto' as const,
  },
  filter: {
    flexDirection: 'row' as const,
    backgroundColor: 'rgba(22, 24, 28, 0.95)',
    borderRadius: 100,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    pointerEvents: 'auto' as const,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
  },
  filterActive: {
    backgroundColor: '#E7E9EA',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#71767B',
  },
  filterTextActive: {
    color: '#000',
  },
  feedContainer: {
    paddingHorizontal: 12,
    paddingBottom: 100,
    paddingTop: 120,
  },
});
