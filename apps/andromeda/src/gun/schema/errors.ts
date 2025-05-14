import { ZodError } from 'zod';

export enum ErrorType {
  Validation = 'VALIDATION_ERROR',
  Authentication = 'AUTHENTICATION_ERROR',
  Database = 'DATABASE_ERROR',
  Network = 'NETWORK_ERROR',
  NotFound = 'NOT_FOUND_ERROR',
  Permission = 'PERMISSION_ERROR',
  Unknown = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  cause?: unknown;
}

export const createAppError = (
  type: ErrorType,
  message: string,
  cause?: unknown
): AppError => ({
  type,
  message,
  cause
});

export const createValidationError = (
  message: string = 'Validation failed',
  cause?: unknown
): AppError => createAppError(ErrorType.Validation, message, cause);

export const createAuthError = (
  message: string = 'Authentication failed',
  cause?: unknown
): AppError => createAppError(ErrorType.Authentication, message, cause);

export const createDatabaseError = (
  message: string = 'Database operation failed',
  cause?: unknown
): AppError => createAppError(ErrorType.Database, message, cause);

export const createNotFoundError = (
  message: string = 'Resource not found',
  cause?: unknown
): AppError => createAppError(ErrorType.NotFound, message, cause);

export const createPermissionError = (
  message: string = 'Permission denied',
  cause?: unknown
): AppError => createAppError(ErrorType.Permission, message, cause);

export const createNetworkError = (
  message: string = 'Network operation failed',
  cause?: unknown
): AppError => createAppError(ErrorType.Network, message, cause);

export const createUnknownError = (
  message: string = 'An unknown error occurred',
  cause?: unknown
): AppError => createAppError(ErrorType.Unknown, message, cause);

export const handleZodError = (error: unknown): AppError => {
  if (error instanceof ZodError) {
    const firstError = error.errors[0];
    return createValidationError(
      firstError?.message || 'Validation failed',
      error
    );
  }
  
  if (error instanceof Error) {
    return createUnknownError(error.message, error);
  }
  
  return createUnknownError(String(error), error);
};

export const handleGunError = (ack: { err?: string }): AppError | null => {
  if (!ack.err) return null;
  
  return createDatabaseError(ack.err);
}; 