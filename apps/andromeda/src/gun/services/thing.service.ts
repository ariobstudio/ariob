import gun from '@/gun/core/gun';
import { Thing } from '@/gun/schema/thing.schema';
import { z } from 'zod';

// Utility function to create a soul path
export const makeSoul = (prefix: string, id: string): string => {
  return `${prefix}/${id}`;
};

// Thing service factory - returns a set of functions for working with a specific thing type
export const createThingService = <
  T extends Thing,
  TSchema extends z.ZodType<T>,
>(
  schema: TSchema,
  soulPrefix: string,
) => {
  // Create a new thing
  const create = async (
    data: Omit<T, 'id' | 'createdAt' | 'soul' | 'version'>,
  ): Promise<T> => {
    const id = crypto.randomUUID();
    const timestamp = Date.now();

    const thing: T = {
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      soul: makeSoul(soulPrefix, id),
      version: 1,
      ...data,
    } as unknown as T;

    // Validate with schema
    const validatedThing = schema.parse(thing);

    // Save to Gun
    return new Promise((resolve, reject) => {
      gun.get(validatedThing.soul).put(validatedThing, (ack) => {
        if (ack.err) {
          reject(new Error(ack.err));
        } else {
          resolve(validatedThing);
        }
      });
    });
  };

  // Get a thing by ID
  const get = async (id: string): Promise<T | null> => {
    return new Promise((resolve) => {
      gun.get(makeSoul(soulPrefix, id)).once((data) => {
        if (!data) {
          resolve(null);
          return;
        }

        try {
          // Validate data against schema
          const validatedThing = schema.parse(data);
          resolve(validatedThing);
        } catch (error) {
          console.error('Invalid data retrieved:', error);
          resolve(null);
        }
      });
    });
  };

  // Update a thing
  const update = async (
    id: string,
    updates: Partial<Omit<T, 'id' | 'createdAt' | 'soul' | 'version'>>,
  ): Promise<T | null> => {
    const thing = await get(id);

    if (!thing) {
      return null;
    }

    const updatedThing: T = {
      ...thing,
      ...updates,
      updatedAt: Date.now(),
      version: (thing.version || 0) + 1,
    };

    // Validate
    const validatedThing = schema.parse(updatedThing);

    // Save to Gun
    return new Promise((resolve, reject) => {
      gun.get(makeSoul(soulPrefix, id)).put(validatedThing, (ack) => {
        if (ack.err) {
          reject(new Error(ack.err));
        } else {
          resolve(validatedThing);
        }
      });
    });
  };

  // Delete a thing
  const remove = async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      gun.get(makeSoul(soulPrefix, id)).put(null, (ack) => {
        resolve(!ack.err);
      });
    });
  };

  // List all things
  const list = async (): Promise<T[]> => {
    return new Promise((resolve) => {
      const items: T[] = [];

      gun
        .get(soulPrefix)
        .map()
        .once((data: any, key: string) => {
          if (!data || !data.id) return;

          try {
            const validatedThing = schema.parse(data);
            items.push(validatedThing);
          } catch (error) {
            console.error('Invalid data encountered:', error);
          }
        });

      // Gun doesn't have a callback for "done", so we use a timeout
      setTimeout(() => resolve(items), 500);
    });
  };

  // Subscribe to a thing (real-time updates)
  const subscribe = (
    id: string,
    callback: (data: T | null) => void,
  ): (() => void) => {
    const soul = makeSoul(soulPrefix, id);

    gun.get(soul).on((data) => {
      if (!data) {
        callback(null);
        return;
      }

      try {
        const validatedThing = schema.parse(data);
        callback(validatedThing);
      } catch (error) {
        console.error('Invalid data in subscription:', error);
        callback(null);
      }
    });

    // Return unsubscribe function
    return () => gun.get(soul).off();
  };

  // Return service functions
  return {
    create,
    get,
    update,
    remove,
    list,
    subscribe,
    makeSoul: (id: string) => makeSoul(soulPrefix, id),
  };
};
