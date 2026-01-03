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
 * Check if ExecuTorch is available
 */
export function isExecuTorchAvailable(): boolean {
  return useLLMHook !== null;
}

/**
 * Hook for interacting with Ripple AI companion using ExecuTorch
 *
 * Important: Call interrupt() before unmounting to prevent crashes.
 * See: https://docs.swmansion.com/react-native-executorch/docs/hooks/natural-language-processing/useLLM
 */
export function useRippleAIExecuTorch(options: UseRippleAIOptions = {}): UseRippleAIResult {
  const { model: modelOverride, systemPrompt: systemPromptOverride, preventLoad = false } = options;
  const { model: settingsModel, profile } = useAISettings();

  const model = modelOverride ?? settingsModel ?? DEFAULT_MODEL;
  const systemPrompt = systemPromptOverride ?? profile.systemPrompt ?? DEFAULT_SYSTEM_PROMPT;

  // Track if module was unloaded (ExecuTorch limitation)
  const [needsReload, setNeedsReload] = useState(false);

  // Call the hook unconditionally
  const llm = useLLMHook!({
    model: {
      modelSource: model.modelSource,
      tokenizerSource: model.tokenizerSource,
      tokenizerConfigSource: model.tokenizerConfigSource ?? model.tokenizerSource,
    },
    preventLoad,
  });

  // Configure system prompt when model is ready
  const configuredRef = useRef(false);

  useEffect(() => {
    if (llm.isReady && !configuredRef.current && llm.configure) {
      configuredRef.current = true;
      console.log('[useRippleAI] Configuring with system prompt');
      llm.configure({
        chatConfig: {
          systemPrompt,
        },
      });
    }
  }, [llm.isReady, llm.configure, systemPrompt]);

  // Clean up on unmount - call interrupt() to prevent crash
  // Wrapped in try-catch because nativeModule may be undefined if load failed
  useEffect(() => {
    return () => {
      try {
        // Per docs: "Dismounting while generation runs causes crashes; call interrupt() first"
        if (llm.isGenerating) {
          llm.interrupt();
        }
      } catch (e) {
        // Silently handle cleanup errors (e.g., nativeModule undefined)
        console.warn('[useRippleAI] Cleanup error:', e);
      }
    };
  }, [llm]);

  // Send message handler - always use sendMessage for stateful conversation
  const sendMessage = useCallback(async (message: string) => {
    // Check if module was unloaded
    if (needsReload) {
      throw new Error('Model was unloaded. Please reload to continue.');
    }

    // Verify model is ready
    if (!llm.isReady || typeof llm.sendMessage !== 'function') {
      console.log('[useRippleAI] Model not ready, ignoring message', {
        isReady: llm.isReady,
        hasSendMessage: typeof llm.sendMessage === 'function',
      });
      return;
    }

    try {
      console.log('[useRippleAI] Sending message:', message);
      await llm.sendMessage(message);
      console.log('[useRippleAI] Message sent successfully');
    } catch (error: any) {
      console.error('[useRippleAI] Error sending message:', error);
      // Check if it's the ModuleNotLoaded error - this happens when ExecuTorch unloads
      if (error?.message?.includes('ModuleNotLoaded')) {
        console.log('[useRippleAI] Module was unloaded, setting needsReload');
        setNeedsReload(true);
        throw new Error('Model was unloaded. Tap "Reload" to continue.');
      }
      throw error;
    }
  }, [llm, needsReload]);

  // Interrupt handler
  const interrupt = useCallback(() => {
    llm.interrupt();
  }, [llm]);

  return {
    response: llm.response,
    isReady: llm.isReady,
    isGenerating: llm.isGenerating,
    downloadProgress: llm.downloadProgress,
    error: llm.error,
    needsReload,
    sendMessage,
    interrupt,
    messageHistory: llm.messageHistory,
  };
}

/**
 * Fallback hook for platforms without ExecuTorch
 */
export function useRippleAIFallback(_options: UseRippleAIOptions = {}): UseRippleAIResult {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _settings = useAISettings();

  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);

  const sendMessage = useCallback(async (message: string) => {
    setIsGenerating(true);
    setMessageHistory((prev) => [...prev, { role: 'user', content: message }]);

    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    const lowerMessage = message.toLowerCase();
    let aiResponse: string;

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      aiResponse = "Hello! I'm Ripple, your guide through the mesh. How can I help you today?";
    } else if (lowerMessage.includes('identity') || lowerMessage.includes('anchor')) {
      aiResponse = 'Your identity is cryptographically anchored - no passwords needed, just your keypair.';
    } else if (lowerMessage.includes('degree') || lowerMessage.includes('connection')) {
      aiResponse = 'Degrees measure social distance: 0 is you, 1 is friends, 2 is friends-of-friends, 3 is the wider network.';
    } else if (lowerMessage.includes('mesh') || lowerMessage.includes('network')) {
      aiResponse = 'The mesh is decentralized - no single server controls it. Your data flows peer-to-peer.';
    } else if (lowerMessage.includes('help')) {
      aiResponse = 'I can explain how the mesh works, help you understand degrees of connection, or guide you through identity anchoring.';
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
    isReady: true,
    isGenerating,
    downloadProgress: 1,
    error: null,
    needsReload: false,
    sendMessage,
    interrupt,
    messageHistory,
  };
}

/**
 * Hook for interacting with Ripple AI companion
 *
 * Automatically uses ExecuTorch if available, otherwise falls back to
 * simulated responses.
 */
export function useRippleAI(options: UseRippleAIOptions = {}): UseRippleAIResult {
  // Determine which implementation to use at module load time
  // This ensures consistent hook ordering
  if (useLLMHook) {
    return useRippleAIExecuTorch(options);
  }
  return useRippleAIFallback(options);
}
