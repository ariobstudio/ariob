import { useLocalSearchParams, router } from 'expo-router';
import { View, StyleSheet, Text, TextInput, Pressable, FlatList, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedKeyboard, 
  useAnimatedStyle, 
  withSpring, 
  useDerivedValue,
  FadeIn
} from 'react-native-reanimated';
import { Avatar } from '@ariob/ripple';

// Mock messages
const MOCK_MESSAGES = [
  { id: '1', text: 'Protocol initialized.', isMe: false, time: '00:00' },
  { id: '2', text: 'Hi! I\'m Ripple, your AI companion.', isMe: false, time: '00:01' },
  { id: '3', text: 'I\'m connected to the mesh. Anchor your identity to start.', isMe: false, time: '00:01' },
];

export default function MessageThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const keyboard = useAnimatedKeyboard();
  const keyboardHeight = useDerivedValue(() => {
    return withSpring(keyboard.height.value, {
      damping: 50,
      stiffness: 500,
      mass: 0.8,
      overshootClamping: true,
    });
  });

  const animatedInputStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboardHeight.value }],
  }));

  const handleSend = () => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      text: text.trim(), 
      isMe: true, 
      time: 'Now' 
    }]);
    setText('');
    
    // Mock reply
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: 'ai-' + Date.now(), 
        text: `Echo: ${text}`, 
        isMe: false, 
        time: 'Now' 
      }]);
    }, 1000);
  };

  const renderItem = ({ item }: { item: typeof MOCK_MESSAGES[0] }) => (
    <View style={[styles.msgRow, item.isMe ? styles.msgRight : styles.msgLeft]}>
      {!item.isMe && (
        <View style={styles.avatarContainer}>
          <Avatar char="R" size="small" variant="companion" />
        </View>
      )}
      <View style={[
        styles.bubble, 
        item.isMe ? styles.bubbleMe : styles.bubbleThem
      ]}>
        <Text style={[
          styles.msgText, 
          item.isMe ? styles.textMe : styles.textThem
        ]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#E7E9EA" />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Ripple</Text>
          <Text style={styles.headerSubtitle}>AI Companion</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Chat List */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
        inverted={false} // Normal order for chat, usually... but if we want bottom-up...
        // Actually, chat is usually bottom-up visually, but data order depends. 
        // Let's stick to top-down list for now, or inverted if we want to stick to bottom.
        // Standard messaging apps scroll to bottom.
        // I'll use normal order and `onContentSizeChange` to scroll to end, or just basic list.
      />

      {/* Input Bar */}
      <Animated.View style={[styles.inputContainer, { paddingBottom: insets.bottom || 16 }, animatedInputStyle]}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor="#71767B"
          value={text}
          onChangeText={setText}
          multiline
        />
        <Pressable 
          onPress={handleSend} 
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          disabled={!text.trim()}
        >
          <Ionicons name="arrow-up" size={20} color="#000" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2F3336',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#E7E9EA',
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#71767B',
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for input
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  msgLeft: {
    justifyContent: 'flex-start',
  },
  msgRight: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: '#1D9BF0',
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: '#1F2226',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#2F3336',
  },
  msgText: {
    fontSize: 15,
    lineHeight: 20,
  },
  textMe: {
    color: '#FFF',
  },
  textThem: {
    color: '#E7E9EA',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#2F3336',
  },
  input: {
    flex: 1,
    backgroundColor: '#16181C',
    borderRadius: 20,
    color: '#E7E9EA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E7E9EA',
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

