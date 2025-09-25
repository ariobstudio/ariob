/**
 * ML Response Types - Enhanced to match native implementation
 */

// Base response interfaces matching native implementation
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

// Native response format (what actually comes from Swift)
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

export type MLNativeResponse<T = any> = MLNativeSuccessResponse<T> | MLNativeErrorResponse;

// Legacy MLX response types for compatibility
export interface MLXSuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
}

export interface MLXErrorResponse {
  success: false;
  error: string;
  errorCode: string;
  timestamp: string;
}

export type MLXResponse<T = any> = MLXSuccessResponse<T> | MLXErrorResponse;

// Comprehensive error codes
export const ML_ERROR_CODES = {
  // Parsing and validation
  PARSE_ERROR: 'PARSE_ERROR',
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
  INVALID_INPUT: 'INVALID_INPUT',

  // Model management
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  MODEL_LOAD_FAILED: 'MODEL_LOAD_FAILED',
  MODEL_LOADING_CANCELLED: 'MODEL_LOADING_CANCELLED',
  MODEL_TYPE_MISMATCH: 'MODEL_TYPE_MISMATCH',

  // Inference and operations
  INFERENCE_FAILED: 'INFERENCE_FAILED',
  STREAMING_ERROR: 'STREAMING_ERROR',
  STREAMING_CANCELLED: 'STREAMING_CANCELLED',
  FEATURE_NOT_SUPPORTED: 'FEATURE_NOT_SUPPORTED',

  // Memory and resources
  MEMORY_ERROR: 'MEMORY_ERROR',
  MEMORY_PRESSURE_HIGH: 'MEMORY_PRESSURE_HIGH',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // System and network
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  QUANTIZATION_ERROR: 'QUANTIZATION_ERROR',
  UNSUPPORTED_MODEL_TYPE: 'UNSUPPORTED_MODEL_TYPE',

  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export type MLErrorCode = typeof ML_ERROR_CODES[keyof typeof ML_ERROR_CODES];

// Legacy compatibility
export const MLX_ERROR_CODES = ML_ERROR_CODES;
export type MLXErrorCode = MLErrorCode;

// Enhanced error class
export class MLError extends Error {
  public readonly code: MLErrorCode;
  public readonly timestamp: number;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    code: MLErrorCode = 'UNKNOWN_ERROR',
    timestamp?: number,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'MLError';
    this.code = code;
    this.timestamp = timestamp ?? Date.now();
    this.details = details;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp,
      details: this.details,
      stack: this.stack
    };
  }

  static fromNativeError(nativeError: MLNativeErrorResponse): MLError {
    return new MLError(
      nativeError.message,
      'UNKNOWN_ERROR',
      nativeError.timestamp
    );
  }

  static isRetryable(error: MLError): boolean {
    const retryableCodes: MLErrorCode[] = [
      'NETWORK_ERROR',
      'MEMORY_ERROR',
      'STREAMING_ERROR'
    ];
    return retryableCodes.includes(error.code);
  }
}

// Legacy compatibility
export class MLXError extends MLError {
  constructor(
    message: string,
    code: MLXErrorCode = 'PARSE_ERROR',
    timestamp: string = new Date().toISOString()
  ) {
    super(message, code, parseInt(timestamp, 10) || Date.now());
    this.name = 'MLXError';
  }
}

// Response utilities
export function isMLSuccessResponse<T>(response: any): response is MLSuccessResponse<T> {
  return response && typeof response === 'object' && response.success === true && 'data' in response;
}

export function isMLErrorResponse(response: any): response is MLErrorResponse {
  return response && typeof response === 'object' && response.success === false && 'error' in response;
}

export function isMLNativeSuccessResponse<T>(response: any): response is MLNativeSuccessResponse<T> {
  return response && typeof response === 'object' && response.success === true && 'data' in response;
}

export function isMLNativeErrorResponse(response: any): response is MLNativeErrorResponse {
  return response && typeof response === 'object' && response.error === true && 'message' in response;
}

// Response transformation utilities
export function transformNativeToMLResponse<T>(nativeResponse: MLNativeResponse<T>): MLResponse<T> {
  if (isMLNativeErrorResponse(nativeResponse)) {
    return {
      success: false,
      error: nativeResponse.message,
      errorCode: 'UNKNOWN_ERROR',
      timestamp: nativeResponse.timestamp
    };
  }

  return {
    success: true,
    data: nativeResponse.data,
    timestamp: nativeResponse.timestamp
  };
}

export function createMLErrorFromString(errorString: string, code: MLErrorCode = 'PARSE_ERROR'): MLError {
  try {
    const parsed = JSON.parse(errorString);
    if (isMLNativeErrorResponse(parsed)) {
      return MLError.fromNativeError(parsed);
    }
    return new MLError(parsed.error || parsed.message || errorString, code);
  } catch {
    return new MLError(errorString, code);
  }
}