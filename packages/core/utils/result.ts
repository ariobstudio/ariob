/**
 * Result Type System
 *
 * Type-safe Result type for validation and error handling.
 * Inspired by Rust's Result<T, E> and functional programming patterns.
 */

import { z } from 'zod';

/**
 * Represents a successful result with a value
 */
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
  readonly error?: never;
}

/**
 * Represents a failed result with an error
 */
export interface Err<E = string> {
  readonly ok: false;
  readonly value?: never;
  readonly error: E;
}

/**
 * Result type that represents either success (Ok) or failure (Err)
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) {
 *     return Result.error('Division by zero');
 *   }
 *   return Result.ok(a / b);
 * }
 * ```
 */
export type Result<T, E = string> = Ok<T> | Err<E>;

/**
 * Type guard to check if a result is Ok
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true;
}

/**
 * Type guard to check if a result is Err
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.ok === false;
}

/**
 * Result namespace with helper functions for creating and working with Results
 */
export const Result = {
  /**
   * Creates a successful Result
   *
   * @example
   * ```typescript
   * const result = Result.ok(42);
   * ```
   */
  ok: <T>(value: T): Ok<T> => ({
    ok: true,
    value,
  }),

  /**
   * Creates a failed Result
   *
   * @example
   * ```typescript
   * const result = Result.error('Something went wrong');
   * ```
   */
  error: <E = string>(error: E): Err<E> => ({
    ok: false,
    error,
  }),

  /**
   * Creates a Result from a function that might throw
   *
   * @example
   * ```typescript
   * const result = Result.from(() => JSON.parse(jsonString));
   * if (result.ok) {
   *   console.log(result.value);
   * }
   * ```
   */
  from: <T>(fn: () => T): Result<T, Error> => {
    try {
      return Result.ok(fn());
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Creates a Result from a Promise that might reject
   *
   * @example
   * ```typescript
   * const result = await Result.fromAsync(async () => {
   *   const response = await fetch('/api/data');
   *   return response.json();
   * });
   * ```
   */
  fromAsync: async <T>(fn: () => Promise<T>): Promise<Result<T, Error>> => {
    try {
      const value = await fn();
      return Result.ok(value);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Maps the value of an Ok result, leaving Err unchanged
   *
   * @example
   * ```typescript
   * const result = Result.ok(5);
   * const doubled = Result.map(result, x => x * 2); // Ok(10)
   * ```
   */
  map: <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> => {
    if (result.ok) {
      return Result.ok(fn(result.value));
    }
    return result;
  },

  /**
   * Maps the error of an Err result, leaving Ok unchanged
   *
   * @example
   * ```typescript
   * const result = Result.error('error');
   * const mapped = Result.mapError(result, err => `Failed: ${err}`);
   * ```
   */
  mapError: <T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> => {
    if (!result.ok) {
      return Result.error(fn(result.error));
    }
    return result;
  },

  /**
   * Chains multiple Result-returning operations
   *
   * @example
   * ```typescript
   * const result = Result.ok(5)
   *   .pipe(x => Result.ok(x * 2))
   *   .pipe(x => Result.ok(x + 1)); // Ok(11)
   * ```
   */
  chain: <T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> => {
    if (result.ok) {
      return fn(result.value);
    }
    return result;
  },

  /**
   * Unwraps a Result, returning the value or throwing the error
   *
   * @example
   * ```typescript
   * const value = Result.unwrap(Result.ok(42)); // 42
   * const error = Result.unwrap(Result.error('fail')); // throws Error
   * ```
   */
  unwrap: <T, E>(result: Result<T, E>): T => {
    if (result.ok) {
      return result.value;
    }
    throw result.error instanceof Error ? result.error : new Error(String(result.error));
  },

  /**
   * Unwraps a Result, returning the value or a default
   *
   * @example
   * ```typescript
   * const value = Result.unwrapOr(Result.error('fail'), 42); // 42
   * ```
   */
  unwrapOr: <T, E>(result: Result<T, E>, defaultValue: T): T => {
    if (result.ok) {
      return result.value;
    }
    return defaultValue;
  },

  /**
   * Matches on a Result, calling the appropriate function
   *
   * @example
   * ```typescript
   * const message = Result.match(result, {
   *   ok: (value) => `Success: ${value}`,
   *   error: (error) => `Failed: ${error}`
   * });
   * ```
   */
  match: <T, E, R>(
    result: Result<T, E>,
    handlers: { ok: (value: T) => R; error: (error: E) => R }
  ): R => {
    if (result.ok) {
      return handlers.ok(result.value);
    }
    return handlers.error(result.error);
  },

  /**
   * Combines multiple Results into a single Result containing an array
   *
   * @example
   * ```typescript
   * const results = Result.all([
   *   Result.ok(1),
   *   Result.ok(2),
   *   Result.ok(3)
   * ]); // Ok([1, 2, 3])
   *
   * const withError = Result.all([
   *   Result.ok(1),
   *   Result.error('fail'),
   *   Result.ok(3)
   * ]); // Err('fail')
   * ```
   */
  all: <T, E>(results: Result<T, E>[]): Result<T[], E> => {
    const values: T[] = [];
    for (const result of results) {
      if (!result.ok) {
        return result;
      }
      values.push(result.value);
    }
    return Result.ok(values);
  },

  /**
   * Combines multiple Results, collecting all errors
   *
   * @example
   * ```typescript
   * const results = Result.collect([
   *   Result.ok(1),
   *   Result.error('error 1'),
   *   Result.error('error 2')
   * ]); // Err(['error 1', 'error 2'])
   * ```
   */
  collect: <T, E>(results: Result<T, E>[]): Result<T[], E[]> => {
    const values: T[] = [];
    const errors: E[] = [];

    for (const result of results) {
      if (result.ok) {
        values.push(result.value);
      } else {
        errors.push(result.error);
      }
    }

    if (errors.length > 0) {
      return Result.error(errors);
    }

    return Result.ok(values);
  },

  /**
   * Validates data against a Zod schema and returns a Result
   *
   * @param schema - Zod schema to validate against
   * @param data - Data to validate
   * @returns Result containing validated data or Zod error
   *
   * @example
   * ```typescript
   * const UserSchema = z.object({
   *   name: z.string(),
   *   age: z.number()
   * });
   *
   * const result = Result.parse(UserSchema, { name: 'Alice', age: 30 });
   * if (result.ok) {
   *   console.log(result.value); // { name: 'Alice', age: 30 }
   * } else {
   *   console.error(result.error); // ZodError with validation details
   * }
   * ```
   */
  parse: <T>(schema: z.ZodSchema<T>, data: unknown): Result<T, z.ZodError> => {
    const result = schema.safeParse(data);
    if (result.success) {
      return Result.ok(result.data);
    }
    return Result.error(result.error);
  },
} as const;
