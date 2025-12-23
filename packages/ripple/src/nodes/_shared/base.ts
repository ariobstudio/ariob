/**
 * Base Node Schemas
 *
 * Foundation schemas for all Node types in the Social OS.
 * Nodes are universal content primitives with type-driven behaviors.
 *
 * Following UNIX philosophy: small, composable schemas.
 */

import { Thing, z } from '@ariob/core';

/**
 * Degree type - visibility scope for content
 * - 0: Me (personal posts/settings)
 * - 1: Friends (direct connections)
 * - 2: World (friends-of-friends, public)
 * - 3: Discover (recommendations, trending)
 * - 4: Noise (filtered, bots, spam)
 */
export const DegreeEnum = z.enum(['0', '1', '2', '3', '4']);
export type Degree = z.infer<typeof DegreeEnum>;

/**
 * Node variant - determines rendering style
 */
export const VariantEnum = z.enum(['preview', 'card', 'full']);
export type Variant = z.infer<typeof VariantEnum>;

/**
 * NodeMeta - common metadata for all nodes
 *
 * Every node has:
 * - type: discriminator for schema/renderer selection
 * - degree: visibility scope (0=self, 1=friends, 2=world, 3=discover)
 * - actions: array of available action verbs (schema-driven!)
 * - variant: current rendering style
 */
export const NodeMeta = z.object({
  /** Node type discriminator */
  type: z.string(),

  /** Visibility degree */
  degree: DegreeEnum.default('1'),

  /** Available actions for this node (by verb) */
  actions: z.array(z.string()).default([]),

  /** Renderer variant */
  variant: VariantEnum.default('preview'),
});

export type NodeMeta = z.infer<typeof NodeMeta>;

/**
 * BaseNode - all nodes extend this
 *
 * Merges Thing (Gun soul) with NodeMeta.
 * This is the foundation for all content primitives.
 */
export const BaseNode = Thing.merge(NodeMeta);
export type BaseNode = z.infer<typeof BaseNode>;

/**
 * Helper to create default actions array for a node type
 */
export function defaults(actions: string[]): z.ZodDefault<z.ZodArray<z.ZodString>> {
  return z.array(z.string()).default(actions);
}
