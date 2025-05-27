// Core Gun exports
export * from './gun/core/gun';
export type { GunInstance, SEA, KeyPair, GunUser, GunChain } from './gun/core/types';

// Schema exports
export type { AppError } from './gun/schema/errors';
export { ErrorType, make as makeError, validate, auth, db, notFound, permission, network, unknown, fromZod, fromGun } from './gun/schema/errors';
export * from './gun/schema/thing.schema';
export * from './gun/schema/who.schema';

// Service exports
export * from './gun/services/account.service';
export * from './gun/services/secure-storage.service';
export * from './gun/services/thing.service';
export * from './gun/services/who.service';

// State exports
export * from './gun/state/auth.store';
export * from './gun/state/multi-auth.store';
export * from './gun/state/thing.store';

// Hook exports
export * from './gun/hooks/useAuth';
export * from './gun/hooks/useMultiAuth';
export * from './gun/hooks/useRealTime';
export * from './gun/hooks/useThing';
export * from './gun/hooks/useThingList'; 