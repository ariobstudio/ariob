/**
 * Message - Direct message conversation node
 *
 * Displays a compact conversation preview showing the most recent messages.
 * Styled with solid monochrome bubbles.
 */

import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

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
  const displayMessages = maxMessages === -1
    ? data.messages
    : data.messages.slice(-maxMessages);

  return (
    <View style={styles.container}>
      <View style={styles.messages}>
        {displayMessages.map((msg, index) => {
          const isMe = msg.from === 'me';
          
          return (
            <View 
              key={msg.id} 
              style={[
                styles.msgRow, 
                isMe ? styles.msgRight : styles.msgLeft,
                { marginBottom: 4 } // Tight spacing between bubbles
              ]}
            >
              <View style={[
                styles.bubble,
                isMe ? styles.bubbleMe : styles.bubbleThem,
                { 
                  backgroundColor: isMe ? theme.colors.text : theme.colors.surfaceElevated, // Black/White based on mode for 'Me'
                }
              ]}>
                <Text style={[
                  styles.msgText, 
                  { color: isMe ? theme.colors.bg : theme.colors.text } // Inverted text for 'Me'
                ]}>
                  {msg.content}
                </Text>
              </View>
            </View>
          );
        })}

        {isThinking && (
          <View style={[styles.msgRow, styles.msgLeft]}>
            <View style={[
              styles.bubble, 
              styles.bubbleThem, 
              { backgroundColor: theme.colors.surfaceElevated, flexDirection: 'row', gap: 6, alignItems: 'center' }
            ]}>
              <ActivityIndicator size="small" color={theme.colors.dim} />
            </View>
          </View>
        )}
      </View>

      {onReplyPress && (
        <View style={styles.replySection}>
          <Pressable 
            onPress={onReplyPress} 
            style={({ pressed }) => [
              styles.replyButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Text style={[styles.replyButtonText, { color: theme.colors.text }]}>Reply</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    gap: 8,
  },
  messages: {
    width: '100%',
    gap: 2,
  },
  msgRow: {
    width: '100%',
    flexDirection: 'row',
  },
  msgLeft: {
    justifyContent: 'flex-start',
  },
  msgRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20, // Rounded bubbles
  },
  bubbleMe: {
    borderBottomRightRadius: 4, // Tail effect
  },
  bubbleThem: {
    borderBottomLeftRadius: 4, // Tail effect
  },
  msgText: {
    fontSize: 16,
    lineHeight: 22,
  },
  replySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  replyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
}));
