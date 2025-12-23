/**
 * Result - Type-safe Result type tests
 *
 * Tests for the functional Result<T, E> pattern.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { Result, isOk, isErr } from '../result';

describe('Result', () => {
  // ─────────────────────────────────────────────────────────────────────────
  // Result.ok()
  // ─────────────────────────────────────────────────────────────────────────

  describe('ok()', () => {
    it('creates a successful result', () => {
      const result = Result.ok(42);

      expect(result.ok).toBe(true);
      expect(result.value).toBe(42);
      expect(result.error).toBeUndefined();
    });

    it('works with complex types', () => {
      const data = { name: 'Alice', age: 30 };
      const result = Result.ok(data);

      expect(result.ok).toBe(true);
      expect(result.value).toEqual(data);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Result.error()
  // ─────────────────────────────────────────────────────────────────────────

  describe('error()', () => {
    it('creates a failed result', () => {
      const result = Result.error('Something went wrong');

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Something went wrong');
      expect(result.value).toBeUndefined();
    });

    it('works with Error objects', () => {
      const error = new Error('Oops');
      const result = Result.error(error);

      expect(result.ok).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // isOk() / isErr()
  // ─────────────────────────────────────────────────────────────────────────

  describe('isOk() / isErr()', () => {
    it('isOk returns true for Ok result', () => {
      const result = Result.ok(42);
      expect(isOk(result)).toBe(true);
      expect(isErr(result)).toBe(false);
    });

    it('isErr returns true for Err result', () => {
      const result = Result.error('fail');
      expect(isErr(result)).toBe(true);
      expect(isOk(result)).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Result.from()
  // ─────────────────────────────────────────────────────────────────────────

  describe('from()', () => {
    it('returns Ok when function succeeds', () => {
      const result = Result.from(() => JSON.parse('{"a": 1}'));

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ a: 1 });
      }
    });

    it('returns Err when function throws', () => {
      const result = Result.from(() => JSON.parse('invalid json'));

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it('wraps non-Error throws in Error', () => {
      const result = Result.from(() => {
        throw 'string error';
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBe('string error');
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Result.fromAsync()
  // ─────────────────────────────────────────────────────────────────────────

  describe('fromAsync()', () => {
    it('returns Ok when promise resolves', async () => {
      const result = await Result.fromAsync(async () => 42);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(42);
      }
    });

    it('returns Err when promise rejects', async () => {
      const result = await Result.fromAsync(async () => {
        throw new Error('async error');
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('async error');
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Result.map()
  // ─────────────────────────────────────────────────────────────────────────

  describe('map()', () => {
    it('transforms Ok value', () => {
      const result = Result.ok(5);
      const mapped = Result.map(result, (x) => x * 2);

      expect(mapped.ok).toBe(true);
      if (mapped.ok) {
        expect(mapped.value).toBe(10);
      }
    });

    it('passes through Err unchanged', () => {
      const result = Result.error('fail');
      const mapped = Result.map(result, (x: number) => x * 2);

      expect(mapped.ok).toBe(false);
      if (!mapped.ok) {
        expect(mapped.error).toBe('fail');
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Result.mapError()
  // ─────────────────────────────────────────────────────────────────────────

  describe('mapError()', () => {
    it('transforms Err value', () => {
      const result = Result.error('error');
      const mapped = Result.mapError(result, (e) => `Failed: ${e}`);

      expect(mapped.ok).toBe(false);
      if (!mapped.ok) {
        expect(mapped.error).toBe('Failed: error');
      }
    });

    it('passes through Ok unchanged', () => {
      const result = Result.ok(42);
      const mapped = Result.mapError(result, (e: string) => `Failed: ${e}`);

      expect(mapped.ok).toBe(true);
      if (mapped.ok) {
        expect(mapped.value).toBe(42);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Result.chain()
  // ─────────────────────────────────────────────────────────────────────────

  describe('chain()', () => {
    it('chains Ok results', () => {
      const result = Result.ok(5);
      const chained = Result.chain(result, (x) => Result.ok(x * 2));

      expect(chained.ok).toBe(true);
      if (chained.ok) {
        expect(chained.value).toBe(10);
      }
    });

    it('short-circuits on Err', () => {
      const result = Result.error('fail');
      const chained = Result.chain(result, (x: number) => Result.ok(x * 2));

      expect(chained.ok).toBe(false);
      if (!chained.ok) {
        expect(chained.error).toBe('fail');
      }
    });

    it('propagates errors from chain function', () => {
      const result = Result.ok(0);
      const chained = Result.chain(result, (x) =>
        x === 0 ? Result.error('Division by zero') : Result.ok(10 / x)
      );

      expect(chained.ok).toBe(false);
      if (!chained.ok) {
        expect(chained.error).toBe('Division by zero');
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Result.unwrap()
  // ─────────────────────────────────────────────────────────────────────────

  describe('unwrap()', () => {
    it('returns value for Ok', () => {
      const result = Result.ok(42);
      expect(Result.unwrap(result)).toBe(42);
    });

    it('throws for Err', () => {
      const result = Result.error('fail');
      expect(() => Result.unwrap(result)).toThrow('fail');
    });

    it('throws Error object directly', () => {
      const error = new Error('original error');
      const result = Result.error(error);
      expect(() => Result.unwrap(result)).toThrow(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Result.unwrapOr()
  // ─────────────────────────────────────────────────────────────────────────

  describe('unwrapOr()', () => {
    it('returns value for Ok', () => {
      const result = Result.ok(42);
      expect(Result.unwrapOr(result, 0)).toBe(42);
    });

    it('returns default for Err', () => {
      const result = Result.error('fail');
      expect(Result.unwrapOr(result, 0)).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Result.match()
  // ─────────────────────────────────────────────────────────────────────────

  describe('match()', () => {
    it('calls ok handler for Ok', () => {
      const result = Result.ok(42);
      const message = Result.match(result, {
        ok: (v) => `Success: ${v}`,
        error: (e) => `Failed: ${e}`,
      });

      expect(message).toBe('Success: 42');
    });

    it('calls error handler for Err', () => {
      const result = Result.error('oops');
      const message = Result.match(result, {
        ok: (v) => `Success: ${v}`,
        error: (e) => `Failed: ${e}`,
      });

      expect(message).toBe('Failed: oops');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Result.all()
  // ─────────────────────────────────────────────────────────────────────────

  describe('all()', () => {
    it('combines all Ok results', () => {
      const results = [Result.ok(1), Result.ok(2), Result.ok(3)];
      const combined = Result.all(results);

      expect(combined.ok).toBe(true);
      if (combined.ok) {
        expect(combined.value).toEqual([1, 2, 3]);
      }
    });

    it('fails on first Err', () => {
      const results = [
        Result.ok(1),
        Result.error('fail'),
        Result.ok(3),
      ];
      const combined = Result.all(results);

      expect(combined.ok).toBe(false);
      if (!combined.ok) {
        expect(combined.error).toBe('fail');
      }
    });

    it('handles empty array', () => {
      const combined = Result.all([]);

      expect(combined.ok).toBe(true);
      if (combined.ok) {
        expect(combined.value).toEqual([]);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Result.collect()
  // ─────────────────────────────────────────────────────────────────────────

  describe('collect()', () => {
    it('collects all Ok values', () => {
      const results = [Result.ok(1), Result.ok(2), Result.ok(3)];
      const collected = Result.collect(results);

      expect(collected.ok).toBe(true);
      if (collected.ok) {
        expect(collected.value).toEqual([1, 2, 3]);
      }
    });

    it('collects all errors', () => {
      const results = [
        Result.ok(1),
        Result.error('error 1'),
        Result.error('error 2'),
      ];
      const collected = Result.collect(results);

      expect(collected.ok).toBe(false);
      if (!collected.ok) {
        expect(collected.error).toEqual(['error 1', 'error 2']);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Result.parse()
  // ─────────────────────────────────────────────────────────────────────────

  describe('parse()', () => {
    const UserSchema = z.object({
      name: z.string(),
      age: z.number(),
    });

    it('returns Ok for valid data', () => {
      const result = Result.parse(UserSchema, { name: 'Alice', age: 30 });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ name: 'Alice', age: 30 });
      }
    });

    it('returns Err for invalid data', () => {
      const result = Result.parse(UserSchema, { name: 123, age: 'invalid' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(z.ZodError);
      }
    });

    it('returns Err for missing fields', () => {
      const result = Result.parse(UserSchema, { name: 'Alice' });

      expect(result.ok).toBe(false);
    });
  });
});
