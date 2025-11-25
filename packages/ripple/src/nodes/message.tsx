import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { messageStyles as styles } from './message.styles';

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
