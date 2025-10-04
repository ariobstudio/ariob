import { useCallback, useState } from '@lynx-js/react';
import {
  ensureModelLoaded,
  generateNativeChat,
  type NativeAIMessage,
  type NativeAIStatistics,
} from '@ariob/ai';
import type { ChatMessage } from './useChatMessages';

export function useChatGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [statistics, setStatistics] = useState<NativeAIStatistics | null>(null);
  const [liveStatistics, setLiveStatistics] = useState<NativeAIStatistics | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ensureModelReady = useCallback(async (modelName: string) => {
    return ensureModelLoaded(modelName);
  }, []);

  const runNativeChat = useCallback(
    async (modelName: string, conversation: NativeAIMessage[]) => {
      return generateNativeChat(modelName, conversation);
    },
    [],
  );

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const resetGeneration = useCallback(() => {
    setIsGenerating(false);
    setStatistics(null);
    setLiveStatistics(null);
    setErrorMessage(null);
  }, []);

  return {
    isGenerating,
    setIsGenerating,
    statistics,
    setStatistics,
    liveStatistics,
    setLiveStatistics,
    errorMessage,
    setErrorMessage,
    clearError,
    resetGeneration,
    ensureModelReady,
    runNativeChat,
  };
}
