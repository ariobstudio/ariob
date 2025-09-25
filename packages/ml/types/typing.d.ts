/**
 * MLX Native Module TypeScript Definitions for Lynx.js
 *
 * This file defines the interface between JavaScript/TypeScript and the
 * NativeMLXModule Swift implementation following Lynx.js native module patterns.
 */

// MARK: - Global Lynx Types

declare global {
  interface NativeModules {
    NativeMLXModule: MLXNativeModule;
  }
}

// MARK: - Main Module Interface

export interface MLXNativeModule {
  // Model Lifecycle Management
  loadModel(config: MLXModelConfig): Promise<string>;
  unloadModel(modelId: string): Promise<void>;
  isModelLoaded(modelId: string): boolean;
  getModelInfo(modelId: string): MLXModelInfo | null;
  listLoadedModels(): string[];
  clearAllModels(): Promise<void>;

  // Text Generation
  generateText(modelId: string, prompt: string, options?: MLXTextGenerationOptions): Promise<string>;
  streamGenerateText(
    modelId: string,
    prompt: string,
    options: MLXTextGenerationOptions,
    onToken: (token: string) => void
  ): Promise<void>;
  generateWithContext(
    modelId: string,
    messages: MLXChatMessage[],
    options?: MLXTextGenerationOptions
  ): Promise<string>;

  // Image Generation (Returns base64 encoded images)
  generateImage(modelId: string, prompt: string, options?: MLXImageGenerationOptions): Promise<string>;
  generateImageWithProgress(
    modelId: string,
    prompt: string,
    options: MLXImageGenerationOptions,
    onProgress: (progress: number) => void
  ): Promise<string>;
  generateImageVariations(
    modelId: string,
    baseImageData: string,
    prompt: string,
    options?: MLXImageGenerationOptions
  ): Promise<string[]>;

  // Embeddings
  generateEmbeddings(modelId: string, texts: string[], options?: MLXEmbeddingOptions): Promise<number[][]>;

  // Memory Management
  clearModelCache(): Promise<void>;
  getMemoryInfo(): MLXMemoryInfo;
  optimizeMemory(): Promise<void>;
  setMemoryThreshold(threshold: number): void;
  getMemoryThreshold(): number;

  // Advanced Features
  upscaleImage(modelId: string, imageData: string, scaleFactor: number, options?: object): Promise<string>;
  validateConfiguration(config: MLXModelConfig): MLXValidationResult;
}

// MARK: - Model Configuration Types

export interface MLXModelConfig {
  modelId: string;
  modelType: MLXModelType;
  huggingFaceId?: string;
  localPath?: string;
  quantization?: string;
  cacheConfig?: MLXCacheConfig;
}

export interface MLXCacheConfig {
  maxSize?: number;
  ttl?: number; // Time to live in seconds
}

export type MLXModelType = 'llm' | 'stable_diffusion' | 'embedding' | 'vlm';

// MARK: - Generation Options

export interface MLXTextGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  repetitionPenalty?: number;
  seed?: number;
  stopTokens?: string[];
}

export interface MLXImageGenerationOptions {
  width?: number;
  height?: number;
  numInferenceSteps?: number;
  guidanceScale?: number;
  negativePrompt?: string;
  seed?: number;
}

export interface MLXEmbeddingOptions {
  normalize?: boolean;
  pooling?: 'mean' | 'cls' | 'max';
}

// MARK: - Response Types

export interface MLXModelInfo {
  modelId: string;
  modelType: MLXModelType;
  huggingFaceId?: string;
  quantization?: string;
  isLoaded: boolean;
  memoryUsage?: number;
}

export interface MLXMemoryInfo {
  memoryLimit: number;
  cacheLimit: number;
  peakMemory: number;
  currentMemory: number;
  cacheMemory: number;
  memoryLimitMB: number;
  cacheLimitMB: number;
  peakMemoryMB: number;
  currentMemoryMB: number;
  cacheMemoryMB: number;
  memoryUsagePercent: number;
  cacheUsagePercent: number;
}

export interface MLXValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MLXChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

// MARK: - Error Types

export class MLXError extends Error {
  constructor(
    message: string,
    public code: MLXErrorCode,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MLXError';
  }
}

export type MLXErrorCode =
  | 'MODEL_NOT_FOUND'
  | 'MODEL_LOAD_FAILED'
  | 'INVALID_CONFIGURATION'
  | 'GENERATION_FAILED'
  | 'MEMORY_ERROR'
  | 'UNSUPPORTED_MODEL_TYPE'
  | 'NETWORK_ERROR'
  | 'PERMISSION_DENIED';

// MARK: - Utility Types

export interface MLXProgress {
  current: number;
  total: number;
  percentage: number;
  stage: string;
}

export interface MLXGenerationMetadata {
  modelId: string;
  prompt: string;
  generatedTokens: number;
  totalTime: number;
  tokensPerSecond: number;
  memoryUsed: number;
}

// MARK: - Streaming Types

export type MLXTokenCallback = (token: string) => void;
export type MLXProgressCallback = (progress: MLXProgress) => void;
export type MLXErrorCallback = (error: MLXError) => void;

// MARK: - Advanced Configuration

export interface MLXAdvancedConfig {
  enableMemoryOptimization?: boolean;
  maxConcurrentInferences?: number;
  defaultTimeout?: number; // in milliseconds
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    includeMemoryStats?: boolean;
  };
}

// MARK: - Helper Functions Type Definitions

export interface MLXUtilities {
  // Image utilities
  base64ToUIImage(base64String: string): Promise<any>; // UIImage on iOS
  uiImageToBase64(image: any): Promise<string>;

  // Memory utilities
  getCurrentMemoryUsage(): MLXMemoryInfo;
  recommendedModelsForDevice(): string[];

  // Configuration helpers
  createModelConfig(type: MLXModelType, id: string, options?: Partial<MLXModelConfig>): MLXModelConfig;
  mergeGenerationOptions(base: MLXTextGenerationOptions, override: Partial<MLXTextGenerationOptions>): MLXTextGenerationOptions;
}

// MARK: - Module Extensions

declare module 'react-native' {
  interface NativeModulesStatic {
    NativeMLXModule: MLXNativeModule;
  }
}

// Export everything for module consumption
export * from './models';
export * from './inference';
export * from './memory';
export * from './responses';
export * from './guards';