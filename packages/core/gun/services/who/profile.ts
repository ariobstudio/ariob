import type { Result } from 'neverthrow';
import { ok, err } from 'neverthrow';
import type { GunInstance } from '../../core/types';
import type { Who, ProfileUpdate } from '../../schema/who.schema';
import { WhoSchema } from '../../schema/who.schema';
import type { AppError } from '../../schema/errors';
import * as Err from '../../schema/errors';

/**
 * Profile manager interface
 * Handles profile creation, updates, and retrieval
 * Following UNIX philosophy: one-word verbs
 */
export interface ProfileManager {
  /**
   * Create a new profile
   * @param alias - User alias/username
   * @param pub - Public key
   * @returns Result with created profile
   */
  create(alias: string, pub: string): Promise<Result<Who, AppError>>;

  /**
   * Update an existing profile
   * @param pub - Public key
   * @param updates - Profile updates
   * @returns Result with updated profile
   */
  update(pub: string, updates: ProfileUpdate): Promise<Result<Who, AppError>>;

  /**
   * Get a profile by public key
   * @param pub - Public key
   * @returns Result with profile or null if not found
   */
  get(pub: string): Promise<Result<Who | null, AppError>>;
}

/**
 * Create a profile manager
 * Handles profile CRUD operations in Gun
 * Following UNIX philosophy: one-word noun
 *
 * @example
 * ```typescript
 * import { profile } from '@ariob/core';
 * import { gun } from '@ariob/core';
 *
 * const profileManager = profile(gun);
 *
 * // Create profile
 * const result = await profileManager.create('alice', 'public-key-123');
 *
 * // Get profile
 * const whoResult = await profileManager.get('public-key-123');
 *
 * // Update profile
 * await profileManager.update('public-key-123', {
 *   displayName: 'Alice Smith',
 *   avatar: 'https://example.com/avatar.jpg'
 * });
 * ```
 *
 * @param gun - Gun instance
 * @returns Profile manager
 */
export const profile = (gun: GunInstance): ProfileManager => {
  return {
    create: async (alias: string, pub: string): Promise<Result<Who, AppError>> => {
      const now = Date.now();
      const profileData: Who = {
        id: pub,
        schema: 'who',
        soul: `who/${pub}`,
        createdAt: now,
        updatedAt: now,
        alias,
        pub,
        public: true,
      };

      // Validate profile data
      const validated = WhoSchema.safeParse(profileData);
      if (!validated.success) {
        return err(Err.validate('Invalid profile data', validated.error));
      }

      return new Promise((resolve) => {
        gun.get(profileData.soul).put(profileData, (ack: any) => {
          if (ack.err) {
            resolve(err(Err.db('Failed to save profile', ack.err)));
          } else {
            resolve(ok(profileData));
          }
        });
      });
    },

    update: async (pub: string, updates: ProfileUpdate): Promise<Result<Who, AppError>> => {
      const soul = `who/${pub}`;

      // First, get the existing profile
      return new Promise((resolve) => {
        gun.get(soul).once(async (data: any) => {
          if (!data) {
            resolve(err(Err.notFound('Profile not found')));
            return;
          }

          // Validate existing profile
          const existingResult = WhoSchema.safeParse(data);
          if (!existingResult.success) {
            resolve(err(Err.validate('Invalid existing profile data', existingResult.error)));
            return;
          }

          const existing = existingResult.data;

          // Merge updates
          const updated: Who = {
            ...existing,
            ...updates,
            updatedAt: Date.now(),
          };

          // Validate updated profile
          const validatedResult = WhoSchema.safeParse(updated);
          if (!validatedResult.success) {
            resolve(err(Err.validate('Invalid updated profile data', validatedResult.error)));
            return;
          }

          // Save updated profile
          gun.get(soul).put(updated, (ack: any) => {
            if (ack.err) {
              resolve(err(Err.db('Failed to update profile', ack.err)));
            } else {
              resolve(ok(updated));
            }
          });
        });
      });
    },

    get: async (pub: string): Promise<Result<Who | null, AppError>> => {
      const soul = `who/${pub}`;

      return new Promise((resolve) => {
        gun.get(soul).once((data: any) => {
          if (!data) {
            resolve(ok(null));
            return;
          }

          // Validate profile data
          const validated = WhoSchema.safeParse(data);
          if (!validated.success) {
            resolve(err(Err.validate('Invalid profile data', validated.error)));
            return;
          }

          resolve(ok(validated.data));
        });
      });
    },
  };
};
