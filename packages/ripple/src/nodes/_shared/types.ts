/**
 * Action Type Schemas
 *
 * Foundation schemas for the schema-driven action system.
 * Actions are behaviors that nodes can execute, defined by metadata.
 *
 * Following UNIX philosophy:
 * - One-word verbs: edit, share, expand, chat
 * - Silent success, loud failure: Result pattern
 */

import { z } from '@ariob/core';
import { DegreeEnum, VariantEnum } from './base';

/**
 * Action category for grouping and display
 */
export const CategoryEnum = z.enum(['primary', 'secondary', 'destructive', 'navigation']);
export type Category = z.infer<typeof CategoryEnum>;

/**
 * Action button variant
 */
export const ActionVariantEnum = z.enum(['solid', 'ghost', 'outline']);
export type ActionVariant = z.infer<typeof ActionVariantEnum>;

/**
 * ActionMeta - metadata describing an action
 *
 * This schema defines WHAT an action is, not HOW it executes.
 * The registry maps verbs to handlers.
 */
export const ActionMeta = z.object({
  /** Unique verb identifier (e.g., 'edit', 'share', 'expand') */
  verb: z.string(),

  /** Human-readable label */
  label: z.string(),

  /** Icon name (Ionicons) */
  icon: z.string(),

  /** Action category for grouping */
  category: CategoryEnum,

  /** Visual style for button */
  variant: ActionVariantEnum.default('ghost'),

  /** Requires confirmation dialog */
  confirm: z.boolean().default(false),

  /** Only available to node owner */
  ownerOnly: z.boolean().default(false),

  /** Available in specific degrees (undefined = all) */
  degrees: z.array(DegreeEnum).optional(),

  /** Available in specific variants (undefined = all) */
  variants: z.array(VariantEnum).optional(),
});

export type ActionMeta = z.infer<typeof ActionMeta>;

/**
 * RegistryContext - execution context for registry actions
 *
 * Provides the runtime information needed to execute and
 * determine availability of schema-driven actions.
 */
export const RegistryContext = z.object({
  /** The node being acted upon */
  nodeId: z.string(),
  nodeType: z.string(),

  /** Current user */
  userId: z.string().optional(),
  isOwner: z.boolean().default(false),

  /** Current view state */
  degree: DegreeEnum,
  variant: VariantEnum,

  /** Additional payload for action execution */
  payload: z.record(z.unknown()).optional(),
});

export type RegistryContext = z.infer<typeof RegistryContext>;

/**
 * ActionResult - result of action execution
 *
 * Discriminated union with three states:
 * - success: action completed
 * - error: action failed
 * - pending: action in progress (e.g., awaiting confirmation)
 */
export const ActionResultSuccess = z.object({
  status: z.literal('success'),
  data: z.unknown().optional(),
  message: z.string().optional(),
  navigate: z.string().optional(), // Route to navigate to
  params: z.record(z.unknown()).optional(), // Navigation params
});

export const ActionResultError = z.object({
  status: z.literal('error'),
  error: z.string(),
  code: z.string().optional(),
});

export const ActionResultPending = z.object({
  status: z.literal('pending'),
  message: z.string().optional(),
});

export const ActionResult = z.discriminatedUnion('status', [
  ActionResultSuccess,
  ActionResultError,
  ActionResultPending,
]);

export type ActionResult = z.infer<typeof ActionResult>;
export type ActionResultSuccess = z.infer<typeof ActionResultSuccess>;
export type ActionResultError = z.infer<typeof ActionResultError>;
export type ActionResultPending = z.infer<typeof ActionResultPending>;

/**
 * Helper to create success result
 */
export function success(data?: unknown, navigate?: string, params?: Record<string, unknown>): ActionResult {
  return { status: 'success', data, navigate, params };
}

/**
 * Helper to create error result
 */
export function error(message: string, code?: string): ActionResult {
  return { status: 'error', error: message, code };
}

/**
 * Helper to create pending result
 */
export function pending(message?: string): ActionResult {
  return { status: 'pending', message };
}
