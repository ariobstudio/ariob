import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
} from 'react-native-reanimated';
import { Avatar } from '@ariob/ripple';
import { useUnistyles } from 'react-native-unistyles';
import { messageStyles as styles } from '../styles/message.styles';

// Mock messages
const MOCK_MESSAGES = [
  { id: '1', text: 'Protocol initialized.', isMe: false, time: '00:00' },
  { id: '2', text: 'Hi! I\'m Ripple, your AI companion.', isMe: false, time: '00:01' },
  { id: '3', text: 'I\'m connected to the mesh. Anchor your identity to start.', isMe: false, time: '00:01' },
];

export default function MessageThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
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
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Ripple</Text>
          <Text style={styles.headerSubtitle}>AI Companion</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}
      />

      <Animated.View style={[styles.inputContainer, { paddingBottom: (insets.bottom || 12) + 4 }, animatedInputStyle]}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor={theme.colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
        />
        <Pressable
          onPress={handleSend}
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          disabled={!text.trim()}
        >
          <Ionicons name="arrow-up" size={18} color="#000" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

