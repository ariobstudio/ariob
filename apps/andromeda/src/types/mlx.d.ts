/**
 * TypeScript definitions for MLX Native Module
 *
 * This file provides type-safe interfaces for the modular MLX Native Module
 * following the Lynx Native Modules best practices.
 */

declare global {
  interface NativeModules {
    NativeMLXModule: MLXNativeModule;
  }
}

// Core MLX Module Interface
export interface MLXNativeModule {
  // Model Management
  loadModel(config: string): string;
  unloadModel(modelId: string, modelType: string): string;
  listLoadedModels(): string;
  getModelInfo(modelId: string): string;

  // Inference Operations
  inference(request: string): string;
  streamInference(request: string, onChunk: (chunk: string) => void): string;

  // Convenience Methods
  generateText(modelId: string, prompt: string, options?: string): string;
  generateImage(modelId: string, prompt: string, options?: string): string;
  analyzeImage(modelId: string, imageData: string, prompt?: string): string;
  synthesizeSpeech(modelId: string, text: string, options?: string): string;
  transcribeAudio(modelId: string, audioData: string, options?: string): string;

  // Memory Management
  clearModelCache(): string;
  getMemoryInfo(): string;
  setMaxMemoryUsage(bytes: number): string;

  // Discovery & Validation
  getSupportedModelTypes(): string;
  getSupportedModels(modelType: string): string;
  validateConfiguration(config: string): string;
}

// MLX Model Types
export type MLXModelType = 'llm' | 'vlm' | 'image-gen' | 'tts' | 'whisper' | 'custom';

// Configuration Interfaces
export interface MLXModelConfiguration {
  modelId: string;
  modelType: MLXModelType;
  source?: string;
  quantization?: string;
  maxMemory?: number;
  cacheLimit?: number;
  additionalParams?: Record<string, string>;
}

// Inference Interfaces
export interface MLXInferenceParameters {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stream?: boolean;
  seed?: number;
  additionalParams?: Record<string, string>;
}

export interface MLXInferenceRequest {
  modelId: string;
  input: MLXInferenceInput;
  parameters?: MLXInferenceParameters;
}

export type MLXInferenceInput =
  | { type: 'text'; text: string }
  | { type: 'image'; image: string }
  | { type: 'audio'; audio: string }
  | { type: 'multimodal'; text: string; image?: string }
  | { type: 'custom'; custom: Record<string, any> };

export type MLXInferenceResult =
  | { type: 'text'; text: string }
  | { type: 'image'; image: string }
  | { type: 'audio'; audio: string }
  | { type: 'structured'; structured: Record<string, any> };

// Response Interfaces
export interface MLXSuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
}

export interface MLXErrorResponse {
  success: false;
  error: string;
  errorCode: string;
  timestamp: string;
}

export type MLXResponse<T = any> = MLXSuccessResponse<T> | MLXErrorResponse;

// Model Information
export interface MLXModelInfo {
  id: string;
  type: string;
  displayName: string;
  memoryUsage: number;
  loadedAt: string;
  status: string;
  supportedOperations: string[];
  metadata?: Record<string, any>;
}

// Memory Information
export interface MLXMemoryInfo {
  totalSystemMemory: number;
  gpuMemoryLimit: number;
  gpuCacheLimit: number;
  currentSnapshot: MLXMemorySnapshot;
  modelLimits: Record<string, number>;
}

export interface MLXMemorySnapshot {
  size: number;
  allocations: number;
}

export type MLXMemoryPressure = 'low' | 'moderate' | 'high' | 'critical';

// Streaming
export interface MLXStreamChunk {
  text?: string;
  isComplete: boolean;
  metadata?: Record<string, string>;
}

// High-level API Helpers
export class MLXClient {
  constructor();

  // Model Management
  loadModel(config: MLXModelConfiguration): Promise<MLXModelInfo>;
  unloadModel(modelId: string, modelType: MLXModelType): Promise<void>;
  getLoadedModels(): Promise<MLXModelInfo[]>;
  getModelInfo(modelId: string): Promise<MLXModelInfo>;

  // Text Generation
  generateText(
    modelId: string,
    prompt: string,
    options?: MLXInferenceParameters
  ): Promise<string>;

  streamText(
    modelId: string,
    prompt: string,
    onChunk: (chunk: string) => void,
    options?: MLXInferenceParameters
  ): Promise<string>;

  // Image Generation
  generateImage(
    modelId: string,
    prompt: string,
    options?: MLXInferenceParameters
  ): Promise<string>; // Base64 encoded image

  // Vision Language Models
  analyzeImage(
    modelId: string,
    imageData: string, // Base64 encoded
    prompt?: string
  ): Promise<string>;

  // Speech Synthesis
  synthesizeSpeech(
    modelId: string,
    text: string,
    options?: MLXInferenceParameters
  ): Promise<string>; // Base64 encoded audio

  // Speech Recognition
  transcribeAudio(
    modelId: string,
    audioData: string, // Base64 encoded
    options?: MLXInferenceParameters
  ): Promise<{
    transcription: string;
    language: string;
    confidence: number;
  }>;

  // Memory Management
  getMemoryInfo(): Promise<MLXMemoryInfo>;
  clearCache(): Promise<void>;
  setMemoryLimit(bytes: number): Promise<void>;

  // Discovery
  getSupportedModelTypes(): Promise<MLXModelType[]>;
  getSupportedModels(modelType: MLXModelType): Promise<string[]>;
  validateConfiguration(config: MLXModelConfiguration): Promise<boolean>;
}

// Error Types
export class MLXError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public timestamp: string = new Date().toISOString()
  );
}

// Utility Types
export interface MLXImageResult {
  image: string; // Base64 encoded
  width: number;
  height: number;
  prompt: string;
}

export interface MLXChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MLXChatOptions extends MLXInferenceParameters {
  systemMessage?: string;
  conversationHistory?: MLXChatMessage[];
}

// React Hooks (if using React)
export interface UseMLXOptions {
  autoLoad?: boolean;
  onError?: (error: MLXError) => void;
  onProgress?: (progress: number) => void;
}

export interface UseMLXResult {
  client: MLXClient;
  isLoading: boolean;
  error: MLXError | null;
  loadedModels: MLXModelInfo[];
  memoryInfo: MLXMemoryInfo | null;
}

export function useMLX(options?: UseMLXOptions): UseMLXResult;

// Utility Functions
export function parseMLXResponse<T = any>(response: string): MLXResponse<T>;
export function createMLXClient(): MLXClient;
export function isMLXError(response: any): response is MLXErrorResponse;
export function isMLXSuccess<T = any>(response: any): response is MLXSuccessResponse<T>;

// Constants
export const MLX_MODEL_TYPES: readonly MLXModelType[] = [
  'llm',
  'vlm',
  'image-gen',
  'tts',
  'whisper',
  'custom'
] as const;

export const MLX_ERROR_CODES = {
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  MODEL_LOAD_FAILED: 'MODEL_LOAD_FAILED',
  INFERENCE_FAILED: 'INFERENCE_FAILED',
  UNSUPPORTED_MODEL_TYPE: 'UNSUPPORTED_MODEL_TYPE',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  MEMORY_ERROR: 'MEMORY_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  QUANTIZATION_ERROR: 'QUANTIZATION_ERROR',
  STREAMING_ERROR: 'STREAMING_ERROR'
} as const;

export type MLXErrorCode = typeof MLX_ERROR_CODES[keyof typeof MLX_ERROR_CODES];