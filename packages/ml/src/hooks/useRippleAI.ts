/**
 * useRippleAI - Hook for Ripple AI companion
 *
 * Uses react-native-executorch for on-device LLM inference.
 * Falls back to simulated responses on unsupported platforms.
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import type { UseRippleAIOptions, UseRippleAIResult, Message } from '../types';
import { useAISettings } from '../store';
import { DEFAULT_MODEL } from '../models/config';

/**
 * Default Ripple system prompt
 */
const DEFAULT_SYSTEM_PROMPT = `You are Ripple, a friendly AI companion in Ariob, a decentralized social network.

Your personality:
- Warm and approachable, like a knowledgeable friend
- Concise - keep responses to 1-2 sentences when possible
- Tech-aware but accessible - explain concepts simply

Key concepts:
- Identity anchoring (cryptographic keypair instead of passwords)
- Degrees of connection (0=self, 1=friends, 2=network, 3=global)
- Decentralized mesh network

Be helpful and genuine. Never lecture.`;

/**
 * Try to import useLLM from react-native-executorch
 * Returns null if not available (e.g., on web)
 */
let useLLMHook: typeof import('react-native-executorch').useLLM | null = null;
try {
  // Dynamic require to avoid bundler issues
  const executorch = require('react-native-executorch');
  useLLMHook = executorch.useLLM;
} catch {
  // ExecuTorch not available - will use fallback
}

/**
 * Fallback responses for platforms without ExecuTorch
 */
const FALLBACK_RESPONSES = [
  "I'm here to help you navigate the mesh! What would you like to know?",
  "The decentralized network is all about connection. Ask me anything!",
  "Your identity is anchored safely. How can I assist you today?",
  "I sense curiosity in the mesh. What's on your mind?",
  "The graph grows with every connection. What brings you here?",
];

/**
 * Hook for interacting with Ripple AI companion
 */
export function useRippleAI(options: UseRippleAIOptions = {}): UseRippleAIResult {
  const { model: modelOverride, systemPrompt: systemPromptOverride, preventLoad } = options;
  const { model: settingsModel, profile } = useAISettings();

  // Determine which model to use
  const model = modelOverride ?? settingsModel ?? DEFAULT_MODEL;
  const systemPrompt = systemPromptOverride ?? profile.systemPrompt ?? DEFAULT_SYSTEM_PROMPT;

  // Use ExecuTorch if available
  if (useLLMHook) {
    return useExecuTorchAI(model, systemPrompt, preventLoad);
  }

  // Fallback for unsupported platforms
  return useFallbackAI(systemPrompt);
}

/**
 * ExecuTorch-powered AI hook
 */
function useExecuTorchAI(
  model: typeof DEFAULT_MODEL,
  systemPrompt: string,
  preventLoad?: boolean
): UseRippleAIResult {
  // This will only be called if useLLMHook is available
  const llm = useLLMHook!({
    model: {
      modelSource: model.modelSource,
      tokenizerSource: model.tokenizerSource,
      tokenizerConfigSource: model.tokenizerConfigSource ?? model.tokenizerSource,
    },
    preventLoad,
  });

  // Track if we've added the system prompt
  const hasSystemPrompt = useRef(false);

  // Add system prompt on first message
  const sendMessage = useCallback(
    async (message: string) => {
      if (!hasSystemPrompt.current && llm.messageHistory.length === 0) {
        // Add system prompt as first message context
        await llm.generate([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ]);
        hasSystemPrompt.current = true;
      } else {
        await llm.sendMessage(message);
      }
    },
    [llm, systemPrompt]
  );

  return {
    response: llm.response,
    isReady: llm.isReady,
    isGenerating: llm.isGenerating,
    downloadProgress: llm.downloadProgress,
    error: llm.error,
    sendMessage,
    interrupt: llm.interrupt,
    messageHistory: llm.messageHistory,
  };
}

/**
 * Fallback AI hook for platforms without ExecuTorch
 */
function useFallbackAI(systemPrompt: string): UseRippleAIResult {
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);

  const sendMessage = useCallback(async (message: string) => {
    setIsGenerating(true);

    // Add user message
    setMessageHistory((prev) => [...prev, { role: 'user', content: message }]);

    // Simulate thinking
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    // Simple keyword-based responses
    const lowerMessage = message.toLowerCase();
    let aiResponse: string;

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      aiResponse = "Hello! I'm Ripple, your guide through the mesh. How can I help you today?";
    } else if (lowerMessage.includes('identity') || lowerMessage.includes('anchor')) {
      aiResponse =
        'Your identity is cryptographically anchored - no passwords needed, just your keypair.';
    } else if (lowerMessage.includes('degree') || lowerMessage.includes('connection')) {
      aiResponse =
        'Degrees measure social distance: 0 is you, 1 is friends, 2 is friends-of-friends, 3 is the wider network.';
    } else if (lowerMessage.includes('mesh') || lowerMessage.includes('network')) {
      aiResponse =
        'The mesh is decentralized - no single server controls it. Your data flows peer-to-peer.';
    } else if (lowerMessage.includes('help')) {
      aiResponse =
        'I can explain how the mesh works, help you understand degrees of connection, or guide you through identity anchoring.';
    } else {
      aiResponse = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    }

    setResponse(aiResponse);
    setMessageHistory((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    setIsGenerating(false);
  }, []);

  const interrupt = useCallback(() => {
    setIsGenerating(false);
  }, []);

  return {
    response,
    isReady: true, // Fallback is always ready
    isGenerating,
    downloadProgress: 1, // No download needed
    error: null,
    sendMessage,
    interrupt,
    messageHistory,
  };
}
