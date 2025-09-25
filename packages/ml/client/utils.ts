/**
 * ML Client Utilities - Enhanced to match native implementation
 */

import { Result, ok, err } from 'neverthrow';
import type {
  MLResponse,
  MLNativeSuccessResponse,
  MLNativeErrorResponse,
  MLChatMessage,
  MLErrorCode
} from '../types';
import { MLError } from '../types/responses';
import {
  isMLNativeSuccessResponse,
  isMLNativeErrorResponse,
  transformNativeToMLResponse,
  createMLErrorFromString
} from '../types/responses';

// Enhanced response parsing
export function parseMLResponse<T = any>(response: string): Result<MLResponse<T>, MLError> {
  try {
    const parsed = JSON.parse(response) as unknown;

    if (isMLNativeSuccessResponse<T>(parsed)) {
      return ok(transformNativeToMLResponse<T>(parsed));
    }

    if (isMLNativeErrorResponse(parsed)) {
      return err(MLError.fromNativeError(parsed));
    }

    // Handle legacy format
    if (parsed && typeof parsed === 'object') {
      return ok(parsed as MLResponse<T>);
    }

    return err(createMLError('Invalid response format', 'PARSE_ERROR'));
  } catch (error) {
    return err(createMLError(`Failed to parse ML response: ${error}`, 'PARSE_ERROR'));
  }
}

export function parseMLResponseFromJSON<T = any>(
  jsonString: string
): Result<T, MLError> {
  const responseResult = parseMLResponse<T>(jsonString);

  return responseResult.andThen(response => {
    if (response.success && response.data !== undefined) {
      return ok(response.data);
    }

    return err(createMLError(
      response.error || 'Unknown error',
      (response.errorCode as MLErrorCode) || 'UNKNOWN_ERROR'
    ));
  });
}

// Enhanced error creation
export function createMLError(
  message: string,
  code: MLErrorCode = 'UNKNOWN_ERROR',
  timestamp?: number | string,
  details?: Record<string, any>
): MLError {
  const numericTimestamp = typeof timestamp === 'string'
    ? parseInt(timestamp, 10) || Date.now()
    : timestamp || Date.now();

  return new MLError(message, code, numericTimestamp, details);
}

// Enhanced chat prompt formatting
export function formatChatPrompt(
  messages: MLChatMessage[],
  systemMessage?: string,
  template: 'chatml' | 'llama' | 'mistral' | 'custom' = 'chatml'
): string {
  let prompt = '';

  switch (template) {
    case 'chatml':
      if (systemMessage) {
        prompt += `<|im_start|>system\n${systemMessage}<|im_end|>\n`;
      }

      for (const message of messages) {
        prompt += `<|im_start|>${message.role}\n${message.content}<|im_end|>\n`;
      }

      prompt += '<|im_start|>assistant\n';
      break;

    case 'llama':
      if (systemMessage) {
        prompt += `<s>[INST] <<SYS>>\n${systemMessage}\n<</SYS>>\n\n`;
      }

      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (message.role === 'user') {
          prompt += i === 0 && systemMessage ? message.content : `<s>[INST] ${message.content}`;
          if (i < messages.length - 1 && messages[i + 1].role === 'assistant') {
            prompt += ' [/INST] ';
          }
        } else if (message.role === 'assistant') {
          prompt += `${message.content} </s>`;
        }
      }

      if (messages[messages.length - 1]?.role === 'user') {
        prompt += ' [/INST]';
      }
      break;

    case 'mistral':
      if (systemMessage) {
        prompt += `<s>[INST] ${systemMessage}\n\n`;
      }

      for (const message of messages) {
        if (message.role === 'user') {
          prompt += `${message.content} [/INST]`;
        } else if (message.role === 'assistant') {
          prompt += ` ${message.content}</s><s>[INST] `;
        }
      }
      break;

    default: // custom or fallback
      if (systemMessage) {
        prompt += `System: ${systemMessage}\n\n`;
      }

      for (const message of messages) {
        const roleMap = { system: 'System', user: 'User', assistant: 'Assistant' };
        prompt += `${roleMap[message.role]}: ${message.content}\n\n`;
      }

      prompt += 'Assistant: ';
  }

  return prompt;
}

// Base64 and data URL utilities
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

export function isValidDataURL(str: string): boolean {
  if (!str || typeof str !== 'string') return false;

  const dataURLPattern = /^data:([a-zA-Z0-9][a-zA-Z0-9\/+]*);base64,([a-zA-Z0-9+\/]*={0,2})$/;
  return dataURLPattern.test(str);
}

export function cleanBase64Image(base64String: string): string {
  return base64String.replace(/^data:image\/[^;]+;base64,/, '');
}

export function cleanBase64Audio(base64String: string): string {
  return base64String.replace(/^data:audio\/[^;]+;base64,/, '');
}

export function createDataURL(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`;
}

export function extractBase64FromDataURL(dataURL: string): string {
  const parts = dataURL.split(',');
  return parts.length > 1 ? parts[1] : dataURL;
}

export function getMimeTypeFromDataURL(dataURL: string): string | null {
  const match = dataURL.match(/^data:([^;]+);/);
  return match ? match[1] : null;
}

// Utility functions for model IDs and validation
export function normalizeModelId(modelId: string): string {
  return modelId.toLowerCase().replace(/[^a-z0-9\-_.]/g, '-');
}

export function isValidModelId(modelId: string): boolean {
  return /^[a-zA-Z0-9\-_.]{1,100}$/.test(modelId);
}

export function isValidHuggingFaceId(hfId: string): boolean {
  return /^[a-zA-Z0-9\-_.\/]{1,200}$/.test(hfId);
}

// Temperature and parameter validation
export function clampTemperature(temperature: number): number {
  return Math.max(0, Math.min(2, temperature));
}

export function clampTopP(topP: number): number {
  return Math.max(0, Math.min(1, topP));
}

export function clampMaxTokens(maxTokens: number): number {
  return Math.max(1, Math.min(100000, Math.floor(maxTokens)));
}

// Retry utilities
export function createExponentialBackoff(
  baseDelay: number = 1000,
  maxDelay: number = 30000,
  factor: number = 2
) {
  return (attempt: number): number => {
    const delay = baseDelay * Math.pow(factor, attempt);
    return Math.min(delay + Math.random() * 1000, maxDelay); // Add jitter
  };
}

export function shouldRetryError(error: MLError): boolean {
  const retryableCodes: MLErrorCode[] = [
    'NETWORK_ERROR',
    'MEMORY_ERROR',
    'STREAMING_ERROR'
  ];
  return retryableCodes.includes(error.code);
}

// JSON utilities
export function safeJSONStringify(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
}

export function safeJSONParse<T = any>(str: string): T | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// Session ID generation for streaming
export function generateSessionId(): string {
  return `ml-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Memory size formatting
export function formatMemorySize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

// Timing utilities
export function measureInferenceTime<T>(fn: () => T): [T, number] {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  return [result, duration];
}

export async function measureAsyncInferenceTime<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return [result, duration];
}