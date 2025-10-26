/**
 * Profile Utilities
 *
 * Robust profile management using Gun's natural API patterns.
 * Follows Gun best practices for user space data storage.
 */

import { useState, useEffect } from 'react';
import { z, Result } from '@ariob/core';
import type { IGunChainReference } from '@ariob/core';

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
 * const result = await saveProfile(g, {
 *   alias: 'alice',
 *   bio: 'Building decentralized apps',
 *   createdAt: Date.now(),
 *   updatedAt: Date.now()
 * });
 *
 * if (result.ok) {
 *   console.log('Profile saved successfully');
 * } else {
 *   console.error('Failed to save profile:', result.error);
 * }
 * ```
 */
export async function saveProfile(
  graph: IGunChainReference,
  data: Partial<UserProfile>
): Promise<Result<void, Error>> {
  'background only';

  return new Promise((resolve) => {
    console.log('>>>>> [Profile.saveProfile] ========== SAVING PROFILE ==========');
    console.log('>>>>> [Profile.saveProfile] Attempting to save profile...');

    const userRef = graph.user();

    if (!userRef || !userRef.is) {
      console.log('>>>>> [Profile.saveProfile] ❌ User not authenticated');
      console.log('>>>>> [Profile.saveProfile]   userRef exists:', !!userRef);
      console.log('>>>>> [Profile.saveProfile]   userRef.is exists:', !!(userRef && userRef.is));
      console.log('>>>>> [Profile.saveProfile] =============================================');
      resolve(Result.error(new Error('User not authenticated')));
      return;
    }

    console.log('>>>>> [Profile.saveProfile] ✓ User authenticated');
    console.log('>>>>> [Profile.saveProfile]   User pub:', userRef.is.pub ? userRef.is.pub.substring(0, 50) + '...' : 'N/A');
    console.log('>>>>> [Profile.saveProfile] ---------- PROFILE DATA ----------');
    console.log('>>>>> [Profile.saveProfile] Data object:', JSON.stringify(data));
    console.log('>>>>> [Profile.saveProfile] Field types:');

    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      console.log(`>>>>> [Profile.saveProfile]   ${key}: ${typeof value} = ${value}`);
    });

    try {
      console.log('>>>>> [Profile.saveProfile] ---------- WRITING TO GUN ----------');
      console.log('>>>>> [Profile.saveProfile] Calling userRef.get("profile").put(data)...');

      // Write data using Gun's natural API
      userRef.get('profile').put(data);

      // Gun writes are fire-and-forget with eventual consistency
      // The data is immediately written to localStorage and will sync to peers
      // We resolve immediately since Gun handles the rest
      console.log('>>>>> [Profile.saveProfile] ✓ put() call completed (fire-and-forget)');
      console.log('>>>>> [Profile.saveProfile] =============================================');
      resolve(Result.ok(undefined));
    } catch (err) {
      console.log('>>>>> [Profile.saveProfile] ❌ Exception during put():', err);
      console.log('>>>>> [Profile.saveProfile] =============================================');
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
  const [callbackCount, setCallbackCount] = useState(0);

  useEffect(() => {
    'background only';

    console.log('>>>>> [Profile.useProfile] ========== SUBSCRIBING TO PROFILE ==========');
    console.log('>>>>> [Profile.useProfile] Setting up profile subscription...');

    const userRef = graph.user();

    if (!userRef || !userRef.is) {
      console.log('>>>>> [Profile.useProfile] ❌ User not authenticated, cannot subscribe');
      console.log('>>>>> [Profile.useProfile]   userRef exists:', !!userRef);
      console.log('>>>>> [Profile.useProfile]   userRef.is exists:', !!(userRef && userRef.is));
      console.log('>>>>> [Profile.useProfile] =======================================================');
      setLoading(false);
      return;
    }

    const targetPub = userPub || userRef.is.pub;
    console.log('>>>>> [Profile.useProfile] ✓ User authenticated');
    console.log('>>>>> [Profile.useProfile]   Target pub:', targetPub ? targetPub.substring(0, 50) + '...' : 'N/A');
    console.log('>>>>> [Profile.useProfile]   Reading own profile:', !userPub);

    // Use Gun's natural API to read nested profile data
    const profileRef = userPub
      ? graph.get('~' + userPub).get('profile')
      : userRef.get('profile');

    console.log('>>>>> [Profile.useProfile] Setting up .on() listener...');
    let localCallbackCount = 0;

    // Subscribe to profile updates
    const subscription = profileRef.on((data: any) => {
      'background only';

      localCallbackCount++;
      setCallbackCount(localCallbackCount);

      console.log(`>>>>> [Profile.useProfile] ========== CALLBACK #${localCallbackCount} FIRED ==========`);
      console.log('>>>>> [Profile.useProfile] Raw data received:', data ? JSON.stringify(data).substring(0, 300) : 'null/undefined');
      console.log('>>>>> [Profile.useProfile] Data type:', typeof data);
      console.log('>>>>> [Profile.useProfile] Is object:', data && typeof data === 'object');

      if (data && typeof data === 'object') {
        console.log('>>>>> [Profile.useProfile] ---------- RAW FIELDS ----------');
        Object.keys(data).forEach(key => {
          const value = data[key];
          console.log(`>>>>> [Profile.useProfile]   ${key}: ${typeof value} = ${JSON.stringify(value)}`);
        });

        // Filter out Gun metadata (keys starting with '_')
        const filtered = Object.keys(data)
          .filter((key) => !key.startsWith('_'))
          .reduce((acc, key) => {
            acc[key] = data[key];
            return acc;
          }, {} as any);

        console.log('>>>>> [Profile.useProfile] ---------- FILTERED FIELDS ----------');
        console.log('>>>>> [Profile.useProfile] Filtered data:', JSON.stringify(filtered));
        console.log('>>>>> [Profile.useProfile] Filtered field count:', Object.keys(filtered).length);

        Object.keys(filtered).forEach(key => {
          const value = filtered[key];
          console.log(`>>>>> [Profile.useProfile]   ${key}: ${typeof value} = ${JSON.stringify(value)}`);
        });

        if (Object.keys(filtered).length > 0) {
          console.log('>>>>> [Profile.useProfile] ✓ Profile data valid, updating state');
          setProfile(filtered);
          setLoading(false);
        } else {
          console.log('>>>>> [Profile.useProfile] ⚠️  No fields after filtering (all metadata)');
        }
      } else {
        console.log('>>>>> [Profile.useProfile] ⚠️  Data is null, undefined, or not an object');
      }

      console.log('>>>>> [Profile.useProfile] =======================================================');
    });

    console.log('>>>>> [Profile.useProfile] ✓ Subscription set up, waiting for callbacks...');
    console.log('>>>>> [Profile.useProfile] =======================================================');

    // Initial load timeout
    const timeoutId = setTimeout(() => {
      'background only';
      console.log('>>>>> [Profile.useProfile] ⏱️  Timeout reached (2s)');
      console.log('>>>>> [Profile.useProfile]   Total callbacks received:', localCallbackCount);
      console.log('>>>>> [Profile.useProfile]   Current profile state:', profile ? JSON.stringify(profile) : 'null');
      console.log('>>>>> [Profile.useProfile] =======================================================');
      setLoading(false);
    }, 2000);

    return () => {
      console.log('>>>>> [Profile.useProfile] Cleaning up subscription');
      console.log('>>>>> [Profile.useProfile]   Total callbacks received:', localCallbackCount);
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
    callbackCount, // Expose for debugging
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
