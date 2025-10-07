import { gun, sea } from '../core/gun';
import * as Err from '../schema/errors';
import type { Thing } from '../schema/thing.schema';
import { Result, ok, err } from 'neverthrow';
import { z } from 'zod';
import { who } from './who.service';

// Enhanced logging for background context
const log = (...args: any[]) => {
  console.log(...args);
  // Try to post to main thread if in worker
  if (typeof postMessage !== 'undefined' && typeof window === 'undefined') {
    try {
      postMessage({ type: 'LOG', args });
    } catch (e) {
      // Ignore if postMessage not available
    }
  }
};

// Make soul path from prefix and id
export const soul = (prefix: string, id: string): string => `${prefix}/${id}`;

export interface ServiceOptions {
  /**
   * Whether to scope data to authenticated user
   * If true, data is private to the user
   */
  scoped?: boolean;
}

export interface ThingService<T extends Thing> {
  create: (data: Omit<T, 'id' | 'createdAt' | 'soul' | 'schema' | 'createdBy'>) => Promise<Result<T, Err.AppError>>;
  get: (id: string) => Promise<Result<T | null, Err.AppError>>;
  update: (id: string, updates: Partial<Omit<T, 'id' | 'createdAt' | 'soul' | 'schema'>>) => Promise<Result<T | null, Err.AppError>>;
  remove: (id: string) => Promise<Result<boolean, Err.AppError>>;
  list: () => Promise<Result<T[], Err.AppError>>;
  watch: (id: string, callback: (result: Result<T | null, Err.AppError>) => void) => () => void;
  cleanup: () => void;
  soul: (id: string) => string;
}

// Create thing service factory
export const make = <T extends Thing, TSchema extends z.ZodType<T>>(
  schema: TSchema,
  prefix: string,
  options: ServiceOptions = {}
): ThingService<T> => {
  
  const subscriptions = new Map<string, () => void>();
  const schemaType = extractSchemaType(schema) || prefix;

  // Get the appropriate gun reference
  const getGunRef = () => {
    if (options?.scoped) {
      const me = who.instance();
      if (!me?.is) throw new Error('Authentication required for user-scoped operations');
      return me;
    }
    return gun;
  };

  // Validate data with schema
  const validate = (data: unknown): Result<T, Err.AppError> => {
    try {
      return ok(schema.parse(data));
    } catch (error) {
      return err(Err.fromZod(error));
    }
  };

  // Prepare new thing with defaults
  const prep = (input: Omit<T, 'id' | 'createdAt' | 'soul' | 'schema' | 'createdBy'>): T => {
    console.log('----[thing.service.ts][prep called][Preparing thing with defaults][for Gun storage]');
    console.log('----[thing.service.ts][Input data][Raw input to prep][for]', input);

    console.log('----[thing.service.ts][Generating random ID][Calling sea.random][for unique identifier]');
    const id = sea.random(16);
    console.log('----[thing.service.ts][ID generated][Random ID created][for]', id);

    const now = Date.now();
    const current = who.current();
    console.log('----[thing.service.ts][Current user][Who service current user][for]', current);

    const prepared = {
      ...input,
      id,
      soul: soul(prefix, id),
      schema: schemaType,
      createdAt: now,
      updatedAt: now,
      public: (input as any).public ?? true,
      ...(options.scoped && current?.pub && { createdBy: current.pub }),
    } as T;
    console.log('----[thing.service.ts][Thing prepared][Complete prepared object][for]', prepared);

    return prepared;
  };
  
  // Save thing to database
  const save = (thing: T): Promise<Result<T, Err.AppError>> => {
    console.log('----[thing.service.ts][save called][Saving thing to Gun][for database persistence]');
    console.log('----[thing.service.ts][Thing to save][Object being persisted][for]', thing);
    console.log('----[thing.service.ts][Soul path][Gun storage path][for]', thing.soul);

    return new Promise((resolve) => {
      console.log('----[thing.service.ts][Getting Gun ref][Calling getGunRef][for Gun instance]');
      const gunRef = getGunRef();
      console.log('----[thing.service.ts][Gun ref obtained][Got Gun reference][for]', gunRef);

      let resolved = false;

      // Timeout to prevent hanging indefinitely
      const timeout = setTimeout(() => {
        if (!resolved) {
          console.log('----[thing.service.ts][Timeout reached][Gun callback did not fire in time][for fallback success]');
          console.log('----[thing.service.ts][Assuming success][Treating timeout as success for offline-first][for resilience]');
          resolved = true;
          resolve(ok(thing));
        }
      }, 3000); // 3 second timeout

      console.log('----[thing.service.ts][Calling gun.get().put()][Executing Gun put operation][for persistence]');
      gunRef.get(thing.soul).put(thing, (ack: any) => {
        if (resolved) {
          console.log('----[thing.service.ts][Late callback][Gun callback after timeout][for info]', ack);
          return;
        }

        console.log('----[thing.service.ts][Put callback fired][Gun acknowledged operation][for]', ack);
        clearTimeout(timeout);
        resolved = true;

        if (ack.err) {
          console.error('----[thing.service.ts][Gun error][Put operation failed][for debugging]', ack.err);
          resolve(err(Err.db(ack.err)));
        } else {
          console.log('----[thing.service.ts][Put success][Data saved successfully][for]');
          resolve(ok(thing));
        }
      });
      console.log('----[thing.service.ts][Put initiated][Waiting for Gun callback or timeout][for async operation]');
    });
  };
  
  // Create a new thing
  const create: ThingService<T>['create'] = async (input) => {
    log('----[thing.service.ts][create called][Starting thing creation][for new database entry]');
    log('----[thing.service.ts][Input][Data to create][for]', input);

    try {
      console.log('----[thing.service.ts][Preparing][Calling prep function][for data preparation]');
      const prepared = prep(input);

      console.log('----[thing.service.ts][Validating][Calling validate function][for schema validation]');
      const validated = validate(prepared);

      if (validated.isErr()) {
        console.error('----[thing.service.ts][Validation failed][Schema validation error][for]', validated.error);
        return validated;
      }

      console.log('----[thing.service.ts][Validation passed][About to save][for Gun storage]');
      const result = await save(validated.value);
      console.log('----[thing.service.ts][Save completed][Save function returned][for]', result);
      return result;
    } catch (error: any) {
      console.error('----[thing.service.ts][Exception caught][Unexpected error][for debugging]', error);
      return err(Err.auth(error.message));
    }
  };

  // Get a thing by ID
  const get: ThingService<T>['get'] = (id) => {
    console.log('----[thing.service.ts][get called][Getting thing by ID][for]', id);
    const soulPath = soul(prefix, id);
    console.log('----[thing.service.ts][Soul path][Gun path for get][for]', soulPath);

    return new Promise((resolve) => {
      try {
        console.log('----[thing.service.ts][Getting Gun ref][Calling getGunRef for get][for Gun instance]');
        const gunRef = getGunRef();
        console.log('----[thing.service.ts][Calling gun.get().once()][Fetching from Gun][for one-time read]');

        gunRef.get(soulPath).once((data: any) => {
          console.log('----[thing.service.ts][Gun once callback][Data received][for]', data);
          if (!data) {
            console.log('----[thing.service.ts][No data][Item not found][for]', id);
            resolve(ok(null));
            return;
          }
          console.log('----[thing.service.ts][Data found][Validating data][for]', data);
          const validated = validate(data);
          console.log('----[thing.service.ts][Validation result][Get validation complete][for]', validated);
          resolve(validated);
        });
      } catch (error: any) {
        console.error('----[thing.service.ts][Get exception][Error in get][for]', error);
        resolve(err(Err.auth(error.message)));
      }
    });
  };

  // Update a thing
  const update: ThingService<T>['update'] = async (id, updates) => {
    try {
      const existing = await get(id);
      if (existing.isErr()) return existing;
      if (!existing.value) return ok(null);

      const updated = {
        ...existing.value,
        ...updates,
        updatedAt: Date.now(),
      };

      const validated = validate(updated);
      if (validated.isErr()) return validated;
      
      return await save(validated.value);
    } catch (error: any) {
      return err(Err.auth(error.message));
    }
  };

  // Delete a thing
  const remove: ThingService<T>['remove'] = (id) => {
    return new Promise((resolve) => {
      try {
        const gunRef = getGunRef();
        gunRef.get(soul(prefix, id)).put(null, (ack: any) => {
          if (ack.err) {
            resolve(err(Err.db(ack.err)));
          } else {
            resolve(ok(true));
          }
        });
      } catch (error: any) {
        resolve(err(Err.auth(error.message)));
      }
    });
  };

  // List all things
  const list: ThingService<T>['list'] = () => {
    return new Promise((resolve) => {
      try {
        const items: T[] = [];
        const gunRef = getGunRef();

        gunRef.get(prefix).map().once((data: any) => {
          if (data) {
            const validated = validate(data);
            if (validated.isOk()) {
              items.push(validated.value);
            }
          }
        });

        // Gun doesn't have a "done" callback, so use timeout
        setTimeout(() => resolve(ok(items)), 300);
      } catch (error: any) {
        resolve(err(Err.auth(error.message)));
      }
    });
  };

  // Subscribe to a thing (real-time updates)
  const watch: ThingService<T>['watch'] = (id, callback) => {
    console.log('----[thing.service.ts][watch called][Starting watch subscription][for]', id);
    try {
      console.log('----[thing.service.ts][Getting Gun ref][Calling getGunRef for watch][for Gun instance]');
      const gunRef = getGunRef();
      const path = soul(prefix, id);
      console.log('----[thing.service.ts][Watch path][Soul path for subscription][for]', path);

      console.log('----[thing.service.ts][Setting up gun.on()][Subscribing to real-time updates][for]', path);
      gunRef.get(path).on((data: any) => {
        console.log('----[thing.service.ts][Watch on callback][Real-time update received][for]', { path, data });
        if (!data) {
          console.log('----[thing.service.ts][Watch no data][Item deleted or null][for]', id);
          callback(ok(null));
          return;
        }
        console.log('----[thing.service.ts][Watch data][Validating update][for]', data);
        const validated = validate(data);
        console.log('----[thing.service.ts][Watch validated][Calling callback with result][for]', validated);
        callback(validated);
      });

      const unsubscribe = () => {
        console.log('----[thing.service.ts][Unsubscribing][Turning off watch][for]', path);
        gunRef.get(path).off();
      };
      subscriptions.set(path, unsubscribe);
      console.log('----[thing.service.ts][Watch active][Subscription registered][for]', path);

      return () => {
        console.log('----[thing.service.ts][Watch cleanup][Cleaning up subscription][for]', path);
        unsubscribe();
        subscriptions.delete(path);
      };
    } catch (error: any) {
      console.error('----[thing.service.ts][Watch exception][Error in watch][for]', error);
      callback(err(Err.auth(error.message)));
      return () => {};
    }
  };

  // Cleanup all subscriptions
  const cleanup = () => {
    subscriptions.forEach(unsubscribe => unsubscribe());
    subscriptions.clear();
  };

  // Return service functions
  return {
    create,
    get,
    update,
    remove,
    list,
    watch,
    cleanup,
    soul: (id: string) => soul(prefix, id),
  };
};

// Extract schema type from Zod schema
const extractSchemaType = (schema: z.ZodType<any>): string | null => {
  if (schema instanceof z.ZodObject && schema.shape.schema instanceof z.ZodLiteral) {
    return schema.shape.schema.value;
  }
  return null;
};
