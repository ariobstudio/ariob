/**
 * ML Model Schemas
 */

import { z } from 'zod';

export const MLModelTypeSchema = z.enum([
  'llm',
  'vlm',
  'stableDiffusion',
  'embedding'
]);

export const MLModelStatusSchema = z.enum([
  'not_loaded',
  'loading_started',
  'loading',
  'loaded',
  'unloading',
  'error',
  'cancelled'
]);

export const MLModelConfigurationSchema = z.object({
  modelId: z.string().min(1, 'Model ID cannot be empty'),
  huggingFaceId: z.string().min(1, 'Hugging Face ID is required'),
  type: MLModelTypeSchema,
  quantization: z.string().optional(),
  cacheDir: z.string().optional(),
  maxMemoryUsage: z.number().positive().optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  autoUnload: z.boolean().optional(),
  maxIdleTime: z.number().positive().optional()
});

export const MLGenerationParametersSchema = z.object({
  maxTokens: z.number().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  topK: z.number().positive().optional(),
  repetitionPenalty: z.number().positive().optional(),
  seed: z.number().optional(),
  stream: z.boolean().optional(),
  stopTokens: z.array(z.string()).optional(),
  // Image generation
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  steps: z.number().positive().optional(),
  guidanceScale: z.number().positive().optional(),
  negativePrompt: z.string().optional(),
  // Audio
  sampleRate: z.number().positive().optional(),
  voiceId: z.string().optional(),
  // Embedding
  normalize: z.boolean().optional(),
  poolingStrategy: z.enum(['mean', 'cls', 'max']).optional()
});

export const MLChatOptionsSchema = MLGenerationParametersSchema.extend({
  systemMessage: z.string().optional(),
  conversationId: z.string().optional(),
  maxHistoryLength: z.number().positive().optional(),
  preserveContext: z.boolean().optional()
});

export const MLModelInfoSchema = z.object({
  modelId: z.string(),
  huggingFaceId: z.string(),
  type: MLModelTypeSchema,
  status: MLModelStatusSchema,
  isLoaded: z.boolean(),
  loadedAt: z.string().optional(),
  memoryUsage: z.number().optional(),
  capabilities: z.array(z.string()).optional(),
  memorySnapshot: z.string().optional(),
  runtimeInfo: z.object({
    deviceSupportsMetalGPU: z.boolean(),
    mlxVersion: z.string(),
    availableMemoryMB: z.number(),
    cacheMemoryMB: z.number()
  }).optional()
});

export const MLModelLoadingProgressSchema = z.object({
  modelId: z.string(),
  status: MLModelStatusSchema,
  progress: z.number().min(0).max(100),
  timestamp: z.number(),
  error: z.string().optional()
});

// Validation functions
export function validateModelConfiguration(config: unknown) {
  return MLModelConfigurationSchema.parse(config);
}

export function validateChatOptions(options: unknown) {
  return MLChatOptionsSchema.parse(options);
}

export function validateModelInfo(info: unknown) {
  return MLModelInfoSchema.parse(info);
}

export function validateGenerationParameters(params: unknown) {
  return MLGenerationParametersSchema.parse(params);
}

export function validateModelLoadingProgress(progress: unknown) {
  return MLModelLoadingProgressSchema.parse(progress);
}