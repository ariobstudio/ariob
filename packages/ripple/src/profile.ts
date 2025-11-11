/**
 * Profile Management
 *
 * User profile management primitives for Ripple social network.
 * Follows @ariob/core patterns for Gun.js data management.
 */

import { useEffect, useCallback, useState } from 'react';
import { z, Result, type IGunChainReference, createStore, useStore } from '@ariob/core';

/**
 * User profile schema
 */
export const ProfileSchema = z.object({
  alias: z.string(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type UserProfile = z.infer<typeof ProfileSchema>;

/**
 * Profile store for reactive state management
 */
interface ProfileStore {
  profiles: Map<string, UserProfile>;
  loading: Map<string, boolean>;
  errors: Map<string, Error | null>;
}

const profileStore = createStore<ProfileStore>({
  profiles: new Map(),
  loading: new Map(),
  errors: new Map(),
});

/**
 * Save profile data to user graph
 *
 * Uses Gun's natural API: user.get('profile').put(data)
 * Gun handles nested objects automatically and stores each property separately.
 *
 * @param graph - Gun graph instance
 * @param data - Profile data to save
 * @returns Result indicating success or error
 *
 * @example
 * ```typescript
 * const g = graph();
 * const result = await profile.save(g, {
 *   alias: 'alice',
 *   bio: 'Building decentralized apps',
 *   createdAt: Date.now(),
 *   updatedAt: Date.now()
 * });
 *
 * if (result.ok) {
 *   console.log('Profile saved successfully');
 * }
 * ```
 */
export async function saveProfile(
  graph: IGunChainReference,
  data: Partial<UserProfile>
): Promise<Result<void, Error>> {
  'background only';

  return new Promise((resolve) => {
    const userRef = graph.user();

    if (!userRef || !userRef.is) {
      resolve(Result.error(new Error('User not authenticated')));
      return;
    }

    try {
      // Write data using Gun's natural API
      userRef.get('profile').put(data);

      // Gun writes are fire-and-forget with eventual consistency
      resolve(Result.ok(undefined));
    } catch (err) {
      resolve(Result.error(err instanceof Error ? err : new Error(String(err))));
    }
  });
}

/**
 * Hook to read profile data from user graph
 *
 * Reads profile data using Gun's natural API with real-time subscriptions.
 * Automatically subscribes to updates and re-renders when profile data changes.
 *
 * @param graph - Gun graph instance
 * @param userPub - Optional public key to read another user's profile (defaults to current user)
 * @returns Profile data and loading state
 *
 * @example
 * ```typescript
 * function MyProfile() {
 *   const g = graph();
 *   const { profile, loading } = useProfile(g);
 *
 *   if (loading) return <text>Loading...</text>;
 *   if (!profile) return <text>No profile found</text>;
 *
 *   return (
 *     <view>
 *       <text>{profile.alias}</text>
 *       <text>{profile.bio}</text>
 *     </view>
 *   );
 * }
 * ```
 */
export function useProfile(graph: IGunChainReference, userPub?: string) {
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    'background only';

    const userRef = graph.user();

    if (!userRef || !userRef.is) {
      setLoading(false);
      return;
    }

    const targetPub = userPub || userRef.is.pub;

    // Use Gun's natural API to read nested profile data
    const profileRef = userPub
      ? graph.get('~' + userPub).get('profile')
      : userRef.get('profile');

    // Subscribe to profile updates
    const subscription = profileRef.on((data: any) => {
      'background only';

      if (data && typeof data === 'object') {
        // Filter out Gun metadata (keys starting with '_')
        const filtered = Object.keys(data)
          .filter((key) => !key.startsWith('_'))
          .reduce((acc, key) => {
            acc[key] = data[key];
            return acc;
          }, {} as any);

        if (Object.keys(filtered).length > 0) {
          setProfile(filtered);
          setLoading(false);
        }
      }
    });

    // Initial load timeout
    const timeoutId = setTimeout(() => {
      'background only';
      setLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      // Clean up subscription
      if (subscription && subscription.off) {
        subscription.off();
      }
    };
  }, [graph, userPub]);

  return {
    profile,
    loading,
  };
}

/**
 * Get profile data once (non-reactive)
 *
 * Fetches profile data once without subscribing to updates. Useful for
 * one-time reads where you don't need live updates.
 *
 * @param graph - Gun graph instance
 * @param userPub - Optional public key to read another user's profile
 * @returns Promise resolving to profile data or null
 *
 * @example
 * ```typescript
 * const g = graph();
 * const profile = await getProfile(g);
 * if (profile) {
 *   console.log('User alias:', profile.alias);
 * }
 * ```
 */
export async function getProfile(
  graph: IGunChainReference,
  userPub?: string
): Promise<UserProfile | null> {
  'background only';

  return new Promise((resolve) => {
    const userRef = graph.user();

    if (!userRef || !userRef.is) {
      resolve(null);
      return;
    }

    const profileRef = userPub
      ? graph.get('~' + userPub).get('profile')
      : userRef.get('profile');

    profileRef.once((data: any) => {
      'background only';

      if (data && typeof data === 'object') {
        // Filter out Gun metadata
        const filtered = Object.keys(data)
          .filter((key) => !key.startsWith('_'))
          .reduce((acc, key) => {
            acc[key] = data[key];
            return acc;
          }, {} as any);

        resolve(Object.keys(filtered).length > 0 ? (filtered as UserProfile) : null);
      } else {
        resolve(null);
      }
    });

    // Timeout after 2 seconds
    setTimeout(() => {
      'background only';
      resolve(null);
    }, 2000);
  });
}

/**
 * Update specific profile fields
 *
 * Convenience function to update only specific fields.
 * Loads current profile, merges updates, and saves back.
 *
 * @param graph - Gun graph instance
 * @param updates - Fields to update
 * @returns Result indicating success or error
 *
 * @example
 * ```typescript
 * const g = graph();
 * await updateProfile(g, {
 *   bio: 'Updated bio',
 *   updatedAt: Date.now()
 * });
 * ```
 */
export async function updateProfile(
  graph: IGunChainReference,
  updates: Partial<UserProfile>
): Promise<Result<void, Error>> {
  'background only';

  // Add updatedAt timestamp if not provided
  const dataWithTimestamp = {
    ...updates,
    updatedAt: updates.updatedAt || Date.now(),
  };

  return saveProfile(graph, dataWithTimestamp);
}

/**
 * Delete profile (set all fields to null)
 *
 * In Gun, deletion is done by setting values to null.
 * This removes the profile data while keeping the node structure.
 *
 * @param graph - Gun graph instance
 * @returns Result indicating success or error
 *
 * @example
 * ```typescript
 * const g = graph();
 * await deleteProfile(g);
 * ```
 */
export async function deleteProfile(
  graph: IGunChainReference
): Promise<Result<void, Error>> {
  'background only';

  return new Promise((resolve) => {
    const userRef = graph.user();

    if (!userRef || !userRef.is) {
      resolve(Result.error(new Error('User not authenticated')));
      return;
    }

    try {
      // Set all fields to null to delete them
      const nullProfile: any = {
        alias: null,
        bio: null,
        avatar: null,
        location: null,
        website: null,
        createdAt: null,
        updatedAt: null,
      };

      userRef.get('profile').put(nullProfile, (ack: any) => {
        'background only';

        if (ack.err) {
          resolve(Result.error(new Error(ack.err)));
        } else {
          resolve(Result.ok(undefined));
        }
      });
    } catch (err) {
      resolve(Result.error(err instanceof Error ? err : new Error(String(err))));
    }
  });
}

/**
 * Profile API - Imperative profile management
 *
 * @example
 * ```typescript
 * import { profile, graph } from '@ariob/ripple';
 *
 * const g = graph();
 *
 * // Save profile
 * await profile.save(g, {
 *   alias: 'Alice',
 *   bio: 'Building decentralized apps',
 *   createdAt: Date.now(),
 *   updatedAt: Date.now()
 * });
 *
 * // Get profile once
 * const data = await profile.get(g);
 *
 * // Update profile
 * await profile.update(g, { bio: 'New bio' });
 *
 * // Delete profile
 * await profile.delete(g);
 * ```
 */
export const profile = {
  save: saveProfile,
  get: getProfile,
  update: updateProfile,
  delete: deleteProfile,
};
