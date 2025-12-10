import { useLocalSearchParams, router, useFocusEffect, useNavigation } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUnistyles, StyleSheet } from 'react-native-unistyles';
import { Node, useBar, useMetaActions, type ActionType, type NodeData } from '@ariob/ripple';
import { toast } from '@ariob/andromeda';
import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useAuth, useNode, useCollection } from '@ariob/core';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { formatTimestamp } from '../../utils/mockData';

// Bar height for calculating offset
const BAR_HEIGHT = 60;

export default function Thread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const { isAuthenticated, user } = useAuth();
  // Use selectors for stable function references - prevents infinite re-renders
  const barConfigure = useBar((s) => s.configure);
  const barSetCallbacks = useBar((s) => s.setCallbacks);
  const barSetMode = useBar((s) => s.setMode);
  const navigation = useNavigation();

  // Fetch post from Gun graph
  const { data: postData, isLoading, isError } = useNode({
    path: `posts/${id}`,
    enabled: !!id,
  });

  // Fetch replies for this post
  const { items: replies, add: addReply } = useCollection({
    path: `posts/${id}/replies`,
    enabled: !!id,
  });

  // Convert Gun data to NodeData format
  const data: NodeData | null = useMemo(() => {
    if (!postData) return null;
    return {
      id: id!,
      type: 'post',
      author: postData.authorAlias || 'Unknown',
      timestamp: postData.created ? formatTimestamp(postData.created) : 'Unknown',
      degree: postData.degree ?? 1,
      content: postData.content,
      ...postData,
    };
  }, [id, postData]);

  // Full View Context - memoize to prevent infinite re-renders
  const fullViewData = useMemo(() => ({
    author: data?.author,
    type: data?.type,
    isMe: false,
  }), [data?.author, data?.type]);

  const meta = useMetaActions(0, isAuthenticated, fullViewData);

  // Memoize meta values to prevent useFocusEffect from re-running unnecessarily
  const metaLeft = useMemo(() => meta.left ?? null, [meta.left?.name, meta.left?.icon]);
  const metaMain = useMemo(() => meta.main ?? null, [meta.main?.name, meta.main?.icon]);
  const metaRight = useMemo(() => meta.right ?? null, [meta.right?.name, meta.right?.icon]);

  // Safe back navigation
  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [navigation]);

  const handleAction = useCallback((action: ActionType) => {
    switch (action) {
      case 'back':
        goBack();
        return;
      case 'options':
        console.log('Options tapped');
        return;
      case 'reply':
      case 'reply_full':
        barSetMode('input');
        return;
      case 'attach':
        toast.info('Attachments coming soon');
        return;
      default:
        console.log('Thread action:', action);
    }
  }, [goBack, barSetMode]);

  const handleSend = useCallback(async (text: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Sign in to reply');
      return;
    }

    try {
      const result = await addReply({
        content: text,
        author: user.pub,
        authorAlias: user.alias || 'Anonymous',
        created: Date.now(),
        parentId: id,
      });

      if (result.ok) {
        toast.success('Reply sent');
        barSetMode('action');
      } else {
        toast.error('Failed to send reply');
      }
    } catch (err) {
      console.error('Reply error:', err);
      toast.error('Failed to send reply');
    }
  }, [isAuthenticated, user, addReply, id, barSetMode]);

  const handleCancel = useCallback(() => {
    barSetMode('action');
  }, [barSetMode]);

  // Use ref to track if already configured - prevents infinite re-renders
  const hasConfigured = useRef(false);
  const configRef = useRef({ metaLeft, metaMain, metaRight, handleAction, handleSend, handleCancel });

  // Update refs when values change
  useEffect(() => {
    configRef.current = { metaLeft, metaMain, metaRight, handleAction, handleSend, handleCancel };
  });

  // Static inputLeft config - created once
  const inputLeftConfig = useMemo(() => ({ name: 'attach', icon: 'attach', label: 'Attach' } as const), []);

  // Configure global Bar ONCE when focused
  useFocusEffect(
    useCallback(() => {
      // Only configure once per focus
      hasConfigured.current = false;

      const configure = () => {
        if (hasConfigured.current) return;
        hasConfigured.current = true;

        const { metaLeft: left, metaMain: center, metaRight: right } = configRef.current;

        barConfigure({
          mode: 'action',
          left,
          center,
          right,
          inputLeft: inputLeftConfig,
          placeholder: 'Reply...',
          persistInputMode: true, // Keep node visible when input opens (no backdrop)
        });
        barSetCallbacks({
          onAction: (action: ActionType) => configRef.current.handleAction(action),
          onSubmit: (text: string) => configRef.current.handleSend(text),
          onCancel: () => configRef.current.handleCancel(),
        });
      };

      // Delay slightly to avoid race with render
      const timer = setTimeout(configure, 0);

      return () => {
        clearTimeout(timer);
        hasConfigured.current = false;
      };
    }, [inputLeftConfig, barConfigure, barSetCallbacks])
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accentGlow} />
        <Text style={styles.loadingText}>Loading thread...</Text>
      </View>
    );
  }

  // No data or error state
  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {isError ? 'Failed to load thread' : 'Thread not found'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior="padding"
        keyboardVerticalOffset={BAR_HEIGHT + insets.bottom + 12}
      >
        <View style={[styles.content, { paddingTop: insets.top, paddingBottom: BAR_HEIGHT + insets.bottom + 24 }]}>
          <Node
            data={data}
            isLast={true}
            transitionTag={`node-${id}`}
          />

          <View style={styles.comments}>
            <Text style={styles.commentHeader}>Replies coming soon...</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
      {/* Bar is rendered at layout level */}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
  },
  comments: {
    marginTop: theme.spacing.lg,
    paddingLeft: theme.spacing.lg,
    opacity: 0.5,
  },
  commentHeader: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
  },
}));
