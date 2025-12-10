/**
 * Conversation Store - AI chat message history
 *
 * Manages the conversation with the on-device AI model.
 * Persists messages across sessions for conversation continuity.
 *
 * @example
 * ```tsx
 * import { useConversationStore } from '@ariob/store/stores';
 *
 * function AIChat() {
 *   const { messages, addMessage, clearMessages } = useConversationStore();
 *
 *   const handleSend = (text: string) => {
 *     addMessage({ role: 'user', content: text });
 *     // Trigger AI response...
 *   };
 *
 *   return (
 *     <View>
 *       {messages.map((msg) => (
 *         <Message key={msg.id} {...msg} />
 *       ))}
 *     </View>
 *   );
 * }
 * ```
 */

import { persisted } from '../create';

/**
 * Message role
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Message status
 */
export type MessageStatus = 'sending' | 'sent' | 'error';

/**
 * Conversation message
 */
export interface Message {
  /** Unique message ID */
  id: string;
  /** Message role */
  role: MessageRole;
  /** Message content */
  content: string;
  /** Creation timestamp */
  createdAt: number;
  /** Message status */
  status: MessageStatus;
}

/**
 * Conversation store state and actions
 */
export interface ConversationState {
  /** Message history */
  messages: Message[];
  /** Whether AI is currently generating */
  isGenerating: boolean;

  // Actions
  /** Add a new message */
  addMessage: (msg: Omit<Message, 'id' | 'createdAt' | 'status'>) => void;
  /** Update a message by ID */
  updateMessage: (id: string, updates: Partial<Message>) => void;
  /** Remove a message by ID */
  removeMessage: (id: string) => void;
  /** Clear all messages */
  clearMessages: () => void;
  /** Set generating state */
  setGenerating: (generating: boolean) => void;
}

/**
 * Generate unique message ID
 */
function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const initialState = {
  messages: [] as Message[],
  isGenerating: false,
};

/**
 * Conversation store hook with persistence
 */
export const useConversationStore = persisted<ConversationState>(
  '@ariob/conversation',
  (set, get) => ({
    ...initialState,

    addMessage: (msg) => {
      const newMessage: Message = {
        id: generateId(),
        createdAt: Date.now(),
        status: msg.role === 'user' ? 'sent' : 'sending',
        ...msg,
      };
      set({ messages: [...get().messages, newMessage] });
    },

    updateMessage: (id, updates) => {
      set({
        messages: get().messages.map((msg) =>
          msg.id === id ? { ...msg, ...updates } : msg
        ),
      });
    },

    removeMessage: (id) => {
      set({ messages: get().messages.filter((msg) => msg.id !== id) });
    },

    clearMessages: () => set({ messages: [] }),

    setGenerating: (isGenerating) => set({ isGenerating }),
  }),
  {
    // Only persist the last 50 messages to avoid storage bloat
    partialize: (state: ConversationState) => ({
      messages: state.messages.slice(-50),
    }),
  }
);
