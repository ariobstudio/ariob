/**
 * MLX Model Types
 */

export const MLX_MODEL_TYPES = [
  'llm',
  'vlm',
  'image-gen',
  'tts',
  'whisper',
  'custom'
] as const;

export type MLXModelType = typeof MLX_MODEL_TYPES[number];

export interface MLXModelConfiguration {
  modelId: string;
  modelType: MLXModelType;
  source?: string;
  quantization?: string;
  maxMemory?: number;
  cacheLimit?: number;
  additionalParams?: Record<string, string>;
}

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

export const MLX_MODEL_STATUS = [
  'loading',
  'loaded',
  'unloading',
  'unloaded',
  'error'
] as const;

export type MLXModelStatus = typeof MLX_MODEL_STATUS[number];