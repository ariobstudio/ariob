/**
 * Ripple Conversation Store
 *
 * Shared state for the Ripple AI companion conversation.
 * Persists messages to AsyncStorage so they sync between:
 * - Feed view (index.tsx) - compact message node
 * - Full view (message/[id].tsx) - dedicated chat screen
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RippleMessage {
  id: string;
  from: 'me' | 'them';
  content: string;
  time: string;
}

interface RippleConversationState {
  messages: RippleMessage[];
  isThinking: boolean;

  // Actions
  addMessage: (message: Omit<RippleMessage, 'id'>) => void;
  addUserMessage: (content: string) => string; // Returns message ID
  addAIMessage: (content: string) => void;
  setThinking: (thinking: boolean) => void;
  clearMessages: () => void;
}

// Initial messages from Ripple
const INITIAL_MESSAGES: RippleMessage[] = [
  { id: 'init-1', from: 'them', content: 'Protocol initialized.', time: '00:00' },
  { id: 'init-2', from: 'them', content: "Hi! I'm Ripple, your AI companion.", time: '00:01' },
  { id: 'init-3', from: 'them', content: "I'm connected to the mesh. Ask me anything about the network!", time: '00:01' },
];

export const useRippleConversation = create<RippleConversationState>()(
  persist(
    (set, get) => ({
      messages: INITIAL_MESSAGES,
      isThinking: false,

      addMessage: (message) => {
        const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({
          messages: [...state.messages, { ...message, id }],
        }));
      },

      addUserMessage: (content) => {
        const id = `me-${Date.now()}`;
        set((state) => ({
          messages: [...state.messages, { id, from: 'me', content, time: 'Now' }],
        }));
        return id;
      },

      addAIMessage: (content) => {
        const id = `ai-${Date.now()}`;
        set((state) => ({
          messages: [...state.messages, { id, from: 'them', content, time: 'Now' }],
          isThinking: false,
        }));
      },

      setThinking: (thinking) => set({ isThinking: thinking }),

      clearMessages: () => set({ messages: INITIAL_MESSAGES, isThinking: false }),
    }),
    {
      name: 'ripple-conversation',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Selector for getting messages in the format expected by Message node
export const useRippleMessagesForNode = () => {
  const messages = useRippleConversation((state) => state.messages);
  return messages;
};

// Selector for checking if AI is thinking
export const useRippleIsThinking = () => {
  return useRippleConversation((state) => state.isThinking);
};
