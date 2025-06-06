/**
 * @core/gun/schema
 * 
 * Core data schemas, type definitions, and error handling for Gun.js integration.
 */

// Thing schemas and types
export { 
  ThingSchema, 
  ContentThingSchema, 
  RelationalThingSchema 
} from './thing.schema';

export type { 
  Thing, 
  ContentThing, 
  RelationalThing 
} from './thing.schema';

// Who schemas and types  
export { 
  WhoSchema, 
  WhoCredentialsSchema, 
  WhoAuthSchema, 
  ProfileUpdateSchema 
} from './who.schema';

export type { 
  Who, 
  WhoCredentials, 
  WhoAuth, 
  ProfileUpdate 
} from './who.schema';

// Error handling
export * as Errors from './errors';
export type { AppError, ErrorType } from './errors';

// Re-export common error functions for convenience
export {
  make as makeError,
  validate as validateError,
  auth as authError,
  db as dbError,
  notFound as notFoundError,
  permission as permissionError,
  network as networkError,
  unknown as unknownError,
  fromZod,
  fromGun
} from './errors'; 