import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, FlatList, Pressable, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  useSharedValue,
  runOnJS,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Node, useBar, useMetaActions, type ActionType, type NodeData, Avatar } from '@ariob/ripple';
import { toast } from '@ariob/andromeda';
import { useAuth, create, leave, useCollection, graph } from '@ariob/core';
import { router, useFocusEffect } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { BlurView } from 'expo-blur';

// Import from centralized utilities
import { INITIAL_COMPANION, INITIAL_AI_MODEL_NODE, SYSTEM_NODE_IDS, formatTimestamp } from '../utils/mockData';
import { DEGREE_LABELS } from '../utils/constants';
import { setBarInputMode, setOpenAccountSheet } from '../config';

// Import AI hook and settings
import { useRippleAI, useAISettings } from '@ariob/ml';

// Import shared conversation store
import { useRippleConversation } from '../stores/rippleConversation';

// Use system node IDs from constants
const {
  CREATION_NODE: CREATION_NODE_ID,
  AUTH_NODE: AUTH_NODE_ID,
  PROFILE_NODE: PROFILE_NODE_ID,
  AI_MODEL_NODE: AI_MODEL_NODE_ID
} = SYSTEM_NODE_IDS;

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

const DEGREES = DEGREE_LABELS;

export default function Index() {
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  const { theme } = useUnistyles();
  
  // Fast, snappy keyboard transition for node movement
  const keyboardHeight = useDerivedValue(() => {
    return withSpring(keyboard.height.value, {
      damping: 50,
      stiffness: 500,
      mass: 0.8,
      overshootClamping: true,
    });
  });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardHeight.value,
  }));

  const { isAuthenticated, user } = useAuth();

  // Gun graph posts
  const { items: gunPosts, isLoading: postsLoading, add: addPost } = useCollection({
    path: 'posts',
    enabled: isAuthenticated,
  });

  // System nodes
  const [systemNodes, setSystemNodes] = useState<NodeData[]>([INITIAL_AI_MODEL_NODE]);

  // Combined feed
  const feed = useMemo(() => {
    const gunNodeData: NodeData[] = gunPosts.map((item) => ({
      id: item.id,
      type: 'post' as const,
      author: item.data?.author || 'Unknown',
      timestamp: item.data?.created ? formatTimestamp(item.data.created) : 'Unknown',
      degree: item.data?.degree ?? 1,
      content: item.data?.content,
      ...item.data,
    }));
    return [...systemNodes, ...gunNodeData];
  }, [systemNodes, gunPosts]);

  const setFeed = setSystemNodes;

  const [degree, setDegree] = useState(0);
  const [showedOnboardingToast, setShowedOnboardingToast] = useState(false);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Shared conversation store
  const rippleMessages = useRippleConversation((state) => state.messages);
  const rippleIsThinking = useRippleConversation((state) => state.isThinking);
  const addUserMessage = useRippleConversation((state) => state.addUserMessage);
  const addAIMessage = useRippleConversation((state) => state.addAIMessage);
  const setRippleThinking = useRippleConversation((state) => state.setThinking);

  const pendingAIResponseRef = useRef(false);

  // Ripple AI companion
  const {
    response: aiResponse,
    isReady: aiIsReady,
    isGenerating: aiIsGenerating,
    isDownloading: aiIsDownloading,
    sendMessage: sendToAI,
    downloadProgress: aiDownloadProgress,
    error: aiError,
  } = useRippleAI();

  const { profile: aiProfile, setModel: setAIModel, modelOptions } = useAISettings();

  // Update AI model node with live progress data
  useEffect(() => {
    setFeed(prev => {
      const aiModelNode = prev.find(n => n.id === AI_MODEL_NODE_ID);
      if (!aiModelNode?.aiModel) return prev;

      const currentData = aiModelNode.aiModel;
      const selectedModel = aiProfile.hasSelectedModel ? aiProfile.modelId : null;

      if (
        currentData.selectedModel === selectedModel &&
        currentData.downloadProgress === aiDownloadProgress &&
        currentData.isDownloading === aiIsDownloading &&
        currentData.isReady === aiIsReady &&
        currentData.error === (aiError || null)
      ) {
        return prev;
      }

      return prev.map(node => {
        if (node.id === AI_MODEL_NODE_ID && node.aiModel) {
          return {
            ...node,
            aiModel: {
              ...node.aiModel,
              selectedModel,
              downloadProgress: aiDownloadProgress,
              isDownloading: aiIsDownloading,
              isReady: aiIsReady,
              error: aiError || null,
            }
          };
        }
        return node;
      });
    });
  }, [aiDownloadProgress, aiIsReady, aiIsDownloading, aiProfile.modelId, aiProfile.hasSelectedModel, aiError]);

  const handleSelectModel = useCallback((modelId: string) => {
    setAIModel(modelId as any);
    toast.info(`Downloading ${modelOptions.find(m => m.id === modelId)?.name || modelId}...`);
  }, [setAIModel, modelOptions]);

  const hasProfile = feed.some(
    (node) => node.id === PROFILE_NODE_ID || (node.type === 'profile' && node.profile?.mode === 'view'),
  );
  const meta = useMetaActions(degree, hasProfile, null, focusedNodeId);

  // Swipe gesture for degree navigation
  const swipeTranslateX = useSharedValue(0);
  const SWIPE_THRESHOLD = 80;

  // Scroll-to-hide for degree filter
  const lastScrollY = useSharedValue(0);
  const filterVisible = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      const delta = currentY - lastScrollY.value;

      if (delta < -5 && currentY > 50) {
        filterVisible.value = withSpring(0, { damping: 20, stiffness: 300 });
      } else if (delta > 5) {
        filterVisible.value = withSpring(1, { damping: 20, stiffness: 300 });
      }

      lastScrollY.value = currentY;
    },
  });

  const filterAnimatedStyle = useAnimatedStyle(() => ({
    opacity: filterVisible.value,
    transform: [
      { translateY: interpolate(filterVisible.value, [0, 1], [-60, 0]) }
    ],
  }));

  const changeDegree = useCallback((newDegree: number) => {
    if (newDegree >= 0 && newDegree < DEGREES.length && newDegree !== degree) {
      if (Platform.OS === 'ios') {
        Haptics.selectionAsync();
      }
      setDegree(newDegree);
    }
  }, [degree]);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-20, 20])
    .onUpdate((event) => {
      swipeTranslateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) {
        runOnJS(changeDegree)(degree + 1);
      } else if (event.translationX > SWIPE_THRESHOLD) {
        runOnJS(changeDegree)(degree - 1);
      }
      swipeTranslateX.value = withSpring(0, { damping: 20, stiffness: 300 });
    });

  const bar = useBar();

  useFocusEffect(
    useCallback(() => {
      bar.configure({
        mode: 'action',
        left: meta.left ?? null,
        center: meta.main ?? null,
        right: meta.right ?? null,
        inputLeft: { name: 'attach', icon: 'attach', label: 'Attach' },
        placeholder: 'Reply...',
        isActive: !!focusedNodeId,
      });
    }, [meta.left, meta.main, meta.right, focusedNodeId])
  );

  const handleAnchor = async (alias: string) => {
    const result = await create(alias);
    if (result.ok) {
      const profileNode = buildProfileNode(result.value.alias, result.value.pub);
      setFeed((prev) => upsertNode(removeNodeById(prev, CREATION_NODE_ID), profileNode));
      setFocusedNodeId(null);
      toast.success('Identity anchored successfully');
    }
  };

  useEffect(() => {
    if (!isAuthenticated && !showedOnboardingToast) {
      const timer = setTimeout(() => {
        toast.info('Identity anchor required to unlock full graph features.', {
          action: {
            label: 'Initialize',
            onPress: () => handleAction('create'),
          },
        });
        setShowedOnboardingToast(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, showedOnboardingToast]);

  useEffect(() => {
    if (aiIsReady) {
      setFeed(prev => {
        let updated = prev.filter(node => node.id !== AI_MODEL_NODE_ID);
        if (!updated.some(node => node.id === INITIAL_COMPANION.id)) {
          const companionNode: NodeData = {
            ...INITIAL_COMPANION,
            message: {
              id: INITIAL_COMPANION.id,
              messages: rippleMessages,
            },
          };
          updated = [...updated, companionNode];
        }
        return updated;
      });
    }
  }, [aiIsReady]);

  const prevMessagesLengthRef = useRef(rippleMessages.length);
  useEffect(() => {
    if (rippleMessages.length !== prevMessagesLengthRef.current) {
      prevMessagesLengthRef.current = rippleMessages.length;
      setFeed(prev => prev.map(node => {
        if (node.id === INITIAL_COMPANION.id && node.message) {
          return {
            ...node,
            timestamp: 'Just now',
            message: {
              ...node.message,
              messages: rippleMessages,
            },
          };
        }
        return node;
      }));
    }
  }, [rippleMessages]);

  useEffect(() => {
    setFeed((prev) => {
      let next = [...prev];
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

  const openCreationNode = useCallback(() => {
    bar.openSheet('account');
  }, []);

  const openAuthNode = useCallback(() => {
    setFeed((prev) => {
      if (prev.some((node) => node.id === AUTH_NODE_ID)) {
        return prev;
      }
      return upsertNode(removeNodeById(prev, CREATION_NODE_ID), buildAuthNode());
    });
    setFocusedNodeId(AUTH_NODE_ID);
  }, []);

  const handleCreatePost = useCallback(async (content: string) => {
    if (!isAuthenticated || !user) {
      toast.info('Create an identity to start posting', {
        action: { label: 'Anchor', onPress: () => openCreationNode() },
      });
      return;
    }

    try {
      const result = await addPost({
        content,
        author: user.pub,
        authorAlias: user.alias || 'Anonymous',
        created: Date.now(),
        degree: 1, // Friends by default
        type: 'post',
      });

      if (result.ok) {
        toast.success('Post published to mesh');
        bar.setMode('action');
      } else {
        toast.warning('Failed to publish post');
      }
    } catch (err) {
      console.error('[Index] Post creation error:', err);
      toast.warning('Failed to publish post');
    }
  }, [isAuthenticated, user, addPost, openCreationNode]);

  const handleAction = useCallback((action: ActionType) => {
    switch (action) {
      case 'create':
        if (!isAuthenticated) {
          openCreationNode();
        } else {
          bar.configure({
            mode: 'input',
            placeholder: 'Write something...',
          });
          bar.setCallbacks({
            onSubmit: handleCreatePost,
            onCancel: () => bar.setMode('action'),
          });
        }
        return;
      case 'post':
        if (isAuthenticated) {
          bar.configure({
            mode: 'input',
            placeholder: 'Write something...',
          });
          bar.setCallbacks({
            onSubmit: handleCreatePost,
            onCancel: () => bar.setMode('action'),
          });
        } else {
          toast.info('Create an identity to start posting', {
            action: {
              label: 'Anchor',
              onPress: () => openCreationNode(),
            },
          });
        }
        return;
      case 'close':
        if (focusedNodeId === CREATION_NODE_ID || focusedNodeId === AUTH_NODE_ID) {
          setFeed((prev) => prev.filter((n) => n.id !== focusedNodeId));
        }
        setFocusedNodeId(null);
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
          router.push('/import-keys' as any);
        }
        return;
      case 'log_out':
        leave();
        return;
      default:
        console.log('[Pill] action ->', action);
    }
  }, [isAuthenticated, focusedNodeId, openCreationNode, openAuthNode, handleCreatePost]);

  useEffect(() => {
    setOpenAccountSheet(() => (bar as any).openSheet?.('account'));
    setBarInputMode(() => {
      if (isAuthenticated) {
        bar.configure({
          mode: 'input',
          placeholder: 'Write something...',
        });
        bar.setCallbacks({
          onSubmit: handleCreatePost,
          onCancel: () => bar.setMode('action'),
        });
      }
    });
  }, [isAuthenticated, handleCreatePost]);

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
      // TODO: Create import-keys route
      router.push('/onboarding' as any);
    } else {
      router.push(`/thread/${item.id}`);
    }
  };

  const handleReplyPress = (item: NodeData) => {
    setReplyingTo(item.id);
    bar.setMode('input');
  };

  const addAIResponseToNode = useCallback((content: string) => {
    addAIMessage(content);
  }, [addAIMessage]);

  useEffect(() => {
    if (pendingAIResponseRef.current && aiResponse && !aiIsGenerating) {
      pendingAIResponseRef.current = false;
      addAIResponseToNode(aiResponse);
    }
  }, [aiResponse, aiIsGenerating, addAIResponseToNode]);

  const handleSendReply = useCallback(async (text: string) => {
    if (replyingTo) {
      if (replyingTo === INITIAL_COMPANION.id) {
        addUserMessage(text);
        setRippleThinking(true);

        if (aiIsReady) {
          pendingAIResponseRef.current = true;
          await sendToAI(text);
        } else {
          pendingAIResponseRef.current = false;
          setRippleThinking(false);
          addAIResponseToNode(
            aiDownloadProgress < 1
              ? `I'm still waking up... (${Math.round(aiDownloadProgress * 100)}% loaded)`
              : "I'm here to help you explore the mesh. Ask me anything!"
          );
        }
      }
      toast.success('Message sent');
    }
    bar.setMode('action');
    setReplyingTo(null);
  }, [replyingTo, aiIsReady, sendToAI, aiDownloadProgress, addAIResponseToNode, addUserMessage, setRippleThinking]);

  const handleCancelInput = useCallback(() => {
    bar.setMode('action');
    setReplyingTo(null);
  }, []);

  const handleActionRef = useRef(handleAction);
  const handleSendReplyRef = useRef(handleSendReply);
  const handleCancelInputRef = useRef(handleCancelInput);

  useEffect(() => {
    handleActionRef.current = handleAction;
    handleSendReplyRef.current = handleSendReply;
    handleCancelInputRef.current = handleCancelInput;
  });

  useEffect(() => {
    bar.setCallbacks({
      onAction: (action: string) => handleActionRef.current(action as ActionType),
      onSubmit: (text: string) => handleSendReplyRef.current(text),
      onCancel: () => handleCancelInputRef.current(),
    });
  }, []);

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

  const renderItem = ({ item, index }: { item: NodeData; index: number }) => (
    <View style={styles.nodeWrapper}>
      <Node
        data={item}
        isLast={index === 0}
        onPress={() => handleNodePress(item)}
        onAvatarPress={() => handleAvatarPress(item)}
        onAnchor={handleAnchor}
        onReplyPress={() => handleReplyPress(item)}
        onSelectModel={handleSelectModel}
        isThinking={item.id === INITIAL_COMPANION.id && (rippleIsThinking || aiIsGenerating)}
      />
    </View>
  );

  const visibleFeed = feed.filter(item => item.degree === degree);

  const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {/* Top Bar aligned with surface background */}
      <Animated.View style={[styles.filterContainer, { paddingTop: insets.top }, filterAnimatedStyle]}>
        {isAuthenticated && (
          <Pressable onPress={() => router.push('/profile')} style={styles.profileButton}>
            <Avatar size="small" char={user?.alias?.[0]?.toUpperCase() || '?'} />
          </Pressable>
        )}

        {/* Clean Segmented Control - No Borders/Shadows */}
        <View style={styles.filter}>
          {DEGREES.map(d => (
            <DegreePill
              key={d.id}
              label={d.label}
              active={degree === d.id}
              onPress={() => setDegree(d.id)}
            />
          ))}
        </View>
      </Animated.View>

      <GestureDetector gesture={swipeGesture}>
        <Animated.FlatList
          data={[...visibleFeed].reverse()}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          inverted
          contentContainerStyle={[styles.feedContainer, { paddingTop: 120 }]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        />
      </GestureDetector>
    </Animated.View>
  );
}

// Animated Pressable for Reanimated props
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type DegreePillProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const DegreePill = ({ label, active, onPress }: DegreePillProps) => {
  const { theme } = useUnistyles();

  // Use theme tokens for colors
  const activeBg = theme.colors.textPrimary;
  const activeText = theme.colors.background;
  const inactiveText = theme.colors.textMuted;

  // Track active state as shared value for proper animation
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 180 });
  }, [active]);

  const pillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', activeBg]
    ),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [inactiveText, activeText]
    ),
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.filterButton, pillStyle]}
    >
      <Animated.Text style={[styles.filterText, textStyle]}>{label}</Animated.Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  filterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingBottom: 12,
    backgroundColor: theme.colors.bg, // Match surface/background
  },
  profileButton: {
    position: 'absolute',
    left: 20,
    bottom: 14,
    zIndex: 60,
  },
  filter: {
    flexDirection: 'row',
    gap: 6,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 64,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  feedContainer: {
    paddingHorizontal: theme.space.md,
    paddingBottom: 100,
  },
  nodeWrapper: {
    marginBottom: theme.space.lg, 
  },
}));
