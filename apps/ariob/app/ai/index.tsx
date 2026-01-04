/**
 * AI Conversation Screen
 *
 * Chat interface for Ripple AI companion.
 * ExecuTorch handles model caching automatically.
 */

import { useCallback, useRef, useEffect } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { Text, Avatar, Row, Button, useUnistyles, toast } from '@ariob/andromeda';
import { useBar } from '@ariob/ripple';
import { useRippleAI, useAISettings, type Message } from '@ariob/ml';
import { MessageBubble } from '../../features/ai';

export default function AIConversationScreen() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const bar = useBar();
  const flatListRef = useRef<FlatList>(null);

  const { profile, model } = useAISettings();
  const {
    response,
    isReady,
    isGenerating,
    downloadProgress,
    error,
    needsReload,
    sendMessage,
    interrupt,
    messageHistory,
  } = useRippleAI();

  // Keep refs for callbacks to avoid dependency changes
  const sendMessageRef = useRef(sendMessage);
  const interruptRef = useRef(interrupt);
  const isGeneratingRef = useRef(isGenerating);
  const barRef = useRef(bar);

  sendMessageRef.current = sendMessage;
  interruptRef.current = interrupt;
  isGeneratingRef.current = isGenerating;
  barRef.current = bar;

  // Debug logging
  useEffect(() => {
    console.log('[AI] State:', {
      isReady,
      isGenerating,
      downloadProgress,
      error: error ? String(error) : null,
      messageHistoryLength: messageHistory.length,
    });
  }, [isReady, isGenerating, downloadProgress, error, messageHistory.length]);

  // Stable back handler that uses refs
  const handleBack = useCallback(() => {
    if (isGeneratingRef.current) {
      interruptRef.current();
    }
    router.back();
  }, []);

  // Navigate to settings (used by header tap and trailing action)
  const handleSettings = useCallback(() => {
    barRef.current.pop();
    router.push('/ai/settings');
  }, []);

  // Reload the model by replacing the screen
  const handleReload = useCallback(() => {
    router.replace('/ai');
  }, []);

  // Set up bar when screen gains focus - use stable callbacks
  useFocusEffect(
    useCallback(() => {
      barRef.current.setActions({
        leading: [{ icon: 'arrow-back', onPress: handleBack }],
        trailing: [{ icon: 'settings-outline', onPress: handleSettings }],
      });
    }, [handleBack, handleSettings])
  );

  // Track if input is opened
  const inputOpenedRef = useRef(false);

  // Open input mode once when ready
  useEffect(() => {
    if (isReady && !inputOpenedRef.current) {
      inputOpenedRef.current = true;
      barRef.current.openInput({
        placeholder: 'Message Ripple...',
        autoFocus: false,
        showSendButton: true,
        persistent: true, // Keep input open for chat interface
        onSubmit: async (text: string) => {
          if (text.trim()) {
            try {
              await sendMessageRef.current(text.trim());
              barRef.current.clearInputValue();
            } catch (err: any) {
              console.error('[AI] Send failed:', err);
              toast.error(err?.message || 'Failed to send message');
              // Don't clear input so user can retry
            }
          }
        },
      });
    }
  }, [isReady]);

  // Render error state
  if (error) {
    const errorMessage = typeof error === 'string' ? error : (error as Error)?.message || 'An error occurred';
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.bg, paddingTop: insets.top }]}>
        <View style={styles.centerContainer}>
          <Avatar char="✦" size="lg" tint="warn" />
          <Text size="body" color="danger" style={styles.centerText}>
            {errorMessage}
          </Text>
          <Row gap="sm">
            <Button onPress={() => router.replace('/ai')} variant="solid" tint="accent">
              Retry
            </Button>
            <Button onPress={handleBack} variant="outline" tint="default">
              Go Back
            </Button>
          </Row>
        </View>
      </View>
    );
  }

  // Render loading/downloading state
  if (!isReady) {
    const progressPercent = Math.round(downloadProgress * 100);
    const isDownloading = downloadProgress > 0 && downloadProgress < 1;
    const isInitializing = downloadProgress === 0;
    const isLoading = downloadProgress >= 1;

    let statusText = 'Initializing...';
    if (isDownloading) {
      statusText = `Downloading model... ${progressPercent}%`;
    } else if (isLoading) {
      statusText = 'Loading model...';
    }

    return (
      <View style={[styles.container, { backgroundColor: theme.colors.bg, paddingTop: insets.top }]}>
        <View style={styles.centerContainer}>
          <Avatar char="✦" size="lg" tint="accent" />
          <Text size="title" color="text" style={styles.title}>
            {profile.name}
          </Text>
          <Text size="body" color="dim" style={styles.centerText}>
            {statusText}
          </Text>
          {!isInitializing && (
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: isLoading ? '100%' : `${progressPercent}%`,
                    backgroundColor: theme.colors.accent,
                  },
                ]}
              />
            </View>
          )}
          <Text size="caption" color="dim">
            {model.name} • {model.ramRequired} RAM
          </Text>
        </View>
      </View>
    );
  }

  // Render chat interface
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Header - tappable to access profile */}
      <Pressable onPress={handleSettings}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Avatar char="✦" size="sm" tint="accent" />
          <View style={styles.headerContent}>
            <Text size="body" color="text" style={styles.headerName}>
              {profile.name}
            </Text>
            {isGenerating ? (
              <Text size="caption" color="dim">
                typing...
              </Text>
            ) : (
              <Text size="caption" color="dim">
                {model.name}
              </Text>
            )}
          </View>
        </View>
      </Pressable>

      {/* Reload banner when model was unloaded */}
      {needsReload && (
        <Pressable onPress={handleReload} style={[styles.reloadBanner, { backgroundColor: theme.colors.warn }]}>
          <Text size="caption" style={{ color: theme.colors.bg }}>
            Model unloaded. Tap to reload.
          </Text>
        </Pressable>
      )}

      {/* Messages area - always show FlatList for consistent layout */}
      <FlatList
        ref={flatListRef}
        data={(() => {
          // Build display messages: history + streaming response if generating
          const displayMessages: Array<Message | { role: 'streaming'; content: string }> = [];

          // Add streaming response first (will appear at bottom in inverted list)
          if (isGenerating && response) {
            displayMessages.push({ role: 'streaming', content: response });
          }

          // Add history in reverse order (newest first for inverted list)
          for (let i = messageHistory.length - 1; i >= 0; i--) {
            displayMessages.push(messageHistory[i]);
          }

          return displayMessages;
        })()}
        inverted
        renderItem={({ item }) => <MessageBubble message={item as Message} isStreaming={item.role === 'streaming'} />}
        keyExtractor={(item, index) => item.role === 'streaming' ? 'streaming' : `msg-${index}`}
        contentContainerStyle={[
          styles.messageList,
          messageHistory.length === 0 && !isGenerating && styles.messageListEmpty,
        ]}
        style={styles.messages}
        ListEmptyComponent={
          !isGenerating ? (
            <View style={styles.welcomeInline}>
              <Text size="body" color="dim" style={styles.centerText}>
                Ask me anything about the mesh, identity, or connections.
              </Text>
            </View>
          ) : null
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space.md,
    paddingHorizontal: theme.space.xl,
  },
  title: {
    fontWeight: '700',
  },
  centerText: {
    textAlign: 'center',
  },
  progressBar: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    paddingHorizontal: theme.space.lg,
    paddingBottom: theme.space.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flex: 1,
  },
  headerName: {
    fontWeight: '600',
  },
  reloadBanner: {
    paddingVertical: theme.space.sm,
    paddingHorizontal: theme.space.lg,
    alignItems: 'center',
  },
  messages: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
    // For inverted FlatList, paddingTop creates space at visual bottom (above bar)
    paddingTop: 100,
  },
  messageListEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeInline: {
    alignItems: 'center',
    paddingHorizontal: theme.space.xl,
    // In inverted list, this appears in the center
  },
}));
