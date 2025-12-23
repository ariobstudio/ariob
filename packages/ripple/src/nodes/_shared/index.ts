/**
 * Shared Node Infrastructure
 *
 * Re-exports all shared schemas, types, and utilities.
 * This is the foundation for all node types.
 */

// Base schemas
export {
  DegreeEnum,
  VariantEnum,
  NodeMeta,
  BaseNode,
  defaults,
  type Degree,
  type Variant,
} from './base';

// Action types
export {
  CategoryEnum,
  ActionVariantEnum,
  ActionMeta,
  RegistryContext,
  ActionResult,
  ActionResultSuccess,
  ActionResultError,
  ActionResultPending,
  success,
  error,
  pending,
  type Category,
  type ActionVariant,
} from './types';

// Registry
export {
  registry,
  action,
  define,
  type ActionHandler,
  type RegisteredAction,
} from './registry';
