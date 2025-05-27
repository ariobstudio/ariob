import { ZodError } from 'zod';

export enum ErrorType {
  Validation = 'VALIDATION_ERROR',
  Auth = 'AUTH_ERROR',
  DB = 'DB_ERROR',
  Network = 'NETWORK_ERROR',
  NotFound = 'NOT_FOUND',
  Permission = 'PERMISSION_ERROR',
  Unknown = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  cause?: unknown;
}

// Create error with type and message
export const make = (
  type: ErrorType,
  message: string,
  cause?: unknown
): AppError => ({
  type,
  message,
  cause
});

// Validation error
export const validate = (
  message: string = 'Validation failed',
  cause?: unknown
): AppError => make(ErrorType.Validation, message, cause);

// Authentication error
export const auth = (
  message: string = 'Authentication failed',
  cause?: unknown
): AppError => make(ErrorType.Auth, message, cause);

// Database error
export const db = (
  message: string = 'Database operation failed',
  cause?: unknown
): AppError => make(ErrorType.DB, message, cause);

// Not found error
export const notFound = (
  message: string = 'Resource not found',
  cause?: unknown
): AppError => make(ErrorType.NotFound, message, cause);

// Permission error
export const permission = (
  message: string = 'Permission denied',
  cause?: unknown
): AppError => make(ErrorType.Permission, message, cause);

// Network error
export const network = (
  message: string = 'Network operation failed',
  cause?: unknown
): AppError => make(ErrorType.Network, message, cause);

// Unknown error
export const unknown = (
  message: string = 'An unknown error occurred',
  cause?: unknown
): AppError => make(ErrorType.Unknown, message, cause);

// Handle Zod validation errors
export const fromZod = (error: unknown): AppError => {
  if (error instanceof ZodError) {
    const firstError = error.errors[0];
    return validate(firstError?.message || 'Validation failed', error);
  }
  
  if (error instanceof Error) {
    return unknown(error.message, error);
  }
  
  return unknown(String(error), error);
};

// Handle Gun errors
export const fromGun = (ack: { err?: string }): AppError | null => {
  if (!ack.err) return null;
  return db(ack.err);
}; 