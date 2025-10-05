import { sea } from '../core/gun';
import { z } from 'zod';

/**
 * Pure utility functions - no side effects
 * Each function does ONE thing, uses ONE word verbs
 * Following UNIX philosophy for simplicity and composability
 */

/**
 * Generate a random ID using SEA
 *
 * @example
 * ```typescript
 * const id = random();        // 16 bytes (default)
 * const short = random(8);    // 8 bytes
 * ```
 *
 * @param bytes - Number of bytes for the ID (default: 16)
 * @returns Random string identifier
 */
export const random = (bytes: number = 16): string => {
  return sea.random(bytes);
};

/**
 * Create a Gun path from prefix and ID
 *
 * @example
 * ```typescript
 * const path = soul('todos', '123');
 * // Returns: 'todos/123'
 * ```
 *
 * @param prefix - Path prefix (e.g., 'todos', 'users')
 * @param id - Unique identifier
 * @returns Gun path string
 */
export const soul = (prefix: string, id: string): string => {
  return `${prefix}/${id}`;
};

/**
 * Parse a Gun path into prefix and ID
 *
 * @example
 * ```typescript
 * const parts = parse('todos/123');
 * // Returns: { prefix: 'todos', id: '123' }
 *
 * const invalid = parse('invalid');
 * // Returns: null
 * ```
 *
 * @param path - Gun path to parse
 * @returns Object with prefix and id, or null if invalid
 */
export const parse = (path: string): { prefix: string; id: string } | null => {
  const parts = path.split('/');
  if (parts.length !== 2) return null;
  return { prefix: parts[0], id: parts[1] };
};

/**
 * Get current timestamp
 *
 * @example
 * ```typescript
 * const now = stamp();
 * // Returns: 1696435200000
 * ```
 *
 * @returns Current timestamp in milliseconds
 */
export const stamp = (): number => {
  return Date.now();
};

/**
 * Extract schema type from Zod schema
 * Looks for a literal 'schema' field in the schema shape
 *
 * @example
 * ```typescript
 * const TodoSchema = z.object({
 *   schema: z.literal('todo'),
 *   title: z.string(),
 * });
 *
 * const type = extract(TodoSchema);
 * // Returns: 'todo'
 * ```
 *
 * @param schema - Zod schema to extract type from
 * @returns Schema type string, or null if not found
 */
export const extract = (schema: z.ZodType<any>): string | null => {
  if (schema instanceof z.ZodObject) {
    const shape = (schema as any).shape;
    if (shape?.schema instanceof z.ZodLiteral) {
      return shape.schema.value;
    }
  }
  return null;
};
