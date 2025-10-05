import { gun, sea } from '../core/gun';
import * as Err from '../schema/errors';
import type { Thing } from '../schema/thing.schema';
import { Result, ok, err } from 'neverthrow';
import { z } from 'zod';
import { who } from './who.service';

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
    const id = sea.random(16);
    const now = Date.now();
    const current = who.current();

    return {
      ...input,
      id,
      soul: soul(prefix, id),
      schema: schemaType,
      createdAt: now,
      updatedAt: now,
      public: (input as any).public ?? true,
      ...(options.scoped && current?.pub && { createdBy: current.pub }),
    } as T;
  };
  
  // Save thing to database
  const save = (thing: T): Promise<Result<T, Err.AppError>> => {
    return new Promise((resolve) => {
      const gunRef = getGunRef();
      gunRef.get(thing.soul).put(thing, (ack: any) => {
        if (ack.err) {
          resolve(err(Err.db(ack.err)));
        } else {
          resolve(ok(thing));
        }
      });
    });
  };
  
  // Create a new thing
  const create: ThingService<T>['create'] = async (input) => {
    try {
      const prepared = prep(input);
      const validated = validate(prepared);
      
      if (validated.isErr()) return validated;
      return await save(validated.value);
    } catch (error: any) {
      return err(Err.auth(error.message));
    }
  };

  // Get a thing by ID
  const get: ThingService<T>['get'] = (id) => {
    return new Promise((resolve) => {
      try {
        const gunRef = getGunRef();
        gunRef.get(soul(prefix, id)).once((data: any) => {
          if (!data) {
            resolve(ok(null));
            return;
          }
          resolve(validate(data));
        });
      } catch (error: any) {
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
    try {
      const gunRef = getGunRef();
      const path = soul(prefix, id);

      gunRef.get(path).on((data: any) => {
        if (!data) {
          callback(ok(null));
          return;
        }
        callback(validate(data));
      });

      const unsubscribe = () => gunRef.get(path).off();
      subscriptions.set(path, unsubscribe);
      
      return () => {
        unsubscribe();
        subscriptions.delete(path);
      };
    } catch (error: any) {
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
