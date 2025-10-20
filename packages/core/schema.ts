/**
 * Schema Primitives
 *
 * Minimal base schemas for Gun universe entities.
 * Following mathematical composition - Thing is the base, all else extends it.
 */

import { z } from 'zod';

/**
 * Thing - Any object in the Gun universe
 *
 * The most primitive schema representing any node in the graph.
 * Contains only the Gun soul (unique identifier).
 *
 * @example
 * ```typescript
 * const TodoSchema = Thing.extend({
 *   title: z.string(),
 *   done: z.boolean()
 * });
 * ```
 */
export const Thing = z.object({
  /** Gun soul - unique identifier for this node */
  '#': z.string().optional(),
});

/**
 * Who - Any authenticated entity in the Gun universe
 *
 * Extends Thing with cryptographic identity.
 * Represents any keypair-attached object (user, device, service).
 *
 * @example
 * ```typescript
 * const ProfileSchema = Who.extend({
 *   name: z.string(),
 *   bio: z.string().optional()
 * });
 * ```
 */
export const Who = Thing.extend({
  /** Public signing key */
  pub: z.string(),
  /** Public encryption key */
  epub: z.string(),
  /** Human-readable alias */
  alias: z.string(),
});

/**
 * Type inference helpers
 */
export type Thing = z.infer<typeof Thing>;
export type Who = z.infer<typeof Who>;
