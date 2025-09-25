/**
 * ML Native Module Interface Types for Lynx
 */

// Lynx global module interface
declare global {
  const NativeMLXModule: MLNativeModule;
}

export interface MLNativeModule {
  // Model Management
  loadModel(config: string): string;
  unloadModel(modelId: string): string;
  listLoadedModels(): string;
  getModelInfo(modelId: string): string;

  // Model Loading Progress (NEW)
  checkModelLoadingProgress(modelId: string): string;
  cancelModelLoading(modelId: string): string;

  // Inference Operations
  inference(request: string): string;
  streamInference(request: string, onChunk: (chunk: string) => void): string;

  // Model-Specific Operations
  generateText(modelId: string, prompt: string, options: string | undefined): string;
  generateImage(modelId: string, prompt: string, options: string | undefined): string;
  analyzeImage(modelId: string, imageData: string, prompt: string | undefined): string;
  synthesizeSpeech(modelId: string, text: string, options: string | undefined): string;
  transcribeAudio(modelId: string, audioData: string, options: string | undefined): string;

  // Memory Management
  clearModelCache(): string;
  getAvailableMemory(): string;
  setMaxMemoryUsage(bytes: number): string;
}

export interface MLModelConfiguration {
  modelId: string;
  huggingFaceId: string;
  type: MLModelType;
  quantization?: string;
  cacheDir?: string;
  maxMemoryUsage?: number;
  priority?: 'low' | 'normal' | 'high';
  autoUnload?: boolean;
  maxIdleTime?: number;
}

export type MLModelType = 'llm' | 'vlm' | 'stableDiffusion' | 'embedding';

export type MLModelStatus =
  | 'not_loaded'
  | 'loading_started'
  | 'loading'
  | 'loaded'
  | 'unloading'
  | 'error'
  | 'cancelled';

export interface MLModelInfo {
  modelId: string;
  huggingFaceId: string;
  type: MLModelType;
  status: MLModelStatus;
  isLoaded: boolean;
  loadedAt?: string;
  memoryUsage?: number;
  capabilities?: string[];
  memorySnapshot?: string;
  runtimeInfo?: {
    deviceSupportsMetalGPU: boolean;
    mlxVersion: string;
    availableMemoryMB: number;
    cacheMemoryMB: number;
  };
}

export interface MLModelLoadingProgress {
  modelId: string;
  status: MLModelStatus;
  progress: number; // 0-100
  timestamp: number;
  error?: string;
}

export interface MLInferenceParameters {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  repetitionPenalty?: number;
  seed?: number;
  stream?: boolean;
}

export interface MLChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MLChatOptions extends MLInferenceParameters {
  systemMessage?: string;
  conversationId?: string;
}

export interface MLMemoryInfo {
  usedMemory: number;
  totalMemory: number;
  modelCount: number;
  cacheSize?: number;
  availableMemory?: number;
  pressureLevel?: MemoryPressureLevel;
  pressureDescription?: string;
}

export type MemoryPressureLevel = 'normal' | 'moderate' | 'high' | 'critical';

export interface MLMemorySnapshot {
  description: string;
  timestamp: number;
  memoryUsage: number;
  modelCount: number;
}

export interface MLMemoryDelta {
  description: string;
  memoryFreed: number;
  modelsCleared: number;
}

export interface MLMemoryRecommendations {
  recommendations: string[];
  pressureLevel: MemoryPressureLevel;
  activeOperations: number;
  loadedModels: number;
}

export interface MLResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  timestamp: number;
}

export interface MLSuccessResponse<T = any> extends MLResponse<T> {
  success: true;
  data: T;
}

export interface MLErrorResponse extends MLResponse<never> {
  success: false;
  error: string;
  errorCode?: MLErrorCode;
}

export type MLErrorCode =
  | 'PARSE_ERROR'
  | 'INVALID_PARAMETERS'
  | 'MODEL_NOT_FOUND'
  | 'MODEL_LOAD_FAILED'
  | 'MODEL_LOADING_CANCELLED'
  | 'INFERENCE_FAILED'
  | 'STREAMING_ERROR'
  | 'STREAMING_CANCELLED'
  | 'MEMORY_ERROR'
  | 'MEMORY_PRESSURE_HIGH'
  | 'MODEL_TYPE_MISMATCH'
  | 'FEATURE_NOT_SUPPORTED'
  | 'INVALID_CONFIGURATION'
  | 'UNKNOWN_ERROR';

export interface MLError extends Error {
  code: MLErrorCode;
  timestamp: number;
  details?: Record<string, any>;
}

// Streaming-specific types
export interface MLStreamingSession {
  sessionId: string;
  modelId: string;
  status: 'active' | 'completed' | 'cancelled' | 'error';
  startTime: number;
  tokens?: number;
}

export interface MLStreamingChunk {
  type: 'token' | 'complete' | 'cancelled' | 'error';
  content?: string;
  token?: string;
  sessionId: string;
  index?: number;
  isLast?: boolean;
  timestamp: number;
  totalTime?: number;
  error?: string;
}

// Generation parameters
export interface MLGenerationParameters {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  repetitionPenalty?: number;
  seed?: number;
  stopTokens?: string[];
  stream?: boolean;
}

// Enhanced inference types
export interface MLInferenceRequest {
  modelId: string;
  input?: string;
  prompt?: string;
  imageData?: string;
  audioData?: string;
  options?: MLGenerationParameters;
}

export interface MLInferenceResult {
  modelId: string;
  modelType: MLModelType;
  output?: any;
  text?: string;
  imageData?: string;
  analysis?: string;
  embedding?: number[];
  inferenceTime: number;
  tokensGenerated?: number;
  timestamp: number;
}

// Lynx Module Type Declaration
export interface LynxModuleGlobal {
  NativeMLXModule: MLNativeModule;
}

// Extend global object for Lynx
declare const lynx: {
  require: (moduleName: string) => any;
};

// Enhanced response types to match native implementation
export interface MLNativeSuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: number;
}

export interface MLNativeErrorResponse {
  error: true;
  message: string;
  timestamp: number;
}

// Lynx-specific error types
export interface LynxNativeModuleError {
  code: string;
  message: string;
  stack?: string;
}