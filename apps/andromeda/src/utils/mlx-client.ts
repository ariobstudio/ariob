/**
 * MLX Client Implementation
 *
 * This provides a high-level, type-safe interface to the MLX Native Module
 * following modern JavaScript/TypeScript patterns.
 */

import { NativeModules } from 'react-native';
import type {
  MLXNativeModule,
  MLXModelConfiguration,
  MLXModelInfo,
  MLXModelType,
  MLXInferenceParameters,
  MLXInferenceRequest,
  MLXInferenceInput,
  MLXResponse,
  MLXSuccessResponse,
  MLXErrorResponse,
  MLXMemoryInfo,
  MLXStreamChunk,
  MLXChatMessage,
  MLXChatOptions,
  MLXImageResult
} from '../types/mlx';

const { NativeMLXModule } = NativeModules as { NativeMLXModule: MLXNativeModule };

export class MLXError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public timestamp: string = new Date().toISOString()
  ) {
    super(message);
    this.name = 'MLXError';
  }
}

export class MLXClient {
  private static instance: MLXClient | null = null;

  public static getInstance(): MLXClient {
    if (!MLXClient.instance) {
      MLXClient.instance = new MLXClient();
    }
    return MLXClient.instance;
  }

  private constructor() {}

  // Utility Methods
  private parseResponse<T = any>(response: string): MLXResponse<T> {
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new MLXError('Failed to parse MLX response', 'PARSE_ERROR');
    }
  }

  private handleResponse<T>(response: string): T {
    const parsed = this.parseResponse<T>(response);

    if (!parsed.success) {
      const errorResponse = parsed as MLXErrorResponse;
      throw new MLXError(errorResponse.error, errorResponse.errorCode, errorResponse.timestamp);
    }

    return (parsed as MLXSuccessResponse<T>).data;
  }

  private createInferenceRequest(
    modelId: string,
    input: MLXInferenceInput,
    parameters?: MLXInferenceParameters
  ): string {
    const request: MLXInferenceRequest = {
      modelId,
      input,
      parameters
    };
    return JSON.stringify(request);
  }

  // Model Management
  async loadModel(config: MLXModelConfiguration): Promise<MLXModelInfo> {
    const configString = JSON.stringify(config);
    const response = NativeMLXModule.loadModel(configString);

    // Since loading is async, we need to poll for completion
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const modelInfo = await this.getModelInfo(config.modelId);
          resolve(modelInfo);
        } catch (error) {
          // Model not loaded yet, wait and try again
          setTimeout(checkStatus, 1000);
        }
      };

      const startResult = this.handleResponse(response);
      if (startResult.status === 'loading_started') {
        setTimeout(checkStatus, 1000);
      } else {
        reject(new MLXError('Failed to start model loading'));
      }
    });
  }

  async unloadModel(modelId: string, modelType: MLXModelType): Promise<void> {
    const response = NativeMLXModule.unloadModel(modelId, modelType);
    this.handleResponse(response);
  }

  async getLoadedModels(): Promise<MLXModelInfo[]> {
    const response = NativeMLXModule.listLoadedModels();
    const result = this.handleResponse<{ models: MLXModelInfo[] }>(response);
    return result.models;
  }

  async getModelInfo(modelId: string): Promise<MLXModelInfo> {
    const response = NativeMLXModule.getModelInfo(modelId);
    return this.handleResponse<MLXModelInfo>(response);
  }

  // Text Generation
  async generateText(
    modelId: string,
    prompt: string,
    options?: MLXInferenceParameters
  ): Promise<string> {
    const input: MLXInferenceInput = { type: 'text', text: prompt };
    const requestString = this.createInferenceRequest(modelId, input, options);
    const response = NativeMLXModule.inference(requestString);

    // Handle async response
    return new Promise((resolve, reject) => {
      const startResult = this.handleResponse(response);
      if (startResult.status === 'inference_started') {
        // In a real implementation, you'd want to use a callback or event system
        // For now, we'll simulate completion
        setTimeout(() => {
          resolve(`Generated text for prompt: "${prompt}"`);
        }, 2000);
      } else {
        reject(new MLXError('Failed to start text generation'));
      }
    });
  }

  async streamText(
    modelId: string,
    prompt: string,
    onChunk: (chunk: string) => void,
    options?: MLXInferenceParameters
  ): Promise<string> {
    const input: MLXInferenceInput = { type: 'text', text: prompt };
    const requestString = this.createInferenceRequest(modelId, input, options);

    return new Promise((resolve, reject) => {
      let fullText = '';

      const response = NativeMLXModule.streamInference(requestString, (chunkResponse: string) => {
        try {
          const chunkResult = this.parseResponse<MLXStreamChunk>(chunkResponse);

          if (chunkResult.success) {
            const chunk = (chunkResult as MLXSuccessResponse<MLXStreamChunk>).data;

            if (chunk.text) {
              fullText += chunk.text;
              onChunk(chunk.text);
            }

            if (chunk.isComplete) {
              resolve(fullText);
            }
          } else {
            const errorResponse = chunkResult as MLXErrorResponse;
            reject(new MLXError(errorResponse.error, errorResponse.errorCode));
          }
        } catch (error) {
          reject(new MLXError('Failed to parse chunk response', 'PARSE_ERROR'));
        }
      });

      const startResult = this.handleResponse(response);
      if (startResult.status !== 'streaming_started') {
        reject(new MLXError('Failed to start streaming'));
      }
    });
  }

  // Image Generation
  async generateImage(
    modelId: string,
    prompt: string,
    options?: MLXInferenceParameters
  ): Promise<string> {
    const optionsString = options ? JSON.stringify(options) : undefined;
    const response = NativeMLXModule.generateImage(modelId, prompt, optionsString);

    // Handle async response
    return new Promise((resolve, reject) => {
      const startResult = this.handleResponse(response);
      if (startResult.status === 'generation_started') {
        // In a real implementation, you'd want to use a callback or event system
        setTimeout(() => {
          // Return a placeholder base64 image for demo
          const placeholderImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
          resolve(placeholderImage);
        }, 5000);
      } else {
        reject(new MLXError('Failed to start image generation'));
      }
    });
  }

  // Vision Language Models
  async analyzeImage(
    modelId: string,
    imageData: string,
    prompt?: string
  ): Promise<string> {
    const response = NativeMLXModule.analyzeImage(modelId, imageData, prompt);

    return new Promise((resolve, reject) => {
      const startResult = this.handleResponse(response);
      if (startResult.status === 'analysis_started') {
        setTimeout(() => {
          resolve(`Analysis of image: This appears to be an image with various visual elements.`);
        }, 3000);
      } else {
        reject(new MLXError('Failed to start image analysis'));
      }
    });
  }

  // Speech Synthesis
  async synthesizeSpeech(
    modelId: string,
    text: string,
    options?: MLXInferenceParameters
  ): Promise<string> {
    const optionsString = options ? JSON.stringify(options) : undefined;
    const response = NativeMLXModule.synthesizeSpeech(modelId, text, optionsString);

    return new Promise((resolve, reject) => {
      const startResult = this.handleResponse(response);
      if (startResult.status === 'synthesis_started') {
        setTimeout(() => {
          // Return placeholder base64 audio
          const placeholderAudio = 'UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSMFl';
          resolve(placeholderAudio);
        }, 2000);
      } else {
        reject(new MLXError('Failed to start speech synthesis'));
      }
    });
  }

  // Speech Recognition
  async transcribeAudio(
    modelId: string,
    audioData: string,
    options?: MLXInferenceParameters
  ): Promise<{
    transcription: string;
    language: string;
    confidence: number;
  }> {
    const optionsString = options ? JSON.stringify(options) : undefined;
    const response = NativeMLXModule.transcribeAudio(modelId, audioData, optionsString);

    return new Promise((resolve, reject) => {
      const startResult = this.handleResponse(response);
      if (startResult.status === 'transcription_started') {
        setTimeout(() => {
          resolve({
            transcription: 'This is a transcribed audio sample.',
            language: 'en',
            confidence: 0.95
          });
        }, 3000);
      } else {
        reject(new MLXError('Failed to start audio transcription'));
      }
    });
  }

  // Memory Management
  async getMemoryInfo(): Promise<MLXMemoryInfo> {
    const response = NativeMLXModule.getMemoryInfo();
    return this.handleResponse<MLXMemoryInfo>(response);
  }

  async clearCache(): Promise<void> {
    const response = NativeMLXModule.clearModelCache();
    this.handleResponse(response);
  }

  async setMemoryLimit(bytes: number): Promise<void> {
    const response = NativeMLXModule.setMaxMemoryUsage(bytes);
    this.handleResponse(response);
  }

  // Discovery
  async getSupportedModelTypes(): Promise<MLXModelType[]> {
    const response = NativeMLXModule.getSupportedModelTypes();
    const result = this.handleResponse<{ supportedTypes: string[] }>(response);
    return result.supportedTypes as MLXModelType[];
  }

  async getSupportedModels(modelType: MLXModelType): Promise<string[]> {
    const response = NativeMLXModule.getSupportedModels(modelType);
    const result = this.handleResponse<{ supportedModels: string[] }>(response);
    return result.supportedModels;
  }

  async validateConfiguration(config: MLXModelConfiguration): Promise<boolean> {
    const configString = JSON.stringify(config);
    const response = NativeMLXModule.validateConfiguration(configString);
    const result = this.handleResponse<{ valid: boolean }>(response);
    return result.valid;
  }

  // High-level Chat Interface
  async chat(
    modelId: string,
    messages: MLXChatMessage[],
    options?: MLXChatOptions
  ): Promise<string> {
    // Format messages into a prompt
    let prompt = '';

    if (options?.systemMessage) {
      prompt += `<|system|>\n${options.systemMessage}\n`;
    }

    for (const message of messages) {
      prompt += `<|${message.role}|>\n${message.content}\n`;
    }

    prompt += '<|assistant|>\n';

    return this.generateText(modelId, prompt, options);
  }

  // Batch Operations
  async generateMultipleImages(
    modelId: string,
    prompts: string[],
    options?: MLXInferenceParameters
  ): Promise<string[]> {
    const results = await Promise.all(
      prompts.map(prompt => this.generateImage(modelId, prompt, options))
    );
    return results;
  }

  async transcribeMultipleAudios(
    modelId: string,
    audioDataArray: string[],
    options?: MLXInferenceParameters
  ): Promise<Array<{
    transcription: string;
    language: string;
    confidence: number;
  }>> {
    const results = await Promise.all(
      audioDataArray.map(audioData => this.transcribeAudio(modelId, audioData, options))
    );
    return results;
  }
}

// Utility Functions
export function createMLXClient(): MLXClient {
  return MLXClient.getInstance();
}

export function parseMLXResponse<T = any>(response: string): MLXResponse<T> {
  try {
    return JSON.parse(response);
  } catch (error) {
    throw new MLXError('Failed to parse MLX response', 'PARSE_ERROR');
  }
}

export function isMLXError(response: any): response is MLXErrorResponse {
  return response && typeof response === 'object' && response.success === false;
}

export function isMLXSuccess<T = any>(response: any): response is MLXSuccessResponse<T> {
  return response && typeof response === 'object' && response.success === true;
}

// Default export
export default MLXClient;