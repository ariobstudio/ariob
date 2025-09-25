/**
 * MLX Inference Types - Enhanced to match native implementation
 */

import type { MLModelType, MLStreamingChunk, MLStreamingSession } from './native';

export interface MLXInferenceParameters {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  repetitionPenalty?: number;
  stream?: boolean;
  seed?: number;
  stopTokens?: string[];
  additionalParams?: Record<string, any>;
}

// Enhanced generation parameters to match native MLXGenerationParameters
export interface MLXGenerationParameters extends MLXInferenceParameters {
  // Image generation specific
  width?: number;
  height?: number;
  steps?: number;
  guidanceScale?: number;
  negativePrompt?: string;

  // Audio specific
  sampleRate?: number;
  voiceId?: string;

  // Embedding specific
  normalize?: boolean;
  poolingStrategy?: 'mean' | 'cls' | 'max';
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

export interface MLXInferenceRequest {
  modelId: string;
  input: MLXInferenceInput;
  parameters?: MLXInferenceParameters;
}

export interface MLXStreamChunk {
  text?: string;
  isComplete: boolean;
  metadata?: Record<string, string>;
}

export interface MLXChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MLXChatOptions extends MLXInferenceParameters {
  systemMessage?: string;
  conversationHistory?: MLXChatMessage[];
  conversationId?: string;
  maxHistoryLength?: number;
  preserveContext?: boolean;
}

export interface MLXConversation {
  id: string;
  messages: MLXChatMessage[];
  modelId: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

// Enhanced chat result
export interface MLXChatResult {
  message: MLXChatMessage;
  conversation: MLXConversation;
  inferenceTime: number;
  tokensGenerated?: number;
  memoryUsage?: number;
}

// Model capability types
export interface MLXModelCapabilities {
  supportsStreaming: boolean;
  supportsImages: boolean;
  supportsAudio: boolean;
  maxTokens: number;
  contextWindow: number;
  supportedFormats: string[];
  optimizedFor: ('speed' | 'quality' | 'efficiency')[];
}

export const MLX_INFERENCE_STATUS = [
  'pending',
  'running',
  'streaming',
  'completed',
  'failed',
  'cancelled'
] as const;

export type MLXInferenceStatus = typeof MLX_INFERENCE_STATUS[number];

// Streaming types missing from native types
export interface MLXStreamingOptions {
  onChunk?: (chunk: import('./native').MLStreamingChunk) => void;
  onComplete?: (session: import('./native').MLStreamingSession) => void;
  onError?: (error: Error, session?: import('./native').MLStreamingSession) => void;
  onCancel?: (session: import('./native').MLStreamingSession) => void;
  parameters?: MLXGenerationParameters;
}

export interface MLXStreamingResult {
  sessionId: string;
  modelId: string;
  status: 'streaming_started' | 'error';
  timestamp: number;
  cancel: () => Promise<boolean>;
  getSession: () => import('./native').MLStreamingSession | null;
}