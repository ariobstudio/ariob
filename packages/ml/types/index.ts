/**
 * ML Types - Core type definitions for the ML package
 */

// Re-export all types
export * from './models';
export * from './inference';
export * from './memory';
export * from './responses';
// Re-export selected native types that do not conflict with memory/response types
export type {
  MLNativeModule,
  MLModelConfiguration,
  MLModelType,
  MLModelStatus,
  MLModelInfo,
  MLModelLoadingProgress,
  MLInferenceParameters,
  MLGenerationParameters,
  MLChatMessage,
  MLChatOptions,
  MLStreamingSession,
  MLStreamingChunk,
  MLInferenceRequest,
  MLInferenceResult,
  LynxModuleGlobal,
  LynxNativeModuleError
} from './native';

// Type guards and utilities
// Re-export guards explicitly to avoid name collisions with response utilities
export {
  isMLResponse,
  isMLSuccessResponse,
  isMLErrorResponse,
  isMLNativeSuccessResponse,
  isMLNativeErrorResponse,
  isMLXError,
  isMLXSuccess,
  isMLModelType,
  isMLModelStatus,
  isMLErrorCode,
  isMLStreamingChunk,
  isMLStreamingSession,
  isTextResult,
  isImageResult,
  isAudioResult,
  isStructuredResult,
  isMLInferenceResult,
  isMemoryPressureLevel,
  isValidMemoryPressure,
  isValidBase64,
  isValidImageBase64,
  isValidAudioBase64,
  isValidDataURL,
  isValidJSON,
  parseJSONSafely,
  isValidModelId,
  isValidHuggingFaceId,
  isValidTemperature,
  isValidTopP,
  isValidMaxTokens,
  isDefined,
  isNonEmptyString,
  isPositiveNumber,
  isInteger
} from './guards';