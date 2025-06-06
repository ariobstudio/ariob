// Core services
export { who } from './who.service';
export { make } from './thing.service';

// Re-export types
export type { Who, Credentials, ProfileUpdate } from '../schema/who.schema';
export type { Thing } from '../schema/thing.schema'; 