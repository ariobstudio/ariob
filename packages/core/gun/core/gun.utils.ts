import { Result, ok, err } from 'neverthrow';
import { z } from 'zod';
import * as Err from '../core/errors';

// Validate data with schema
export const check = <T>(schema: z.ZodType<T>, data: any): Result<T, Err.AppError> => {
  try {
    return ok(schema.parse(data));
  } catch (error) {
    return err(Err.fromZod(error));
  }
};

// Make soul path from prefix and id
export const soul = (prefix: string, id: string): string => `${prefix}/${id}`; 