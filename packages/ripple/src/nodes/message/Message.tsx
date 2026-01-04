/**
 * Message - Direct message conversation node
 *
 * Displays a compact conversation preview showing the most recent messages.
 */

import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { messageStyles as styles } from './message.styles';

/**
 * Message conversation data structure
 */
export interface MessageData {
  id: string;
  messages: Array<{
    id: string;
    from: 'me' | 'them';
    content: string;
    time: string;
  }>;
}

interface MessageProps {
  data: MessageData;
  isThinking?: boolean;
  onReplyPress?: () => void;
  maxMessages?: number;
  compact?: boolean;
}

export const Message = ({ data, isThinking, onReplyPress, maxMessages = 3 }: MessageProps) => {
  const { theme } = useUnistyles();

  // Show last N messages
  const displayMessages = maxMessages === -1 ? data.messages : data.messages.slice(-maxMessages);

  return (
    <View style={styles.container}>
      <View style={styles.messages}>
        {displayMessages.map((msg) => {
          const isMe = msg.from === 'me';

          return (
            <View
              key={msg.id}
              style={[styles.msgRow, isMe ? styles.msgRight : styles.msgLeft, { marginBottom: 4 }]}
            >
              <View
                style={[
                  styles.bubble,
                  isMe ? styles.bubbleMe : styles.bubbleThem,
                  {
                    backgroundColor: isMe ? theme.colors.text : theme.colors.surfaceElevated,
                  },
                ]}
              >
                <Text style={[styles.msgText, { color: isMe ? theme.colors.bg : theme.colors.text }]}>
                  {msg.content}
                </Text>
              </View>
            </View>
          );
        })}

        {isThinking && (
          <View style={[styles.msgRow, styles.msgLeft]}>
            <View
              style={[
                styles.bubble,
                styles.bubbleThem,
                {
                  backgroundColor: theme.colors.surfaceElevated,
                  flexDirection: 'row',
                  gap: 6,
                  alignItems: 'center',
                },
              ]}
            >
              <ActivityIndicator size="small" color={theme.colors.dim} />
            </View>
          </View>
        )}
      </View>

      {onReplyPress && (
        <View style={styles.replySection}>
          <Pressable
            onPress={onReplyPress}
            style={({ pressed }) => [styles.replyButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.replyButtonText, { color: theme.colors.text }]}>Reply</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};
