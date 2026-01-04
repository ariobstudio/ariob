/**
 * MessageBubble - Chat message bubble component
 *
 * Renders user and AI messages with appropriate styling.
 */

import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Text, useUnistyles } from '@ariob/andromeda';
import { Shell } from '@ariob/ripple';
import type { Message } from '@ariob/ml';

export interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const { theme } = useUnistyles();
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // Don't render system messages
  if (isSystem) return null;

  return (
    <View style={[styles.bubbleContainer, isUser && styles.bubbleContainerUser]}>
      <Shell
        style={[
          styles.bubble,
          isUser ? { backgroundColor: theme.colors.accent } : undefined,
        ]}
      >
        <Text
          size="body"
          color={isStreaming ? 'dim' : 'text'}
          style={isUser ? { color: theme.colors.bg } : undefined}
        >
          {message.content}
          {isStreaming && '▋'}
        </Text>
      </Shell>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
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
}));
