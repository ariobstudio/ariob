/**
 * @ariob/core
 *
 * Gun.js wrapper with type-safe React hooks
 */

// Graph factory
export { createGraph } from './gun/graph';

// Hooks
export { useNode } from './hooks/useNode';
export { useSet } from './hooks/useSet';
export { useAuth } from './hooks/useAuth';
export { useKeys } from './hooks/useKeys';

// Store
export { useAuthStore } from './store/auth';

// Result type system
export { Result, isOk, isErr } from './utils/result';
export type { Ok, Err } from './utils/result';

// SEA cryptography helpers
export {
  encrypt,
  decrypt,
  work,
  secret,
  sign,
  verify,
  pair,
  certify,
} from './utils/helpers';

// Type exports
export type {
  GunInstance,
  GunOptions,
  IGunChainReference,
  GunUser,
  KeyPair
} from './gun/graph';

export type {
  UseNodeResult
} from './hooks/useNode';

export type {
  UseSetResult,
  CollectionItem
} from './hooks/useSet';

export type {
  UseAuthResult,
  AuthResult
} from './hooks/useAuth';

export type {
  UserInfo
} from './store/auth';

export { z } from 'zod';
