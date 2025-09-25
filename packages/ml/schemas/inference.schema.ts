/**
 * ML Inference Schemas - Enhanced to match native implementation
 */

import { z } from 'zod';

// Enhanced inference parameters matching native types
export const MLInferenceParametersSchema = z.object({
  maxTokens: z.number().int().positive().max(100000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  topK: z.number().int().positive().optional(),
  repetitionPenalty: z.number().positive().optional(),
  seed: z.number().int().optional(),
  stream: z.boolean().optional()
});

// Enhanced generation parameters including image, audio, embedding
export const MLGenerationParametersSchema = MLInferenceParametersSchema.extend({
  stopTokens: z.array(z.string()).optional(),
  // Image generation specific
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  steps: z.number().int().positive().optional(),
  guidanceScale: z.number().positive().optional(),
  negativePrompt: z.string().optional(),
  // Audio specific
  sampleRate: z.number().int().positive().optional(),
  voiceId: z.string().optional(),
  // Embedding specific
  normalize: z.boolean().optional(),
  poolingStrategy: z.enum(['mean', 'cls', 'max']).optional()
});

export const MLChatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1, 'Message content cannot be empty')
});

export const MLChatOptionsSchema = MLInferenceParametersSchema.extend({
  systemMessage: z.string().optional(),
  conversationId: z.string().optional()
});

// Streaming types
export const MLStreamingChunkSchema = z.object({
  type: z.enum(['token', 'complete', 'cancelled', 'error']),
  content: z.string().optional(),
  token: z.string().optional(),
  sessionId: z.string(),
  index: z.number().int().nonnegative().optional(),
  isLast: z.boolean().optional(),
  timestamp: z.number(),
  totalTime: z.number().optional(),
  error: z.string().optional()
});

export const MLStreamingSessionSchema = z.object({
  sessionId: z.string(),
  modelId: z.string(),
  status: z.enum(['active', 'completed', 'cancelled', 'error']),
  startTime: z.number(),
  tokens: z.number().int().nonnegative().optional()
});

// Inference request and result types
export const MLInferenceRequestSchema = z.object({
  modelId: z.string().min(1, 'Model ID cannot be empty'),
  input: z.string().optional(),
  prompt: z.string().optional(),
  imageData: z.string().optional(),
  audioData: z.string().optional(),
  options: MLGenerationParametersSchema.optional()
}).refine(
  data => data.input || data.prompt || data.imageData || data.audioData,
  { message: 'At least one of input, prompt, imageData, or audioData must be provided' }
);

export const MLInferenceResultSchema = z.object({
  modelId: z.string(),
  modelType: z.enum(['llm', 'vlm', 'stableDiffusion', 'embedding']),
  output: z.any().optional(),
  text: z.string().optional(),
  imageData: z.string().optional(),
  analysis: z.string().optional(),
  embedding: z.array(z.number()).optional(),
  inferenceTime: z.number().nonnegative(),
  tokensGenerated: z.number().int().nonnegative().optional(),
  timestamp: z.number()
});

// Legacy MLX schemas for compatibility
export const MLXInferenceParametersSchema = MLInferenceParametersSchema.extend({
  additionalParams: z.record(z.any()).optional()
});

export const MLXInferenceInputSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.string().min(1, 'Text cannot be empty')
  }),
  z.object({
    type: z.literal('image'),
    image: z.string().min(1, 'Image data cannot be empty')
  }),
  z.object({
    type: z.literal('audio'),
    audio: z.string().min(1, 'Audio data cannot be empty')
  }),
  z.object({
    type: z.literal('multimodal'),
    text: z.string().min(1, 'Text cannot be empty'),
    image: z.string().optional()
  }),
  z.object({
    type: z.literal('custom'),
    custom: z.record(z.any())
  })
]);

export const MLXInferenceResultSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.string()
  }),
  z.object({
    type: z.literal('image'),
    image: z.string()
  }),
  z.object({
    type: z.literal('audio'),
    audio: z.string()
  }),
  z.object({
    type: z.literal('structured'),
    structured: z.record(z.any())
  })
]);

export const MLXInferenceRequestSchema = z.object({
  modelId: z.string().min(1, 'Model ID cannot be empty'),
  input: MLXInferenceInputSchema,
  parameters: MLXInferenceParametersSchema.optional()
});

export const MLXStreamChunkSchema = z.object({
  text: z.string().optional(),
  isComplete: z.boolean(),
  metadata: z.record(z.string()).optional()
});

export const MLXChatMessageSchema = MLChatMessageSchema;

export const MLXChatOptionsSchema = MLXInferenceParametersSchema.extend({
  systemMessage: z.string().optional(),
  conversationHistory: z.array(MLXChatMessageSchema).optional(),
  conversationId: z.string().optional(),
  maxHistoryLength: z.number().int().positive().optional(),
  preserveContext: z.boolean().optional()
});

export const MLXInferenceStatusSchema = z.enum([
  'pending',
  'running',
  'streaming',
  'completed',
  'failed',
  'cancelled'
]);

// Validation functions
export function validateMLInferenceParameters(params: unknown) {
  return MLInferenceParametersSchema.parse(params);
}

export function validateMLGenerationParameters(params: unknown) {
  return MLGenerationParametersSchema.parse(params);
}

export function validateMLChatMessage(message: unknown) {
  return MLChatMessageSchema.parse(message);
}

export function validateMLChatOptions(options: unknown) {
  return MLChatOptionsSchema.parse(options);
}

export function validateMLStreamingChunk(chunk: unknown) {
  return MLStreamingChunkSchema.parse(chunk);
}

export function validateMLStreamingSession(session: unknown) {
  return MLStreamingSessionSchema.parse(session);
}

export function validateMLInferenceRequest(request: unknown) {
  return MLInferenceRequestSchema.parse(request);
}

export function validateMLInferenceResult(result: unknown) {
  return MLInferenceResultSchema.parse(result);
}

// Legacy validation functions
export function validateInferenceParameters(params: unknown) {
  return MLXInferenceParametersSchema.parse(params);
}

export function validateInferenceInput(input: unknown) {
  return MLXInferenceInputSchema.parse(input);
}

export function validateInferenceRequest(request: unknown) {
  return MLXInferenceRequestSchema.parse(request);
}

export function validateChatMessage(message: unknown) {
  return MLXChatMessageSchema.parse(message);
}

export function validateChatOptions(options: unknown) {
  return MLXChatOptionsSchema.parse(options);
}