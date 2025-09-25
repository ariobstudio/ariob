/**
 * ML Response Schemas - Enhanced to match native implementation
 */

import { z } from 'zod';

// Enhanced error codes matching native implementation
export const MLErrorCodeSchema = z.enum([
  // Parsing and validation
  'PARSE_ERROR',
  'INVALID_PARAMETERS',
  'INVALID_CONFIGURATION',
  'INVALID_INPUT',

  // Model management
  'MODEL_NOT_FOUND',
  'MODEL_LOAD_FAILED',
  'MODEL_LOADING_CANCELLED',
  'MODEL_TYPE_MISMATCH',

  // Inference and operations
  'INFERENCE_FAILED',
  'STREAMING_ERROR',
  'STREAMING_CANCELLED',
  'FEATURE_NOT_SUPPORTED',

  // Memory and resources
  'MEMORY_ERROR',
  'MEMORY_PRESSURE_HIGH',
  'RESOURCE_NOT_FOUND',

  // System and network
  'NETWORK_ERROR',
  'CONFIGURATION_ERROR',
  'QUANTIZATION_ERROR',
  'UNSUPPORTED_MODEL_TYPE',

  // Generic
  'UNKNOWN_ERROR'
]);

// Base response schemas
export const MLResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    errorCode: z.string().optional(),
    timestamp: z.number()
  });

export const MLSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    timestamp: z.number()
  });

export const MLErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  errorCode: MLErrorCodeSchema.optional(),
  timestamp: z.number()
});

// Native response schemas (what actually comes from Swift)
export const MLNativeSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    timestamp: z.number()
  });

export const MLNativeErrorResponseSchema = z.object({
  error: z.literal(true),
  message: z.string(),
  timestamp: z.number()
});

export const MLNativeResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([
    MLNativeSuccessResponseSchema(dataSchema),
    MLNativeErrorResponseSchema
  ]);

// Legacy MLX response schemas for compatibility
export const MLXSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    timestamp: z.string()
  });

export const MLXErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  errorCode: z.string(),
  timestamp: z.string()
});

export const MLXResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([
    MLXSuccessResponseSchema(dataSchema),
    MLXErrorResponseSchema
  ]);

export const MLXErrorCodeSchema = z.enum([
  'INVALID_PARAMETERS',
  'MODEL_NOT_FOUND',
  'MODEL_LOAD_FAILED',
  'INFERENCE_FAILED',
  'UNSUPPORTED_MODEL_TYPE',
  'RESOURCE_NOT_FOUND',
  'MEMORY_ERROR',
  'NETWORK_ERROR',
  'INVALID_INPUT',
  'CONFIGURATION_ERROR',
  'QUANTIZATION_ERROR',
  'STREAMING_ERROR',
  'PARSE_ERROR'
]);

// Validation functions
export function validateMLErrorCode(code: unknown) {
  return MLErrorCodeSchema.parse(code);
}

export function validateMLSuccessResponse<T>(dataSchema: z.ZodTypeAny, response: unknown) {
  return MLSuccessResponseSchema(dataSchema).parse(response);
}

export function validateMLErrorResponse(response: unknown) {
  return MLErrorResponseSchema.parse(response);
}

export function validateMLResponse<T>(dataSchema: z.ZodTypeAny, response: unknown) {
  return MLResponseSchema(dataSchema).parse(response);
}

export function validateMLNativeSuccessResponse<T>(dataSchema: z.ZodTypeAny, response: unknown) {
  return MLNativeSuccessResponseSchema(dataSchema).parse(response);
}

export function validateMLNativeErrorResponse(response: unknown) {
  return MLNativeErrorResponseSchema.parse(response);
}

export function validateMLNativeResponse<T>(dataSchema: z.ZodTypeAny, response: unknown) {
  return MLNativeResponseSchema(dataSchema).parse(response);
}

// Legacy validation functions
export function validateSuccessResponse<T>(dataSchema: z.ZodTypeAny, response: unknown) {
  return MLXSuccessResponseSchema(dataSchema).parse(response);
}

export function validateErrorResponse(response: unknown) {
  return MLXErrorResponseSchema.parse(response);
}

export function validateResponse<T>(dataSchema: z.ZodTypeAny, response: unknown) {
  return MLXResponseSchema(dataSchema).parse(response);
}

export function validateErrorCode(code: unknown) {
  return MLXErrorCodeSchema.parse(code);
}