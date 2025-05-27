import { z } from 'zod';

// Error types
export type ErrorType = 
  | 'validation' 
  | 'auth' 
  | 'db' 
  | 'network' 
  | 'unknown';

// Base app error
export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Create error from Zod validation error
export const fromZod = (error: unknown): AppError => {
  if (error instanceof z.ZodError) {
    const message = error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    return new AppError(message, 'validation', error);
  }
  return new AppError('Unknown validation error', 'validation', error);
};

// Auth error
export const auth = (message: string, cause?: unknown): AppError => {
  return new AppError(message, 'auth', cause);
};

// Database error
export const db = (message: string, cause?: unknown): AppError => {
  return new AppError(message, 'db', cause);
};

// Network error
export const network = (message: string, cause?: unknown): AppError => {
  return new AppError(message, 'network', cause);
};

// Unknown error
export const unknown = (message: string, cause?: unknown): AppError => {
  return new AppError(message, 'unknown', cause);
}; 