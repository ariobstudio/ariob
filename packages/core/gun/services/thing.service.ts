import { gun, sea } from '../core/gun';
import * as Err from '../schema/errors';
import { Thing } from '../schema/thing.schema';
import { Result, ok, err } from 'neverthrow';
import { z } from 'zod';

// Make soul path from prefix and id
export const soul = (prefix: string, id: string): string => `${prefix}/${id}`;

// Validate data with schema
const check = <T>(schema: any, data: any): Result<T, Err.AppError> => {
  try {
    return ok(schema.parse(data));
  } catch (error) {
    return err(Err.fromZod(error));
  }
};

// Create thing service factory
export const make = <T extends Thing, TSchema extends z.ZodType<T>>(
  schema: TSchema,
  prefix: string,
) => {
  // Define service methods
  const prep = (data: Omit<T, 'id' | 'createdAt' | 'soul' | 'version'>): T => {
    const id = sea.random(32)
    const now = Date.now();
    
    return {
      id,
      createdAt: now,
      updatedAt: now,
      soul: soul(prefix, id),
      version: 1,
      ...data,
    } as unknown as T;
  };
  
  // Save thing to database
  const save = (thing: T): Promise<Result<T, Err.AppError>> => {
    return new Promise((resolve) => {
      gun.get(thing.soul).put(thing, (ack) => {
        if (ack.err) {
          resolve(err(Err.db(ack.err)));
        } else {
          resolve(ok(thing));
        }
      });
    });
  };
  
  // Create a new thing
  const create = async (data: Omit<T, 'id' | 'createdAt' | 'soul' | 'version'>): Promise<Result<T, Err.AppError>> => {
    const thing = prep(data);
    const valid = check<T>(schema, thing);
    
    if (valid.isErr()) {
      return valid;
    }
    
    return save(valid.value);
  };

  // Get a thing by ID
  const get = (id: string): Promise<Result<T | null, Err.AppError>> => {
    return new Promise((resolve) => {
      gun.get(soul(prefix, id)).once((data) => {
        if (!data) {
          resolve(ok(null));
          return;
        }

        const valid = check<T>(schema, data);
        if (valid.isErr()) {
          console.error('Invalid data:', valid.error);
          resolve(ok(null));
          return;
        }
        
        resolve(ok(valid.value));
      });
    });
  };

  // Update a thing
  const update = async (
    id: string,
    updates: Partial<Omit<T, 'id' | 'createdAt' | 'soul' | 'version'>>,
  ): Promise<Result<T | null, Err.AppError>> => {
    const result = await get(id);
    
    if (result.isErr()) {
      return result;
    }
    
    const thing = result.value;
    if (!thing) {
      return ok(null);
    }

    const updated = {
      ...thing,
      ...updates,
      updatedAt: Date.now(),
      version: (thing.version || 0) + 1,
    };

    const valid = check<T>(schema, updated);
    if (valid.isErr()) {
      return valid;
    }
    
    return save(valid.value);
  };

  // Delete a thing
  const remove = (id: string): Promise<Result<boolean, Err.AppError>> => {
    return new Promise((resolve) => {
      gun.get(soul(prefix, id)).put(null, (ack) => {
        if (ack.err) {
          resolve(err(Err.db(ack.err)));
        } else {
          resolve(ok(true));
        }
      });
    });
  };

  // List all things
  const list = (): Promise<Result<T[], Err.AppError>> => {
    return new Promise((resolve) => {
      const items: T[] = [];

      gun
        .get(prefix)
        .map()
        .once((data: any) => {
          if (!data || !data.id) return;

          const valid = check<T>(schema, data);
          if (valid.isOk()) {
            items.push(valid.value);
          }
        });

      // Gun doesn't have a "done" callback, so use timeout
      setTimeout(() => resolve(ok(items)), 500);
    });
  };

  // Subscribe to a thing (real-time updates)
  const watch = (
    id: string,
    callback: (result: Result<T | null, Err.AppError>) => void,
  ): (() => void) => {
    const path = soul(prefix, id);

    gun.get(path).on((data) => {
      if (!data) {
        callback(ok(null));
        return;
      }

      const valid = check<T>(schema, data);
      if (valid.isOk()) {
        callback(ok(valid.value));
      } else {
        callback(err(valid.error));
      }
    });

    // Return unsubscribe function
    return () => gun.get(path).off();
  };

  // Return service functions
  return {
    create,
    get,
    update,
    remove,
    list,
    watch,
    soul: (id: string) => soul(prefix, id),
  };
};
