/**
 * ML Schemas - Zod validation schemas for ML package
 */

// Model schemas
export {
  MLModelTypeSchema,
  MLModelStatusSchema,
  MLModelConfigurationSchema,
  MLModelInfoSchema,
  MLModelLoadingProgressSchema,
  validateModelConfiguration,
  validateChatOptions,
  validateModelInfo,
  validateGenerationParameters,
  validateModelLoadingProgress
} from './model.schema';

// Enhanced inference schemas
export {
  // New ML schemas
  MLInferenceParametersSchema,
  MLGenerationParametersSchema,
  MLChatMessageSchema,
  MLChatOptionsSchema,
  MLStreamingChunkSchema,
  MLStreamingSessionSchema,
  MLInferenceRequestSchema,
  MLInferenceResultSchema,
  validateMLInferenceParameters,
  validateMLGenerationParameters,
  validateMLChatMessage,
  validateMLChatOptions,
  validateMLStreamingChunk,
  validateMLStreamingSession,
  validateMLInferenceRequest,
  validateMLInferenceResult,

  // Legacy MLX schemas
  MLXInferenceParametersSchema,
  MLXInferenceInputSchema,
  MLXInferenceResultSchema,
  MLXInferenceRequestSchema,
  MLXStreamChunkSchema,
  MLXChatMessageSchema,
  MLXChatOptionsSchema,
  MLXInferenceStatusSchema,
  validateInferenceParameters,
  validateInferenceInput,
  validateInferenceRequest,
  validateChatMessage,
  validateChatOptions as validateMLXChatOptions
} from './inference.schema';

// Memory schemas
export {
  // New ML memory schemas
  MemoryPressureLevelSchema,
  MLMemorySnapshotSchema,
  MLMemoryInfoSchema,
  MLMemoryDeltaSchema,
  MLMemoryRecommendationsSchema,
  MLMemoryUsageReportSchema,
  MLMemoryMonitoringConfigSchema,
  MLMemoryPressureEventSchema,
  validateMLMemorySnapshot,
  validateMLMemoryInfo,
  validateMLMemoryDelta,
  validateMLMemoryRecommendations,
  validateMLMemoryUsageReport,
  validateMLMemoryMonitoringConfig,
  validateMLMemoryPressureEvent,
  validateMemoryPressureLevel,

  // Legacy MLX memory schemas
  MLXMemorySnapshotSchema,
  MLXMemoryInfoSchema,
  MLXMemoryPressureSchema,
  MLXMemoryDeltaSchema,
  validateMemoryInfo,
  validateMemorySnapshot,
  validateMemoryPressure
} from './memory.schema';

// Response schemas
export {
  // New ML response schemas
  MLErrorCodeSchema,
  MLResponseSchema,
  MLSuccessResponseSchema,
  MLErrorResponseSchema,
  MLNativeSuccessResponseSchema,
  MLNativeErrorResponseSchema,
  MLNativeResponseSchema,
  validateMLErrorCode,
  validateMLSuccessResponse,
  validateMLErrorResponse,
  validateMLResponse,
  validateMLNativeSuccessResponse,
  validateMLNativeErrorResponse,
  validateMLNativeResponse,

  // Legacy MLX response schemas
  MLXSuccessResponseSchema,
  MLXErrorResponseSchema,
  MLXResponseSchema,
  MLXErrorCodeSchema,
  validateSuccessResponse,
  validateErrorResponse,
  validateResponse,
  validateErrorCode
} from './response.schema';

// Convenience re-exports for common validations
export { validateModelConfiguration as validateMLModelConfiguration } from './model.schema';
export { validateInferenceParameters as validateMLXInferenceParameters } from './inference.schema';
export { validateMemoryInfo as validateMLXMemoryInfo } from './memory.schema';