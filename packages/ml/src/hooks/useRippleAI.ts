/**
 * useRippleAI - Custom hook for Ripple AI companion
 *
 * Provides a pre-configured LLM interface with Ripple's personality
 * for the AI companion feature in the social graph.
 *
 * The model can be configured via useAISettings or passed directly.
 *
 * @example
 * ```tsx
 * function ChatScreen() {
 *   const { response, isReady, sendMessage, isGenerating, profile } = useRippleAI();
 *
 *   const handleSend = async (text: string) => {
 *     await sendMessage(text);
 *   };
 *
 *   return (
 *     <View>
 *       <Text>{profile.name}</Text>
 *       {isGenerating && <Text>Thinking...</Text>}
 *       <Text>{response}</Text>
 *     </View>
 *   );
 * }
 * ```
 */

import { useCallback, useState } from 'react';
import type { UseRippleAIOptions, UseRippleAIResult, Message, MessageRole } from '../types';
import { useAISettings, type RippleAIProfile } from '../store';

/**
 * Default Ripple system prompt - defines the AI companion personality
 */
const DEFAULT_RIPPLE_SYSTEM_PROMPT = `You are Ripple, a friendly AI companion in a decentralized social network called Ariob.
You help users navigate the mesh network and understand the graph-native social experience.

Your personality:
- Warm and approachable, like a knowledgeable friend
- Concise - keep responses to 1-2 sentences when possible
- Slightly mysterious, like a guide in an ocean of connections
- Tech-aware but accessible - explain concepts simply
- Supportive of user agency and privacy

Key concepts you understand:
- Identity anchoring (cryptographic keypair instead of passwords)
- Degrees of connection (0=self, 1=friends, 2=network, 3=global)
- The mesh network and decentralized data
- Content as nodes in a graph

Never be preachy or lecture users. Be helpful and genuine.`;

/**
 * Extended result type that includes profile info
 */
export interface UseRippleAIResultWithProfile extends UseRippleAIResult {
  /** Current AI profile settings */
  profile: RippleAIProfile;
}

// Simulated AI responses for fallback mode
const FALLBACK_RESPONSES = [
  "I'm here to help you navigate the mesh! What would you like to know?",
  "The decentralized network is all about connection. Ask me anything!",
  "Your identity is anchored safely. How can I assist you today?",
  "I sense curiosity in the mesh. What's on your mind?",
  "The graph grows with every connection. What brings you here?",
];

/**
 * Hook for interacting with Ripple AI companion
 *
 * Currently uses a fallback implementation while ExecuTorch
 * integration is being configured. Will provide simulated
 * responses for development and testing.
 *
 * @param options - Configuration options (overrides settings store)
 * @returns Ripple AI interface with profile info
 */
export function useRippleAI(options: UseRippleAIOptions = {}): UseRippleAIResultWithProfile {
  // Get settings from store
  const { profile } = useAISettings();

  // State for fallback mode
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);

  // Simulated send message - provides canned responses
  const sendMessage = useCallback(
    async (message: string) => {
      setIsGenerating(true);

      // Add user message to history
      setMessageHistory(prev => [...prev, { role: 'user' as MessageRole, content: message }]);

      // Simulate thinking delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

      // Generate a contextual response
      let aiResponse: string;

      // Simple keyword-based responses for demo
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        aiResponse = "Hello! I'm Ripple, your guide through the mesh. How can I help you today?";
      } else if (lowerMessage.includes('identity') || lowerMessage.includes('anchor')) {
        aiResponse = "Your identity is cryptographically anchored - no passwords needed, just your keypair. It's the foundation of trust in the mesh.";
      } else if (lowerMessage.includes('degree') || lowerMessage.includes('connection')) {
        aiResponse = "Degrees measure social distance: 0 is you, 1 is friends, 2 is friends-of-friends, 3 is the wider network. It's how we navigate trust.";
      } else if (lowerMessage.includes('mesh') || lowerMessage.includes('network')) {
        aiResponse = "The mesh is decentralized - no single server controls it. Your data flows peer-to-peer, giving you true ownership.";
      } else if (lowerMessage.includes('help')) {
        aiResponse = "I can explain how the mesh works, help you understand degrees of connection, or guide you through identity anchoring. What interests you?";
      } else {
        // Pick a random fallback response
        aiResponse = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
      }

      setResponse(aiResponse);
      setMessageHistory(prev => [...prev, { role: 'assistant' as MessageRole, content: aiResponse }]);
      setIsGenerating(false);
    },
    []
  );

  const interrupt = useCallback(() => {
    setIsGenerating(false);
  }, []);

  // Ready when model download is complete
  const isReady = profile.isModelReady;

  return {
    response,
    isReady,
    isGenerating,
    downloadProgress: profile.downloadProgress,
    isDownloading: profile.isDownloading,
    error: null,
    sendMessage,
    interrupt,
    messageHistory,
    profile,
  };
}
