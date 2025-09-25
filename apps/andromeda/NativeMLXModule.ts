/**
 * NativeMLXModule TypeScript Wrapper
 * Provides a clean, type-safe interface for using MLX models in React Native/Lynx apps
 */

// @ts-ignore
declare const NativeModules: any;

export type ModelType = 'llm' | 'vlm' | 'image-gen' | 'tts' | 'whisper' | 'custom';
export type ModelSource = 'huggingface' | 'local' | 'url';

export interface ModelConfig {
  modelId: string;
  modelType: ModelType;
  source?: ModelSource;
  quantization?: string;
  additionalParams?: Record<string, any>;
}

export interface ModelInfo {
  id: string;
  type: ModelType;
  status: 'loading' | 'loaded' | 'error';
  memoryUsage?: number;
  metadata?: Record<string, any>;
  loadedAt?: string;
}

export interface InferenceRequest {
  modelId: string;
  input: any;
  options?: Record<string, any>;
}

export interface InferenceResult {
  success: boolean;
  result?: any;
  error?: string;
}

export interface TextGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  repetitionPenalty?: number;
  stopSequences?: string[];
  seed?: number;
}

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  steps?: number;
  guidanceScale?: number;
  negativePrompt?: string;
  seed?: number;
}

export interface TTSOptions {
  voice?: string;
  speed?: number;
  pitch?: number;
  language?: string;
  format?: 'mp3' | 'wav' | 'aac';
}

export interface TranscriptionOptions {
  language?: string;
  task?: 'transcribe' | 'translate';
  timestamps?: boolean;
}

export interface MemoryInfo {
  totalMemory: number;
  usedMemory: number;
  availableMemory: number;
}

/**
 * MLX Module class providing high-level API for ML models
 */
class MLXModule {
  private nativeModule: any;
  private streamHandlers: Map<string, (chunk: any) => void> = new Map();

  constructor() {
    this.nativeModule = NativeModules.NativeMLXModule;
    if (!this.nativeModule) {
      throw new Error('NativeMLXModule is not available. Make sure the native module is properly linked.');
    }
  }

  private parseResponse<T>(response: string): T {
    try {
      const parsed = JSON.parse(response);
      if (!parsed.success && parsed.error) {
        throw new Error(parsed.error);
      }
      return parsed as T;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse response: ${response}`);
      }
      throw error;
    }
  }

  // Model Management

  /**
   * Load a model with the specified configuration
   */
  async loadModel(config: ModelConfig): Promise<ModelInfo> {
    const response = this.nativeModule.loadModel(JSON.stringify(config));
    const result = this.parseResponse<ModelInfo>(response);
    
    // Poll for loading completion if status is 'loading'
    if (result.status === 'loading') {
      return this.waitForModelLoad(config.modelId);
    }
    
    return result;
  }

  /**
   * Wait for a model to finish loading
   */
  private async waitForModelLoad(modelId: string, maxAttempts = 60): Promise<ModelInfo> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const info = await this.getModelInfo(modelId);
        if (info.status === 'loaded') {
          return info;
        } else if (info.status === 'error') {
          throw new Error(`Model loading failed: ${modelId}`);
        }
      } catch (error) {
        // Model might not be ready yet, continue polling
      }
    }
    
    throw new Error(`Model loading timeout: ${modelId}`);
  }

  /**
   * Unload a model from memory
   */
  async unloadModel(modelId: string): Promise<void> {
    const response = this.nativeModule.unloadModel(modelId);
    this.parseResponse<{ status: string }>(response);
  }

  /**
   * Get information about a loaded model
   */
  async getModelInfo(modelId: string): Promise<ModelInfo> {
    const response = this.nativeModule.getModelInfo(modelId);
    return this.parseResponse<ModelInfo>(response);
  }

  /**
   * List all currently loaded models
   */
  async listLoadedModels(): Promise<ModelInfo[]> {
    const response = this.nativeModule.listLoadedModels();
    const result = this.parseResponse<{ models: ModelInfo[] }>(response);
    return result.models;
  }

  // Inference Methods

  /**
   * Run inference on a model
   */
  async inference(request: InferenceRequest): Promise<any> {
    const response = this.nativeModule.inference(JSON.stringify(request));
    const result = this.parseResponse<{ result: any }>(response);
    return result.result;
  }

  /**
   * Stream inference results from a model
   */
  async streamInference(
    request: InferenceRequest,
    onChunk: (chunk: any) => void
  ): Promise<void> {
    const streamId = `${request.modelId}-${Date.now()}`;
    this.streamHandlers.set(streamId, onChunk);

    return new Promise((resolve, reject) => {
      try {
        const response = this.nativeModule.streamInference(
          JSON.stringify(request),
          (chunkData: string) => {
            try {
              const parsed = JSON.parse(chunkData);
              if (parsed.status === 'complete') {
                this.streamHandlers.delete(streamId);
                resolve();
              } else if (parsed.error) {
                this.streamHandlers.delete(streamId);
                reject(new Error(parsed.error));
              } else if (parsed.chunk) {
                const handler = this.streamHandlers.get(streamId);
                if (handler) {
                  handler(parsed.chunk);
                }
              }
            } catch (error) {
              this.streamHandlers.delete(streamId);
              reject(error);
            }
          }
        );

        const initialResponse = this.parseResponse<{ status: string }>(response);
        if (initialResponse.status !== 'streaming') {
          this.streamHandlers.delete(streamId);
          reject(new Error('Failed to start streaming'));
        }
      } catch (error) {
        this.streamHandlers.delete(streamId);
        reject(error);
      }
    });
  }

  // Text Generation (LLM)

  /**
   * Generate text using a loaded LLM
   */
  async generateText(
    modelId: string,
    prompt: string,
    options?: TextGenerationOptions
  ): Promise<string> {
    const response = this.nativeModule.generateText(
      modelId,
      prompt,
      options ? JSON.stringify(options) : undefined
    );
    const result = this.parseResponse<{ result: { generated_text: string } }>(response);
    return result.result.generated_text;
  }

  /**
   * Stream text generation from an LLM
   */
  async streamText(
    modelId: string,
    prompt: string,
    onChunk: (text: string) => void,
    options?: TextGenerationOptions
  ): Promise<void> {
    const request: InferenceRequest = {
      modelId,
      input: { prompt },
      options: options || {}
    };

    return this.streamInference(request, onChunk);
  }

  // Image Generation

  /**
   * Generate an image from a text prompt
   */
  async generateImage(
    modelId: string,
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<string> {
    const response = this.nativeModule.generateImage(
      modelId,
      prompt,
      options ? JSON.stringify(options) : undefined
    );
    const result = this.parseResponse<{ result: { image: string } }>(response);
    return result.result.image;
  }

  // Vision-Language Models

  /**
   * Analyze an image with optional text prompt
   */
  async analyzeImage(
    modelId: string,
    imageData: string,
    prompt?: string
  ): Promise<any> {
    const response = this.nativeModule.analyzeImage(modelId, imageData, prompt);
    const result = this.parseResponse<{ result: any }>(response);
    return result.result;
  }

  // Text-to-Speech

  /**
   * Synthesize speech from text
   */
  async synthesizeSpeech(
    modelId: string,
    text: string,
    options?: TTSOptions
  ): Promise<string> {
    const response = this.nativeModule.synthesizeSpeech(
      modelId,
      text,
      options ? JSON.stringify(options) : undefined
    );
    const result = this.parseResponse<{ result: { audio: string } }>(response);
    return result.result.audio;
  }

  // Speech-to-Text

  /**
   * Transcribe audio to text
   */
  async transcribeAudio(
    modelId: string,
    audioData: string,
    options?: TranscriptionOptions
  ): Promise<string> {
    const response = this.nativeModule.transcribeAudio(
      modelId,
      audioData,
      options ? JSON.stringify(options) : undefined
    );
    const result = this.parseResponse<{ result: { transcription: string } }>(response);
    return result.result.transcription;
  }

  // Memory Management

  /**
   * Clear all cached models from memory
   */
  async clearModelCache(): Promise<void> {
    const response = this.nativeModule.clearModelCache();
    this.parseResponse<{ status: string }>(response);
  }

  /**
   * Get available memory information
   */
  async getMemoryInfo(): Promise<MemoryInfo> {
    const response = this.nativeModule.getAvailableMemory();
    return this.parseResponse<MemoryInfo>(response);
  }

  /**
   * Set maximum memory usage for models
   */
  async setMaxMemoryUsage(bytes: number): Promise<void> {
    const response = this.nativeModule.setMaxMemoryUsage(bytes);
    this.parseResponse<{ maxMemoryUsage: number }>(response);
  }
}

// Export singleton instance
export const mlx = new MLXModule();

// Also export the class for custom instantiation if needed
export default MLXModule;

// React Hooks for easier integration
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for loading and managing a model
 */
export function useMLXModel(config: ModelConfig) {
  const [model, setModel] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModel = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const modelInfo = await mlx.loadModel(config);
      setModel(modelInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model');
    } finally {
      setLoading(false);
    }
  }, [config.modelId, config.modelType]);

  const unloadModel = useCallback(async () => {
    if (model) {
      try {
        await mlx.unloadModel(model.id);
        setModel(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to unload model');
      }
    }
  }, [model]);

  useEffect(() => {
    return () => {
      // Cleanup: unload model on unmount
      if (model) {
        mlx.unloadModel(model.id).catch(console.error);
      }
    };
  }, [model]);

  return {
    model,
    loading,
    error,
    loadModel,
    unloadModel
  };
}

/**
 * Hook for text generation with streaming support
 */
export function useTextGeneration(modelId?: string) {
  const [generating, setGenerating] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const generate = useCallback(async (
    prompt: string,
    options?: TextGenerationOptions,
    streaming = false
  ) => {
    if (!modelId) {
      setError('No model ID provided');
      return;
    }

    setGenerating(true);
    setError(null);
    setText('');
    abortRef.current = false;

    try {
      if (streaming) {
        await mlx.streamText(
          modelId,
          prompt,
          (chunk) => {
            if (!abortRef.current) {
              setText(prev => prev + chunk);
            }
          },
          options
        );
      } else {
        const result = await mlx.generateText(modelId, prompt, options);
        if (!abortRef.current) {
          setText(result);
        }
      }
    } catch (err) {
      if (!abortRef.current) {
        setError(err instanceof Error ? err.message : 'Generation failed');
      }
    } finally {
      setGenerating(false);
    }
  }, [modelId]);

  const abort = useCallback(() => {
    abortRef.current = true;
    setGenerating(false);
  }, []);

  return {
    text,
    generating,
    error,
    generate,
    abort
  };
}

/**
 * Hook for image generation
 */
export function useImageGeneration(modelId?: string) {
  const [generating, setGenerating] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (
    prompt: string,
    options?: ImageGenerationOptions
  ) => {
    if (!modelId) {
      setError('No model ID provided');
      return;
    }

    setGenerating(true);
    setError(null);
    setImage(null);

    try {
      const result = await mlx.generateImage(modelId, prompt, options);
      setImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }, [modelId]);

  return {
    image,
    generating,
    error,
    generate
  };
}