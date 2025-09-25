/**
 * @ariob/ml - Machine Learning Package for Lynx
 *
 * A comprehensive TypeScript package for integrating machine learning
 * capabilities into Lynx applications using MLX Swift.
 */

// Types
export * from './types';

// Schemas & Validation
export {
  // Model validation
  validateModelConfiguration,
  validateInferenceParameters,
  validateMemoryInfo,

  // Enhanced ML validation
  validateMLInferenceParameters,
  validateMLGenerationParameters,
  validateMLChatMessage,
  validateMLChatOptions,
  validateMLStreamingChunk,
  validateMLStreamingSession,
  validateMLInferenceRequest,
  validateMLInferenceResult,
  validateMLMemorySnapshot,
  validateMLMemoryInfo,
  validateMLMemoryRecommendations,
  validateMemoryPressureLevel,

  // Response validation
  validateMLErrorCode,
  validateMLSuccessResponse,
  validateMLErrorResponse,
  validateMLResponse,
  validateMLNativeSuccessResponse,
  validateMLNativeErrorResponse,
  validateMLNativeResponse
} from './schemas';

// Client & Core
export { MLClient, createMLClient } from './client';
export { createMLError, formatChatPrompt, parseMLResponse, parseMLResponseFromJSON, shouldRetryError, createExponentialBackoff } from './client/utils';

// State Management
export * from './stores';

// React Hooks
export * from './hooks';

// Main exports for convenience
export { createMLXStore } from './stores';
export { useML } from './hooks';