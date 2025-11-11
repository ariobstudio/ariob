/**
 * User Profile Management
 *
 * Manages user profile data (alias, avatar, etc.) in Gun user space.
 * Follows the same patterns as auth.ts for consistency.
 */

import { useCallback, useEffect } from 'react';
import type { IGunChainReference } from './graph';
import { useAuth, authStore } from './auth';
import { useNode } from './node';

/**
 * User profile data
 */
export interface UserProfile {
  alias?: string;
  avatar?: string;
  boardTheme?: 'indigo' | 'classic' | 'green' | 'blue' | 'purple' | 'gray';
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Hook for managing user profile data
 */
export function useUserProfile(graph: IGunChainReference) {
  const { user, isLoggedIn } = useAuth(graph);

  // Subscribe to user profile node
  const userPub = user?.pub;
  const profilePath = userPub ? `~${userPub}/profile` : null;

  const { data: profile, loading, error } = useNode<UserProfile>(profilePath || '', {
    graph,
    persist: true,
  });

  /**
   * Update user profile
   */
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    if (!isLoggedIn || !userPub) {
      console.warn('[UserProfile] Cannot update: not logged in');
      return;
    }

    const profileRef = graph.user().get('profile');

    const timestamp = Date.now();
    const data = {
      ...updates,
      updatedAt: timestamp,
    };

    // Set createdAt if this is first update
    if (!profile?.createdAt) {
      data.createdAt = timestamp;
    }

    profileRef.put(data, (ack: any) => {
      if (ack.err) {
        console.error('[UserProfile] Update failed:', ack.err);
      } else {
        console.log('[UserProfile] Updated:', updates);
      }
    });
  }, [graph, isLoggedIn, userPub, profile]);

  /**
   * Update alias (display name)
   */
  const updateAlias = useCallback((alias: string) => {
    updateProfile({ alias: alias.trim() });
  }, [updateProfile]);

  /**
   * Update board theme preference
   */
  const updateBoardTheme = useCallback((boardTheme: UserProfile['boardTheme']) => {
    updateProfile({ boardTheme });
  }, [updateProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateAlias,
    updateBoardTheme,
    isLoggedIn,
  };
}
