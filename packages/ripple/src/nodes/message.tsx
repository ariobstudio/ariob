import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

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
  onReply?: (text: string) => void;
  onFocus?: () => void;
  isFocused?: boolean;
}

export const Message = ({ data, isThinking, onReply, onFocus, isFocused }: MessageProps) => {
  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState('');
  
  // Auto-reset input visibility when focus is lost
  useEffect(() => {
    if (!isFocused && showInput) {
      setShowInput(false);
    }
  }, [isFocused]);

  const handleReplyStart = () => {
    setShowInput(true);
    onFocus?.();
  };

  const handleSend = () => {
    if (!text) return;
    onReply?.(text);
    setText('');
    // Keep input open for continued conversation flow until focus is lost
  };
  
  return (
    <View style={[styles.container, isFocused && styles.focusedContainer]}>
      <View style={styles.messages}>
        {data.messages.slice(-2).map((msg) => (
          <View key={msg.id} style={[styles.msgRow, msg.from === 'me' ? styles.msgRight : styles.msgLeft]}>
            <View style={[styles.bubble, msg.from === 'me' ? styles.bubbleMe : styles.bubbleThem]}>
              <Text style={[styles.msgText, msg.from === 'me' ? styles.textMe : styles.textThem]}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}
        {isThinking && (
          <View style={[styles.msgRow, styles.msgLeft]}>
            <View style={[styles.bubble, styles.bubbleThinking]}>
              <ActivityIndicator size="small" color="#71767B" />
              <Text style={styles.thinkingText}>Thinking...</Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.replySection}>
        {!showInput ? (
          <Pressable onPress={handleReplyStart} style={styles.replyButton}>
            <Ionicons name="return-down-back" size={16} color="#71767B" />
            <Text style={styles.replyButtonText}>Reply</Text>
          </Pressable>
        ) : (
          <View style={styles.inputRow}>
            <TextInput
              autoFocus
              style={styles.input}
              placeholder="Type message..."
              placeholderTextColor="#536471"
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleSend}
            />
            <Pressable onPress={handleSend} disabled={!text} style={styles.sendButton}>
              <Ionicons name="arrow-up" size={16} color="#000" />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  focusedContainer: {
    // Add visual cue for focus if needed
  },
  messages: {
    gap: 8,
  },
  msgRow: {
    flexDirection: 'row' as const,
  },
  msgLeft: {
    justifyContent: 'flex-start' as const,
  },
  msgRight: {
    justifyContent: 'flex-end' as const,
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bubbleMe: {
    backgroundColor: '#1D9BF0',
    borderBottomRightRadius: 2,
  },
  bubbleThem: {
    backgroundColor: '#1F2226',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#2F3336',
  },
  bubbleThinking: {
    backgroundColor: '#1F2226',
    borderWidth: 1,
    borderColor: '#2F3336',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 18,
  },
  textMe: {
    color: '#FFF',
  },
  textThem: {
    color: '#E7E9EA',
  },
  thinkingText: {
    fontSize: 12,
    color: '#71767B',
  },
  replySection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  replyButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    alignSelf: 'flex-start' as const,
  },
  replyButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#E7E9EA',
  },
  inputRow: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#111',
    color: '#E7E9EA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2F3336',
  },
  sendButton: {
    backgroundColor: '#E7E9EA',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
