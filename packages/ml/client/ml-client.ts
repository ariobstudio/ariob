/**
 * ML Client Implementation
 */

import { Result, ok, err } from 'neverthrow';
import type {
  MLNativeModule,
  MLModelConfiguration,
  MLModelInfo,
  MLModelLoadingProgress,
  MLMemoryInfo,
  MLMemoryRecommendations,
  MLInferenceParameters,
  MLResponse,
  MLSuccessResponse,
  MLErrorResponse,
  MLChatMessage,
  MLChatOptions,
  MLError,
  MLErrorCode,
  MLStreamingChunk,
  MLStreamingSession,
  MLNativeSuccessResponse,
  MLNativeErrorResponse
} from '../types';
import type {
  MLXGenerationParameters,
  MLXStreamingResult,
  MLXStreamingOptions,
  MLXInferenceResult
} from '../types/inference';
import {
  validateModelConfiguration,
  validateChatOptions
} from '../schemas';
import { parseMLResponse, parseMLResponseFromJSON, createMLError, shouldRetryError, createExponentialBackoff } from './utils';

// Access Lynx native module following Lynx patterns
const NativeMLXModule: MLNativeModule = (() => {
  const nativeModules = (globalThis as any).NativeModules;
  if (!nativeModules?.NativeMLXModule) {
    throw new Error('NativeMLXModule not found. Ensure the module is registered with Lynx runtime.');
  }
  return nativeModules.NativeMLXModule;
})();

export class MLClient {
  private static instance: MLClient | null = null;

  public static getInstance(): MLClient {
    if (!MLClient.instance) {
      MLClient.instance = new MLClient();
    }
    return MLClient.instance;
  }

  private constructor() {}

  private handleNativeResponse<T>(response: string): Result<T, MLError> {
    return parseMLResponseFromJSON<T>(response);
  }

  private async withRetry<T>(
    operation: () => Result<T, MLError>,
    maxRetries: number = 3
  ): Promise<Result<T, MLError>> {
    const getDelay = createExponentialBackoff();
    let lastError: MLError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const result = operation();

      if (result.isOk()) {
        return result;
      }

      lastError = result.error;

      // Don't retry on certain error types
      if (!shouldRetryError(lastError)) {
        break;
      }

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, getDelay(attempt)));
      }
    }

    return err(lastError!);
  }

  private wrapCallback<T>(resolve: (value: Result<T, MLError>) => void) {
    return (success: string | null, error: string | null) => {
      if (error) {
        const errorResult = this.handleNativeResponse<never>(error);
        resolve(errorResult as Result<T, MLError>);
      } else if (success) {
        const successResult = this.handleNativeResponse<T>(success);
        resolve(successResult);
      } else {
        resolve(err(createMLError('No response received', 'UNKNOWN_ERROR')));
      }
    };
  }

  // Model Management
  async loadModel(config: MLModelConfiguration): Promise<Result<{ modelId: string; status: string; message?: string }, MLError>> {
    try {
      const validatedConfig = validateModelConfiguration(config);
      const configString = JSON.stringify(validatedConfig);

      const response = NativeMLXModule.loadModel(configString);
      return this.handleNativeResponse<{ modelId: string; status: string; message?: string }>(response);
    } catch (error) {
      return err(createMLError(`Model validation failed: ${error}`, 'INVALID_PARAMETERS'));
    }
  }

  async checkModelLoadingProgress(modelId: string): Promise<Result<MLModelLoadingProgress, MLError>> {
    const response = NativeMLXModule.checkModelLoadingProgress(modelId);
    return this.handleNativeResponse<MLModelLoadingProgress>(response);
  }

  async cancelModelLoading(modelId: string): Promise<Result<{ modelId: string; status: string }, MLError>> {
    const response = NativeMLXModule.cancelModelLoading(modelId);
    return this.handleNativeResponse<{ modelId: string; status: string }>(response);
  }

  async waitForModelLoading(
    modelId: string,
    onProgress?: (progress: MLModelLoadingProgress) => void,
    timeout: number = 300000 // 5 minutes
  ): Promise<Result<MLModelInfo, MLError>> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const progressResult = await this.checkModelLoadingProgress(modelId);

      if (progressResult.isErr()) {
        return err(progressResult.error);
      }

      const progress = progressResult.value;
      onProgress?.(progress);

      switch (progress.status) {
        case 'loaded':
          return this.getModelInfo(modelId);
        case 'cancelled':
        case 'error':
          return err(createMLError(`Model loading ${progress.status}: ${progress.error || 'Unknown error'}`, 'MODEL_LOAD_FAILED'));
        default:
          // Continue waiting
          await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return err(createMLError('Model loading timeout', 'MODEL_LOAD_FAILED'));
  }

  async unloadModel(modelId: string): Promise<Result<{ modelId: string; status: string }, MLError>> {
    const response = NativeMLXModule.unloadModel(modelId);
    return this.handleNativeResponse<{ modelId: string; status: string }>(response);
  }

  async getLoadedModels(): Promise<Result<{ models: string[]; count: number; memoryInfo: any }, MLError>> {
    const response = NativeMLXModule.listLoadedModels();
    return this.handleNativeResponse<{ models: string[]; count: number; memoryInfo: any }>(response);
  }

  async getModelInfo(modelId: string): Promise<Result<MLModelInfo, MLError>> {
    const response = NativeMLXModule.getModelInfo(modelId);
    return this.handleNativeResponse<MLModelInfo>(response);
  }


  // Text Generation
  async generateText(
    modelId: string,
    prompt: string,
    options?: MLXGenerationParameters
  ): Promise<Result<{ text: string; inferenceTime: number; tokensGenerated?: number }, MLError>> {
    const optionsString = options ? JSON.stringify(options) : undefined;
    const response = NativeMLXModule.generateText(modelId, prompt, optionsString);
    const result = this.handleNativeResponse<{
      generatedText: string;
      inferenceTime: number;
      tokensGenerated?: number;
    }>(response);

    return result.map(data => ({
      text: data.generatedText,
      inferenceTime: data.inferenceTime,
      tokensGenerated: data.tokensGenerated
    }));
  }

  async streamText(
    modelId: string,
    prompt: string,
    options?: MLXStreamingOptions & { parameters?: MLXGenerationParameters }
  ): Promise<Result<MLXStreamingResult, MLError>> {
    const request = JSON.stringify({
      modelId,
      prompt,
      options: options?.parameters || {}
    });

    let currentSession: MLStreamingSession | null = null;

    const response = NativeMLXModule.streamInference(request, (chunkJson: string) => {
      try {
        const parsed = JSON.parse(chunkJson) as MLNativeSuccessResponse<MLStreamingChunk>;

        if (parsed.success && parsed.data) {
          const chunk = parsed.data;

          // Update session info
          if (!currentSession && chunk.sessionId) {
            currentSession = {
              sessionId: chunk.sessionId,
              modelId,
              status: 'active',
              startTime: chunk.timestamp,
              tokens: 0
            };
          }

          // Handle different chunk types
          switch (chunk.type) {
            case 'token':
              if (currentSession) currentSession.tokens = (currentSession.tokens || 0) + 1;
              options?.onChunk?.(chunk);
              break;
            case 'complete':
              if (currentSession) currentSession.status = 'completed';
              options?.onComplete?.(currentSession!);
              break;
            case 'cancelled':
              if (currentSession) currentSession.status = 'cancelled';
              options?.onCancel?.(currentSession!);
              break;
            case 'error':
              if (currentSession) currentSession.status = 'error';
              options?.onError?.(new Error(chunk.error || 'Streaming error'), currentSession!);
              break;
          }
        }
      } catch (error) {
        options?.onError?.(new Error(`Failed to parse chunk: ${error}`), currentSession!);
      }
    });

    const result = this.handleNativeResponse<{ sessionId: string; status: string }>(response);

    return result.map(data => ({
      sessionId: data.sessionId,
      modelId,
      status: data.status as 'streaming_started' | 'error',
      timestamp: Date.now(),
      cancel: async () => {
        // In a real implementation, you'd call a cancel method
        return true;
      },
      getSession: () => currentSession
    }));
  }

  private async chatCompletion(
    modelId: string,
    messages: MLChatMessage[],
    options?: MLChatOptions
  ): Promise<Result<{ text: string; inferenceTime: number }, MLError>> {
    try {
      const validatedOptions = options ? validateChatOptions(options) : undefined;

      // Enhanced prompt formatting
      let prompt = '';
      if (options?.systemMessage) {
        prompt += `System: ${options.systemMessage}\n\n`;
      }

      prompt += messages.map(msg => {
        const roleMap = { system: 'System', user: 'User', assistant: 'Assistant' };
        return `${roleMap[msg.role]}: ${msg.content}`;
      }).join('\n\n');

      prompt += '\n\nAssistant: ';

      const result = await this.generateText(modelId, prompt, validatedOptions as MLXGenerationParameters);
      return result;
    } catch (error) {
      return err(createMLError(`Chat validation failed: ${error}`, 'INVALID_PARAMETERS'));
    }
  }

  // Vision Language Models
  async analyzeImage(
    modelId: string,
    imageData: string,
    prompt?: string,
    options?: MLXGenerationParameters
  ): Promise<Result<{ analysis: string; inferenceTime: number }, MLError>> {
    const response = NativeMLXModule.analyzeImage(modelId, imageData, prompt);
    return this.handleNativeResponse<{ analysis: string; inferenceTime: number }>(response);
  }

  // Image Generation
  async generateImage(
    modelId: string,
    prompt: string,
    options?: MLXGenerationParameters
  ): Promise<Result<{ imageData: string; format: string; inferenceTime: number }, MLError>> {
    const optionsString = options ? JSON.stringify(options) : undefined;
    const response = NativeMLXModule.generateImage(modelId, prompt, optionsString);
    return this.handleNativeResponse<{ imageData: string; format: string; inferenceTime: number }>(response);
  }

  // Audio Generation (TTS)
  async synthesizeSpeech(
    modelId: string,
    text: string,
    options?: MLXGenerationParameters
  ): Promise<Result<{ audioData: string; format: string; inferenceTime: number }, MLError>> {
    const optionsString = options ? JSON.stringify(options) : undefined;
    const response = NativeMLXModule.synthesizeSpeech(modelId, text, optionsString);
    return this.handleNativeResponse<{ audioData: string; format: string; inferenceTime: number }>(response);
  }

  // Audio Transcription (Whisper)
  async transcribeAudio(
    modelId: string,
    audioData: string,
    options?: MLXGenerationParameters
  ): Promise<Result<{ transcription: string; inferenceTime: number }, MLError>> {
    const optionsString = options ? JSON.stringify(options) : undefined;
    const response = NativeMLXModule.transcribeAudio(modelId, audioData, optionsString);
    return this.handleNativeResponse<{ transcription: string; inferenceTime: number }>(response);
  }


  // Memory Management
  async getMemoryUsage(): Promise<Result<MLMemoryRecommendations, MLError>> {
    const response = NativeMLXModule.getAvailableMemory();
    return this.handleNativeResponse<MLMemoryRecommendations>(response);
  }

  async setMaxMemoryUsage(bytes: number): Promise<Result<{
    previousCacheLimit: number;
    newCacheLimit: number;
    cacheLimitMB: number;
  }, MLError>> {
    const response = NativeMLXModule.setMaxMemoryUsage(bytes);
    return this.handleNativeResponse<{
      previousCacheLimit: number;
      newCacheLimit: number;
      cacheLimitMB: number;
    }>(response);
  }

  async clearMemory(): Promise<Result<{ status: string; memoryDelta: any }, MLError>> {
    const response = NativeMLXModule.clearModelCache();
    return this.handleNativeResponse<{ status: string; memoryDelta: any }>(response);
  }

  // High-level interfaces
  async performInference(
    modelId: string,
    request: {
      input?: string;
      prompt?: string;
      imageData?: string;
      options?: MLXGenerationParameters;
    }
  ): Promise<Result<MLXInferenceResult, MLError>> {
    const requestJson = JSON.stringify({ modelId, ...request });
    const response = NativeMLXModule.inference(requestJson);
    return this.handleNativeResponse<MLXInferenceResult>(response);
  }

  async chat(
    modelId: string,
    messages: MLChatMessage[],
    options?: MLChatOptions
  ): Promise<Result<{ text: string; inferenceTime: number }, MLError>> {
    return this.chatCompletion(modelId, messages, options);
  }

  // Utility methods
  async isModelLoaded(modelId: string): Promise<boolean> {
    const result = await this.getModelInfo(modelId);
    return result.isOk();
  }

  async getLoadedModelIds(): Promise<string[]> {
    const result = await this.getLoadedModels();
    return result.isOk() ? result.value.models : [];
  }
}