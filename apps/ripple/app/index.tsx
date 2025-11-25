import { useState, useEffect } from 'react';
import { View, FlatList, Pressable, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useAnimatedKeyboard, 
  useAnimatedStyle, 
  withSpring, 
  useDerivedValue 
} from 'react-native-reanimated';
import { Node, Notification, Pill, useMetaActions, type ActionType, type NodeData, Avatar } from '@ariob/ripple';
import { useAuth, create, leave } from '@ariob/core';
import { router } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

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

const CREATION_NODE_ID = 'creation-node';
const AUTH_NODE_ID = 'auth-node';
const PROFILE_NODE_ID = 'profile-node';

const buildCreationNode = (): NodeData => ({
  id: CREATION_NODE_ID,
  type: 'profile',
  author: 'System',
  timestamp: 'Now',
  degree: 0,
  profile: { avatar: '?', handle: 'Anchor Identity', mode: 'create' },
});

const buildAuthNode = (): NodeData => ({
  id: AUTH_NODE_ID,
  type: 'auth',
  author: 'System',
  timestamp: 'Now',
  degree: 0,
  auth: {},
});

const buildProfileNode = (alias: string, pub?: string): NodeData => {
  const safeAlias = alias || 'You';
  const avatar = safeAlias[0]?.toUpperCase() || 'Y';
  return {
    id: PROFILE_NODE_ID,
    type: 'profile',
    author: safeAlias,
    timestamp: 'Just now',
    degree: 0,
    avatar,
    handle: `@${safeAlias.replace(/\s+/g, '').toLowerCase()}`,
    profile: {
      avatar,
      handle: `@${safeAlias.replace(/\s+/g, '').toLowerCase()}`,
      pubkey: pub,
      mode: 'view',
    },
  };
};

const upsertNode = (nodes: NodeData[], node: NodeData) => {
  const filtered = nodes.filter((item) => item.id !== node.id);
  return [...filtered, node];
};

const removeNodeById = (nodes: NodeData[], id: string) =>
  nodes.filter((node) => node.id !== id);

const DEGREES = [
  { id: 0, label: 'Me' },
  { id: 1, label: 'Friends' },
  { id: 2, label: 'Global' },
];

export default function Index() {
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  const { theme } = useUnistyles();
  
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
  const [isCreating, setIsCreating] = useState(false);
  const hasProfile = feed.some(
    (node) => node.id === PROFILE_NODE_ID || (node.type === 'profile' && node.profile?.mode === 'view'),
  );
  const meta = useMetaActions(degree, hasProfile, null, focusedNodeId);

  const handleAnchor = async (alias: string) => {
    const result = await create(alias);
    if (result.ok) {
      const profileNode = buildProfileNode(result.value.alias, result.value.pub);
      setFeed((prev) => upsertNode(removeNodeById(prev, CREATION_NODE_ID), profileNode));
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

  useEffect(() => {
    setFeed((prev) => {
      let next = prev.some((node) => node.id === INITIAL_COMPANION.id)
        ? [...prev]
        : [INITIAL_COMPANION, ...prev];
      next = removeNodeById(next, PROFILE_NODE_ID);

      if (!isAuthenticated || !user) {
        next = removeNodeById(next, AUTH_NODE_ID);
        next = removeNodeById(next, CREATION_NODE_ID);
        return next;
      }

      const profileNode = buildProfileNode(user.alias || 'You', user.pub);
      next = removeNodeById(next, AUTH_NODE_ID);
      next = removeNodeById(next, CREATION_NODE_ID);
      return upsertNode(next, profileNode);
    });

    if (!isAuthenticated) {
      setFocusedNodeId(null);
    }
  }, [isAuthenticated, user?.alias, user?.pub]);

  const openCreationNode = () => {
    setFeed((prev) => {
      if (prev.some((node) => node.id === CREATION_NODE_ID)) {
        return prev;
      }
      return upsertNode(removeNodeById(prev, AUTH_NODE_ID), buildCreationNode());
    });
    setFocusedNodeId(CREATION_NODE_ID);
  };

  const openAuthNode = () => {
    setFeed((prev) => {
      if (prev.some((node) => node.id === AUTH_NODE_ID)) {
        return prev;
      }
      return upsertNode(removeNodeById(prev, CREATION_NODE_ID), buildAuthNode());
    });
    setFocusedNodeId(AUTH_NODE_ID);
  };

  const handleAction = (action: ActionType) => {
    switch (action) {
      case 'create':
        if (!isAuthenticated) {
          openCreationNode();
        } else {
          setIsCreating((prev) => !prev);
          setFocusedNodeId(null);
        }
        return;
      case 'close':
        if (focusedNodeId === CREATION_NODE_ID || focusedNodeId === AUTH_NODE_ID) {
          setFeed((prev) => prev.filter((n) => n.id !== focusedNodeId));
        }
        setFocusedNodeId(null);
        setIsCreating(false);
        return;
      case 'settings':
        if (isAuthenticated) {
          router.push('/profile');
        }
        return;
      case 'auth_options':
        if (!isAuthenticated) {
          openAuthNode();
        } else {
          router.push('/import-keys');
        }
        return;
      case 'profile_settings':
      case 'appearance':
      case 'qr_code':
      case 'saved_items':
      case 'find_friends':
      case 'trending':
      case 'search_global':
      case 'more':
        console.log(`[Pill] ${action} tapped`);
        return;
      case 'log_out':
        leave();
        return;
      case 'reply_full':
      case 'edit_profile':
      case 'connect':
      case 'back':
        console.log(`[Pill] action ${action} not wired yet`);
        return;
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
      if (isAuthenticated) {
        router.push('/profile');
      } else {
        openCreationNode();
      }
    } else if (item.type === 'auth') {
      router.push('/import-keys');
    } else {
      router.push(`/thread/${item.id}`);
    }
  };

  const handleNodeFocus = (nodeId: string | null) => {
    setFocusedNodeId(nodeId);
  };

  const handleAvatarPress = (item: NodeData) => {
    if (item.author === 'Ripple') {
      router.push('/user/Ripple');
    } else if (user && (item.author === user.alias || item.author === 'You')) {
      if (isAuthenticated) {
        router.push('/profile');
      } else {
        openCreationNode();
      }
    } else if (item.author) {
      if (isAuthenticated) {
        router.push(`/user/${item.author}`);
      } else {
        openCreationNode();
      }
    }
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
      onAvatarPress={() => handleAvatarPress(item)}
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

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.surface,
    borderRadius: 100,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    backgroundColor: theme.colors.textPrimary,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
  },
  filterTextActive: {
    color: theme.colors.background,
  },
  feedContainer: {
    paddingHorizontal: 12,
    paddingBottom: 100,
    paddingTop: 120,
  },
}));
