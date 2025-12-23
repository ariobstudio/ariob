/**
 * AI Conversation Screen
 *
 * Chat interface for Ripple AI companion.
 * Uses useBar() to configure input mode for messaging.
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { StyleSheet } from 'react-native-unistyles';
import { Text, Avatar, Stack, Button, useUnistyles } from '@ariob/andromeda';
import { useBar, Shell } from '@ariob/ripple';
import { useRippleAI, useAISettings, type Message } from '@ariob/ml';

export default function AIConversationScreen() {
  const { theme } = useUnistyles();
  const bar = useBar();
  const flatListRef = useRef<FlatList>(null);

  // State to control model loading - user must explicitly trigger download
  const [shouldLoad, setShouldLoad] = useState(false);

  const { profile, model } = useAISettings();
  const {
    response,
    isReady,
    isGenerating,
    downloadProgress,
    error,
    sendMessage,
    interrupt,
    messageHistory,
  } = useRippleAI({ preventLoad: !shouldLoad }); // Load only when shouldLoad is true

  // Bar actions
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleSettings = useCallback(() => {
    router.push('/ai/settings');
  }, []);

  // Keep refs for callbacks
  const sendMessageRef = useRef(sendMessage);
  sendMessageRef.current = sendMessage;

  const handleSend = useCallback(
    async (text: string) => {
      if (text.trim() && isReady) {
        await sendMessageRef.current(text.trim());
        bar.clearInputValue();
      }
    },
    [isReady, bar]
  );

  // Set up bar when screen gains focus
  useFocusEffect(
    useCallback(() => {
      bar.setActions({
        leading: [{ icon: 'arrow-back', onPress: handleBack }],
        trailing: [{ icon: 'settings-outline', onPress: handleSettings }],
      });
    }, [bar.setActions, handleBack, handleSettings])
  );

  // Open input mode only when ready
  useEffect(() => {
    if (isReady) {
      bar.openInput({
        placeholder: 'Message Ripple...',
        autoFocus: false,
        showSendButton: true,
        onSubmit: handleSend,
      });
    }
  }, [isReady]);

  // Handle download button press
  const handleStartDownload = useCallback(() => {
    setShouldLoad(true);
  }, []);

  // Render prompt to start download
  if (!isReady && !shouldLoad) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.promptContainer}>
          <Avatar char="✦" size="lg" tint="accent" />
          <Text size="title" color="text" style={styles.promptTitle}>
            {profile.name}
          </Text>
          <Text size="body" color="dim" style={styles.promptText}>
            Download the AI model to start chatting.
          </Text>
          <Text size="caption" color="dim" style={styles.modelInfo}>
            {model.name} • {model.ramRequired} RAM
          </Text>
          <Button
            onPress={handleStartDownload}
            variant="solid"
            tint="accent"
            size="lg"
          >
            Download Model
          </Button>
        </View>
      </View>
    );
  }

  // Render loading/downloading state
  if (!isReady && shouldLoad) {
    const progressPercent = Math.round(downloadProgress * 100);
    const statusText = downloadProgress > 0
      ? `Downloading model... ${progressPercent}%`
      : 'Preparing download...';

    return (
      <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.promptContainer}>
          <Avatar char="✦" size="lg" tint="accent" />
          <Text size="body" color="dim" style={styles.loadingText}>
            {statusText}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%`, backgroundColor: theme.colors.accent },
              ]}
            />
          </View>
          <Text size="caption" color="dim">
            {model.name}
          </Text>
        </View>
      </View>
    );
  }

  // Handle retry
  const handleRetry = useCallback(() => {
    setShouldLoad(false);
    // Brief delay then retry
    setTimeout(() => setShouldLoad(true), 100);
  }, []);

  // Render error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.promptContainer}>
          <Avatar char="✦" size="lg" tint="danger" />
          <Text size="body" color="danger" style={styles.loadingText}>
            {error}
          </Text>
          <Stack direction="row" gap="sm">
            <Button onPress={handleRetry} variant="solid" tint="accent">
              Retry
            </Button>
            <Button onPress={handleBack} variant="outline" tint="dim">
              Go Back
            </Button>
          </Stack>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={styles.header}>
        <Avatar char="✦" size="sm" tint="accent" />
        <Text size="body" color="text" style={styles.headerName}>
          {profile.name}
        </Text>
        {isGenerating && (
          <Text size="caption" color="dim">
            typing...
          </Text>
        )}
      </View>

      {/* Messages - inverted so newest at bottom */}
      <FlatList
        ref={flatListRef}
        data={[...messageHistory].reverse()}
        inverted
        renderItem={({ item }) => <MessageBubble message={item} />}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.messageList}
        style={styles.messages}
      />

      {/* Streaming response preview */}
      {isGenerating && response && (
        <View style={styles.streamingPreview}>
          <Text size="caption" color="dim">
            {response}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// Message bubble component
function MessageBubble({ message }: { message: Message }) {
  const { theme } = useUnistyles();
  const isUser = message.role === 'user';

  return (
    <View style={[styles.bubbleContainer, isUser && styles.bubbleContainerUser]}>
      <Shell
        style={[
          styles.bubble,
          isUser ? { backgroundColor: theme.colors.accent } : undefined,
        ]}
      >
        <Text size="body" color={isUser ? 'bg' : 'text'}>
          {message.content}
        </Text>
      </Shell>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  promptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space.md,
    paddingHorizontal: theme.space.xl,
  },
  promptTitle: {
    fontWeight: '700',
  },
  promptText: {
    textAlign: 'center',
  },
  modelInfo: {
    textAlign: 'center',
    marginBottom: theme.space.md,
  },
  loadingText: {
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
    gap: theme.space.sm,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerName: {
    fontWeight: '600',
    flex: 1,
  },
  messages: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
    paddingTop: 120, // Space for bar (inverted, so paddingTop = visual bottom)
  },
  bubbleContainer: {
    marginBottom: theme.space.sm,
    alignItems: 'flex-start',
  },
  bubbleContainerUser: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
  },
  streamingPreview: {
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
}));
