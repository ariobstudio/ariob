// Core Gun exports
export { gun, sea } from './gun/core/gun';
export type { GunInstance, SEA, KeyPair, GunUser, GunChain } from './gun/core/types';

// Schema exports
export * from './gun/schema/thing.schema';
export * from './gun/schema/who.schema';
export * from './gun/schema/errors';

// Pure utility exports (NEW - Phase 1)
export { soul, parse, stamp, random, extract } from './gun/lib/utils';
export { storage, Web as WebStorage, Native as NativeStorage } from './gun/lib/storage';
export type { Storage } from './gun/lib/storage';

// Freeze module exports (NEW - Immutable data)
export { freeze, thaw, hash, list, link, resolve } from './gun/lib/freeze';
export type { Frozen, FreezeOptions, ThawOptions } from './gun/lib/freeze';

// Adapter exports (NEW - Phase 1)
export {
  adapt,
  Gun as GunAdapter,
  User as UserAdapter,
  Memory as MemoryAdapter,
} from './gun/adapters';
export type { Adapter, AdapterOptions } from './gun/adapters';

// Service exports (NEW - Phase 2)
export {
  make,
  service,
  validator,
  manager,
} from './gun/services/thing';
export type {
  ThingService,
  ServiceOptions,
  ServiceConfig,
  Validator,
  Manager,
  PrepareOptions,
} from './gun/services/thing';

// Legacy service exports (DEPRECATED - for backward compatibility)
export { make as makeThingService, soul as createSoul } from './gun/services/thing.service';
export type {
  ThingService as LegacyThingService,
  ServiceOptions as LegacyServiceOptions,
} from './gun/services/thing.service';

// Who service exports (NEW - Phase 2.2)
export {
  who,
  service as whoService,
  credentials,
  auth,
  profile,
} from './gun/services/who';
export type {
  WhoService,
  CredentialsManager,
  AuthManager,
  AuthResult,
  AuthMode,
  ProfileManager,
  Who,
  Credentials,
  AuthRequest,
  ProfileUpdate,
} from './gun/services/who';

// Legacy Who service export (DEPRECATED - for backward compatibility)
export { who as legacyWho } from './gun/services/who.service';

// State exports (NEW - Phase 3)
export { store } from './gun/state/factory';
export type { Store, BaseState, BaseActions, StoreOptions } from './gun/state/factory';
export { createThingStore } from './gun/state/thing.store';
export { useWhoStore } from './gun/state/who.store';
export type { ThingStore } from './gun/state/thing.store';
export type { WhoStore } from './gun/state/who.store';

// Hook exports
export { useThing } from './gun/hooks/useThing';
export { useThingList } from './gun/hooks/useThingList';
export { useWho } from './gun/hooks/useWho';