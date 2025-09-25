/**
 * ML Type Guards and Utilities - Enhanced to match native implementation
 */

import type { MLModelType, MLModelStatus, MLErrorCode, MLStreamingChunk, MLStreamingSession, MemoryPressureLevel, MLInferenceResult } from './native';
import type { MLResponse, MLSuccessResponse, MLErrorResponse, MLNativeSuccessResponse, MLNativeErrorResponse, MLXResponse, MLXSuccessResponse, MLXErrorResponse } from './responses';
import type { MLXInferenceResult } from './inference';
import { MEMORY_PRESSURE_LEVELS } from './memory';

// Response type guards
export function isMLResponse<T = any>(value: any): value is MLResponse<T> {
  return value && typeof value === 'object' && typeof value.success === 'boolean';
}

export function isMLSuccessResponse<T = any>(response: any): response is MLSuccessResponse<T> {
  return isMLResponse(response) && response.success === true && 'data' in response;
}

export function isMLErrorResponse(response: any): response is MLErrorResponse {
  return isMLResponse(response) && response.success === false && 'error' in response;
}

export function isMLNativeSuccessResponse<T = any>(response: any): response is MLNativeSuccessResponse<T> {
  return response &&
    typeof response === 'object' &&
    response.success === true &&
    'data' in response &&
    typeof response.timestamp === 'number';
}

export function isMLNativeErrorResponse(response: any): response is MLNativeErrorResponse {
  return response &&
    typeof response === 'object' &&
    response.error === true &&
    'message' in response &&
    typeof response.timestamp === 'number';
}

// Legacy MLX response guards
export function isMLXError(response: any): response is MLXErrorResponse {
  return response && typeof response === 'object' && response.success === false;
}

export function isMLXSuccess<T = any>(response: any): response is MLXSuccessResponse<T> {
  return response && typeof response === 'object' && response.success === true;
}

// Model type guards
export function isMLModelType(value: any): value is MLModelType {
  return typeof value === 'string' &&
    ['llm', 'vlm', 'stableDiffusion', 'embedding'].includes(value);
}

export function isMLModelStatus(value: any): value is MLModelStatus {
  return typeof value === 'string' &&
    ['not_loaded', 'loading_started', 'loading', 'loaded', 'unloading', 'error', 'cancelled'].includes(value);
}

// Error code guards
export function isMLErrorCode(value: any): value is MLErrorCode {
  const validCodes = [
    'PARSE_ERROR', 'INVALID_PARAMETERS', 'MODEL_NOT_FOUND', 'MODEL_LOAD_FAILED',
    'MODEL_LOADING_CANCELLED', 'INFERENCE_FAILED', 'STREAMING_ERROR', 'STREAMING_CANCELLED',
    'MEMORY_ERROR', 'MEMORY_PRESSURE_HIGH', 'MODEL_TYPE_MISMATCH', 'FEATURE_NOT_SUPPORTED',
    'INVALID_CONFIGURATION', 'UNKNOWN_ERROR'
  ];
  return typeof value === 'string' && validCodes.includes(value);
}

// Streaming type guards
export function isMLStreamingChunk(value: any): value is MLStreamingChunk {
  return value &&
    typeof value === 'object' &&
    typeof value.type === 'string' &&
    ['token', 'complete', 'cancelled', 'error'].includes(value.type) &&
    typeof value.sessionId === 'string' &&
    typeof value.timestamp === 'number';
}

export function isMLStreamingSession(value: any): value is MLStreamingSession {
  return value &&
    typeof value === 'object' &&
    typeof value.sessionId === 'string' &&
    typeof value.modelId === 'string' &&
    typeof value.status === 'string' &&
    ['active', 'completed', 'cancelled', 'error'].includes(value.status) &&
    typeof value.startTime === 'number';
}

// Inference result guards
export function isTextResult(result: any): result is { type: 'text'; text: string } {
  return result && result.type === 'text' && typeof result.text === 'string';
}

export function isImageResult(result: any): result is { type: 'image'; image: string } {
  return result && result.type === 'image' && typeof result.image === 'string';
}

export function isAudioResult(result: any): result is { type: 'audio'; audio: string } {
  return result && result.type === 'audio' && typeof result.audio === 'string';
}

export function isStructuredResult(result: any): result is { type: 'structured'; structured: Record<string, any> } {
  return result &&
    result.type === 'structured' &&
    result.structured &&
    typeof result.structured === 'object';
}

export function isMLInferenceResult(result: any): result is MLInferenceResult {
  return result &&
    typeof result === 'object' &&
    typeof result.modelId === 'string' &&
    typeof result.modelType === 'string' &&
    isMLModelType(result.modelType) &&
    typeof result.inferenceTime === 'number' &&
    typeof result.timestamp === 'number';
}

// Memory guards
export function isMemoryPressureLevel(value: any): value is MemoryPressureLevel {
  return typeof value === 'string' && MEMORY_PRESSURE_LEVELS.includes(value as any);
}

export function isValidMemoryPressure(value: string): value is MemoryPressureLevel {
  return isMemoryPressureLevel(value);
}

// Data validation guards
export function isValidBase64(str: string): boolean {
  if (!str || typeof str !== 'string') return false;

  try {
    // Handle data URLs
    if (str.startsWith('data:')) {
      const base64Part = str.split(',')[1];
      return base64Part ? btoa(atob(base64Part)) === base64Part : false;
    }

    // Regular base64 string
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

export function isValidImageBase64(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return str.startsWith('data:image/') || isValidBase64(str);
}

export function isValidAudioBase64(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return str.startsWith('data:audio/') || isValidBase64(str);
}

export function isValidDataURL(str: string): boolean {
  if (!str || typeof str !== 'string') return false;

  const dataURLPattern = /^data:([a-zA-Z0-9][a-zA-Z0-9\/+]*);base64,([a-zA-Z0-9+\/]*={0,2})$/;
  return dataURLPattern.test(str);
}

// JSON validation guards
export function isValidJSON(str: string): boolean {
  if (!str || typeof str !== 'string') return false;

  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export function parseJSONSafely<T = any>(str: string): T | null {
  if (!isValidJSON(str)) return null;

  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

// Model configuration guards
export function isValidModelId(modelId: any): modelId is string {
  return typeof modelId === 'string' &&
    modelId.length > 0 &&
    modelId.length <= 100 &&
    /^[a-zA-Z0-9\-_.]+$/.test(modelId);
}

export function isValidHuggingFaceId(hfId: any): hfId is string {
  return typeof hfId === 'string' &&
    hfId.length > 0 &&
    /^[a-zA-Z0-9\-_.\/]+$/.test(hfId);
}

// Parameter validation guards
export function isValidTemperature(temp: any): temp is number {
  return typeof temp === 'number' && temp >= 0 && temp <= 2 && !isNaN(temp);
}

export function isValidTopP(topP: any): topP is number {
  return typeof topP === 'number' && topP >= 0 && topP <= 1 && !isNaN(topP);
}

export function isValidMaxTokens(maxTokens: any): maxTokens is number {
  return typeof maxTokens === 'number' &&
    maxTokens > 0 &&
    maxTokens <= 100000 &&
    Number.isInteger(maxTokens);
}

// Utility type guards
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isNonEmptyString(value: any): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isPositiveNumber(value: any): value is number {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}

export function isInteger(value: any): value is number {
  return typeof value === 'number' && Number.isInteger(value) && !isNaN(value);
}