import { useCallback, useState, useRef, useEffect } from '@lynx-js/react';
import { createMessageId, type NativeAIRole } from '@ariob/ai';
import { useModelStore, DEFAULT_SYSTEM_PROMPT } from '../stores/modelStore';

export interface ChatMessage {
  id: string;
  role: NativeAIRole;
  content: string;
  pending?: boolean;
  createdAt?: number;
}

const createInitialMessages = (systemPrompt: string): ChatMessage[] => [
  { id: 'system-message', role: 'system', content: systemPrompt },
];

export function useChatMessages() {
  // Get system message from Zustand store for persistence
  const systemMessage = useModelStore((state) => state.systemMessage);

  const [messages, setMessages] = useState<ChatMessage[]>(() => createInitialMessages(systemMessage));

  const pendingAssistantRef = useRef<{ messageId: string; model: string; streamId?: string } | null>(
    null,
  );
  const activeStreamRef = useRef<{ messageId: string; streamId: string } | null>(null);

  // Sync system message from Zustand to messages array whenever it changes
  useEffect(() => {
    setMessages((previous) => {
      const updated = [...previous];
      const systemIndex = updated.findIndex((m) => m.role === 'system');
      if (systemIndex !== -1) {
        // Use fallback only when building messages for AI (if empty)
        const finalContent = systemMessage.trim() === '' ? DEFAULT_SYSTEM_PROMPT : systemMessage;
        updated[systemIndex] = { ...updated[systemIndex], content: finalContent };
      }
      return updated;
    });
  }, [systemMessage]);

  // Schedule messages update on next tick to keep UI responsive
  const scheduleMessagesUpdate = useCallback(
    (updater: (previous: ChatMessage[]) => ChatMessage[]) => {
      setTimeout(() => {
        setMessages((previous) => updater(previous));
      }, 0);
    },
    [],
  );

  const appendMessages = useCallback(
    (items: ChatMessage[]) => {
      setTimeout(() => {
        setMessages((previous) => [...previous, ...items]);
      }, 0);
    },
    [],
  );

  const updateMessageById = useCallback(
    (messageId: string, mapper: (message: ChatMessage) => ChatMessage) => {
      scheduleMessagesUpdate((previous) =>
        previous.map((message) => (message.id === messageId ? mapper(message) : message)),
      );
    },
    [scheduleMessagesUpdate],
  );

  const createAssistantPlaceholder = useCallback(
    (): ChatMessage => ({
      id: createMessageId(),
      role: 'assistant',
      content: '',
      pending: true,
      createdAt: Date.now(),
    }),
    [],
  );

  const resetMessages = useCallback(() => {
    setMessages(createInitialMessages(systemMessage));
    pendingAssistantRef.current = null;
    activeStreamRef.current = null;
  }, [systemMessage]);

  return {
    messages,
    systemMessage,
    appendMessages,
    updateMessageById,
    createAssistantPlaceholder,
    resetMessages,
    pendingAssistantRef,
    activeStreamRef,
  };
}
