/**
 * useML Hook - Main React hook for ML operations
 */

import { useState, useEffect, useCallback } from 'react';
import { createMLClient } from '../client';
import type { MLClient } from '../client/ml-client';
import type {
  MLModelConfiguration,
  MLModelInfo,
  MLMemoryRecommendations,
  MLError,
  MLChatMessage,
  MLChatOptions,
  MLStreamingSession
} from '../types';
import type { MLXGenerationParameters, MLXStreamingOptions } from '../types/inference';

export interface UseMLOptions {
  autoInit?: boolean;
}

export interface UseMLResult {
  client: MLClient | null;
  isReady: boolean;
  error: MLError | null;

  // Model Management
  loadModel: (config: MLModelConfiguration) => Promise<void>;
  unloadModel: (modelId: string) => Promise<void>;
  getLoadedModels: () => Promise<string[]>;
  isModelLoaded: (modelId: string) => Promise<boolean>;

  // Text Generation
  generateText: (modelId: string, prompt: string, options?: MLXGenerationParameters) => Promise<string>;
  streamText: (
    modelId: string,
    prompt: string,
    options?: MLXStreamingOptions & { parameters?: MLXGenerationParameters }
  ) => Promise<MLStreamingSession>;
  chat: (modelId: string, messages: MLChatMessage[], options?: MLChatOptions) => Promise<string>;

  // Image Operations
  analyzeImage: (modelId: string, imageData: string, prompt?: string, options?: MLXGenerationParameters) => Promise<string>;
  generateImage: (modelId: string, prompt: string, options?: MLXGenerationParameters) => Promise<string>;

  // Audio Operations
  synthesizeSpeech: (modelId: string, text: string, options?: MLXGenerationParameters) => Promise<string>;
  transcribeAudio: (modelId: string, audioData: string, options?: MLXGenerationParameters) => Promise<string>;

  // Memory Management
  getMemoryUsage: () => Promise<MLMemoryRecommendations>;
  clearMemory: () => Promise<void>;
  setMemoryLimit: (bytes: number) => Promise<void>;
}

export function useML(options: UseMLOptions = {}): UseMLResult {
  const { autoInit = true } = options;

  const [client, setClient] = useState<MLClient | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<MLError | null>(null);

  useEffect(() => {
    if (autoInit) {
      try {
        const mlClient = createMLClient();
        setClient(mlClient);
        setIsReady(true);
        setError(null);
      } catch (err) {
        setError(err as MLError);
        setIsReady(false);
      }
    }
  }, [autoInit]);

  const loadModel = useCallback(async (config: MLModelConfiguration) => {
    if (!client) throw new Error('ML client not initialized');

    const result = await client.loadModel(config);
    if (result.isErr()) {
      throw result.error;
    }
  }, [client]);

  const unloadModel = useCallback(async (modelId: string) => {
    if (!client) throw new Error('ML client not initialized');

    const result = await client.unloadModel(modelId);
    if (result.isErr()) {
      throw result.error;
    }
  }, [client]);

  const getLoadedModels = useCallback(async (): Promise<string[]> => {
    if (!client) throw new Error('ML client not initialized');

    return await client.getLoadedModelIds();
  }, [client]);

  const isModelLoaded = useCallback(async (modelId: string): Promise<boolean> => {
    if (!client) throw new Error('ML client not initialized');

    return await client.isModelLoaded(modelId);
  }, [client]);

  const generateText = useCallback(async (modelId: string, prompt: string, options?: MLXGenerationParameters): Promise<string> => {
    if (!client) throw new Error('ML client not initialized');

    const result = await client.generateText(modelId, prompt, options);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value.text;
  }, [client]);

  const streamText = useCallback(async (
    modelId: string,
    prompt: string,
    options?: MLXStreamingOptions & { parameters?: MLXGenerationParameters }
  ): Promise<MLStreamingSession> => {
    if (!client) throw new Error('ML client not initialized');

    const result = await client.streamText(modelId, prompt, options);
    if (result.isErr()) {
      throw result.error;
    }

    return {
      sessionId: result.value.sessionId,
      modelId: result.value.modelId,
      status: 'active',
      startTime: result.value.timestamp,
      tokens: 0
    } as MLStreamingSession;
  }, [client]);

  const chat = useCallback(async (
    modelId: string,
    messages: MLChatMessage[],
    options?: MLChatOptions
  ): Promise<string> => {
    if (!client) throw new Error('ML client not initialized');

    const result = await client.chat(modelId, messages, options);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value.text;
  }, [client]);

  const analyzeImage = useCallback(async (
    modelId: string,
    imageData: string,
    prompt?: string,
    options?: MLXGenerationParameters
  ): Promise<string> => {
    if (!client) throw new Error('ML client not initialized');

    const result = await client.analyzeImage(modelId, imageData, prompt, options);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value.analysis;
  }, [client]);

  const generateImage = useCallback(async (
    modelId: string,
    prompt: string,
    options?: MLXGenerationParameters
  ): Promise<string> => {
    if (!client) throw new Error('ML client not initialized');

    const result = await client.generateImage(modelId, prompt, options);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value.imageData;
  }, [client]);

  const synthesizeSpeech = useCallback(async (
    modelId: string,
    text: string,
    options?: MLXGenerationParameters
  ): Promise<string> => {
    if (!client) throw new Error('ML client not initialized');

    const result = await client.synthesizeSpeech(modelId, text, options);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value.audioData;
  }, [client]);

  const transcribeAudio = useCallback(async (
    modelId: string,
    audioData: string,
    options?: MLXGenerationParameters
  ): Promise<string> => {
    if (!client) throw new Error('ML client not initialized');

    const result = await client.transcribeAudio(modelId, audioData, options);
    if (result.isErr()) {
      throw result.error;
    }
    return result.value.transcription;
  }, [client]);

  const getMemoryUsage = useCallback(async (): Promise<MLMemoryRecommendations> => {
    if (!client) throw new Error('ML client not initialized');

    const result = await client.getMemoryUsage();
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }, [client]);

  const clearMemory = useCallback(async (): Promise<void> => {
    if (!client) throw new Error('ML client not initialized');

    const result = await client.clearMemory();
    if (result.isErr()) {
      throw result.error;
    }
  }, [client]);

  const setMemoryLimit = useCallback(async (bytes: number): Promise<void> => {
    if (!client) throw new Error('ML client not initialized');

    const result = await client.setMaxMemoryUsage(bytes);
    if (result.isErr()) {
      throw result.error;
    }
  }, [client]);

  return {
    client,
    isReady,
    error,
    loadModel,
    unloadModel,
    getLoadedModels,
    isModelLoaded,
    generateText,
    streamText,
    chat,
    analyzeImage,
    generateImage,
    synthesizeSpeech,
    transcribeAudio,
    getMemoryUsage,
    clearMemory,
    setMemoryLimit,
  };
}