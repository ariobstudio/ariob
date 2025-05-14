import gun from '@/gun/core/gun';
import { AppError, createDatabaseError, handleZodError } from '@/gun/schema/errors';
import { Thing } from '@/gun/schema/thing.schema';
import { Result, ok, err, ResultAsync, fromPromise, okAsync, errAsync } from 'neverthrow';
import { z } from 'zod';

// Utility function to create a soul path
export const makeSoul = (prefix: string, id: string): string => {
  return `${prefix}/${id}`;
};

// Helper function to validate with Zod schema and handle errors
const validateSchema = <T>(schema: any, data: any): Result<T, AppError> => {
  try {
    return ok(schema.parse(data));
  } catch (error) {
    return err(handleZodError(error));
  }
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
  ): Promise<Result<T, AppError>> => {
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

    // Validate with schema and then save
    return validateSchema<T>(schema, thing)
      .asyncAndThen((validatedThing) => {
        // Save to Gun
        return fromPromise(
          new Promise<T>((resolve, reject) => {
            gun.get(validatedThing.soul).put(validatedThing, (ack) => {
              if (ack.err) {
                reject(createDatabaseError(ack.err));
              } else {
                resolve(validatedThing);
              }
            });
          }),
          handleZodError
        );
      });
  };

  // Get a thing by ID
  const get = async (id: string): Promise<Result<T | null, AppError>> => {
    return fromPromise(
      new Promise<T | null>((resolve, reject) => {
        gun.get(makeSoul(soulPrefix, id)).once((data) => {
          if (!data) {
            resolve(null);
            return;
          }

          const validationResult = validateSchema<T>(schema, data);
          if (validationResult.isOk()) {
            resolve(validationResult.value);
          } else {
            console.error('Invalid data retrieved:', validationResult.error);
            resolve(null);
          }
        });
      }),
      handleZodError
    );
  };

  // Update a thing
  const update = async (
    id: string,
    updates: Partial<Omit<T, 'id' | 'createdAt' | 'soul' | 'version'>>,
  ): Promise<Result<T | null, AppError>> => {
    const thingResult = await get(id);

    return thingResult.asyncAndThen((thing) => {
      if (!thing) {
        return okAsync<T | null, AppError>(null);
      }

      const updatedThing: T = {
        ...thing,
        ...updates,
        updatedAt: Date.now(),
        version: (thing.version || 0) + 1,
      };

      // Validate and save
      return validateSchema<T>(schema, updatedThing)
        .asyncAndThen((validatedThing) => {
          // Save to Gun
          return fromPromise(
            new Promise<T>((resolve, reject) => {
              gun.get(makeSoul(soulPrefix, id)).put(validatedThing, (ack) => {
                if (ack.err) {
                  reject(createDatabaseError(ack.err));
                } else {
                  resolve(validatedThing);
                }
              });
            }),
            handleZodError
          );
        });
    });
  };

  // Delete a thing
  const remove = async (id: string): Promise<Result<boolean, AppError>> => {
    return fromPromise(
      new Promise<boolean>((resolve, reject) => {
        gun.get(makeSoul(soulPrefix, id)).put(null, (ack) => {
          if (ack.err) {
            reject(createDatabaseError(ack.err));
          } else {
            resolve(true);
          }
        });
      }),
      handleZodError
    );
  };

  // List all things
  const list = async (): Promise<Result<T[], AppError>> => {
    return fromPromise(
      new Promise<T[]>((resolve, reject) => {
        const items: T[] = [];

        gun
          .get(soulPrefix)
          .map()
          .once((data: any, key: string) => {
            if (!data || !data.id) return;

            const validationResult = validateSchema<T>(schema, data);
            if (validationResult.isOk()) {
              items.push(validationResult.value);
            } else {
              console.error('Invalid data encountered:', validationResult.error);
            }
          });

        // Gun doesn't have a callback for "done", so we use a timeout
        setTimeout(() => resolve(items), 500);
      }),
      handleZodError
    );
  };

  // Subscribe to a thing (real-time updates)
  const subscribe = (
    id: string,
    callback: (result: Result<T | null, AppError>) => void,
  ): (() => void) => {
    const soul = makeSoul(soulPrefix, id);

    gun.get(soul).on((data) => {
      if (!data) {
        callback(ok(null));
        return;
      }

      const validationResult = validateSchema<T>(schema, data);
      validationResult.match(
        (validData) => callback(ok(validData)),
        (error) => {
          console.error('Invalid data in subscription:', error);
          callback(err(error));
        }
      );
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
