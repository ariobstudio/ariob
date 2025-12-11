import { useLocalSearchParams, router, useFocusEffect, useNavigation } from 'expo-router';
import { View, Text, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useEffect, useRef, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useBar, Avatar } from '@ariob/ripple';
import { useUnistyles } from 'react-native-unistyles';
import { useRippleAI } from '@ariob/ml';
import Animated, { useAnimatedStyle, runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { messageStyles as styles } from '../../styles/message.styles';
import { useRippleConversation } from '../../stores/rippleConversation';
import { useState } from 'react';

// Bar heights for calculating proper bottom padding
const BAR_HEIGHT = 52;
const BAR_INPUT_HEIGHT = 52;

// Message type for display
interface ChatMessage {
  id: string;
  text: string;
  isMe: boolean;
  time: string;
}

export default function MessageThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const bar = useBar();
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  // Track keyboard padding as state (synced from UI thread)
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  // Sync keyboard height from UI thread to JS thread
  useAnimatedReaction(
    () => Math.abs(keyboardHeight.value),
    (currentPadding, previousPadding) => {
      if (currentPadding !== previousPadding) {
        runOnJS(setKeyboardPadding)(currentPadding);
      }
    },
    [keyboardHeight]
  );

  // Calculate content container padding
  const contentPadding = keyboardPadding + BAR_HEIGHT + insets.bottom + 16;

  // Shared conversation store
  const rippleMessages = useRippleConversation((state) => state.messages);
  const rippleIsThinking = useRippleConversation((state) => state.isThinking);
  const addUserMessage = useRippleConversation((state) => state.addUserMessage);
  const addAIMessage = useRippleConversation((state) => state.addAIMessage);
  const setRippleThinking = useRippleConversation((state) => state.setThinking);

  // Transform store messages to ChatMessage format
  const messages = useMemo<ChatMessage[]>(() => {
    return rippleMessages.map((msg) => ({
      id: msg.id,
      text: msg.content,
      isMe: msg.from === 'me',
      time: msg.time,
    }));
  }, [rippleMessages]);

  // Ripple AI hook
  const {
    response: aiResponse,
    isReady: aiIsReady,
    isGenerating: aiIsGenerating,
    sendMessage: sendToAI,
  } = useRippleAI();

  // Track if we're waiting for AI response
  const pendingResponseRef = useRef(false);

  // Sync AI response to store when it arrives
  useEffect(() => {
    if (pendingResponseRef.current && aiResponse && !aiIsGenerating) {
      pendingResponseRef.current = false;
      addAIMessage(aiResponse);
    }
  }, [aiResponse, aiIsGenerating, addAIMessage]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, rippleIsThinking]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage = text.trim();

    // Add user message to shared store
    addUserMessage(userMessage);
    setRippleThinking(true);

    // Send to AI
    if (aiIsReady) {
      pendingResponseRef.current = true;
      await sendToAI(userMessage);
    } else {
      // Fallback response if AI not ready
      setTimeout(() => {
        setRippleThinking(false);
        addAIMessage("I'm still waking up... Please select a model first to enable full AI responses.");
      }, 500);
    }
  }, [aiIsReady, sendToAI, addUserMessage, addAIMessage, setRippleThinking]);

  const navigation = useNavigation();

  // Safe back navigation
  const handleCancel = useCallback(() => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [navigation]);

  // Handler for backdrop tap - just blur, don't navigate away
  const handleDismiss = useCallback(() => {
    // In the dedicated chat view, tapping the backdrop should NOT navigate back
    // It should just blur the keyboard (the Bar handles keyboard blur automatically)
  }, []);

  // Configure global Bar for DM (always input mode, no backdrop dismissal)
  useFocusEffect(
    useCallback(() => {
      bar.configure({
        mode: 'input',
        persistInputMode: true, // Keep input mode, hide backdrop
        inputLeft: { name: 'attach', icon: 'attach', label: 'Attach' },
        placeholder: aiIsReady ? 'Message Ripple...' : 'Select a model first...',
        center: null,
        left: null,
        right: null,
      });
      bar.setCallbacks({
        onSubmit: handleSend,
        onCancel: handleDismiss,
      });

      // Reset persistInputMode when leaving this screen
      return () => {
        bar.configure({ persistInputMode: false });
      };
    }, [handleSend, handleDismiss, aiIsReady])
  );

  const renderItem = ({ item }: { item: ChatMessage }) => (
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

  // Render thinking indicator
  const renderThinking = () => {
    if (!rippleIsThinking && !aiIsGenerating) return null;
    return (
      <View style={[styles.msgRow, styles.msgLeft]}>
        <View style={styles.avatarContainer}>
          <Avatar char="R" size="small" variant="companion" />
        </View>
        <View style={[styles.bubble, styles.bubbleThem, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
          <ActivityIndicator size="small" color="#71767B" />
          <Text style={[styles.msgText, styles.textThem, { opacity: 0.7 }]}>
            Thinking...
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Ripple</Text>
          <Text style={styles.headerSubtitle}>
            {aiIsReady ? 'AI Companion' : 'Select a model to chat'}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          {aiIsReady ? (
            <View style={styles.readyDot} />
          ) : (
            <View style={styles.offlineDot} />
          )}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: contentPadding }]}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={renderThinking}
      />
      {/* Bar is rendered at layout level */}
    </View>
  );
}
