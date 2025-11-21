/**
 * Relationships Store
 *
 * Manages the user's social graph: friends, followers, and degree calculations.
 * Follows Gun's graph structure for P2P relationship syncing.
 */

import { useEffect, useCallback } from 'react';
import { define, Result, z, type IGunChainReference, type User } from '@ariob/core';

/**
 * Friend metadata schema
 */
const FriendSchema = z.object({
  pub: z.string(),
  alias: z.string().optional(),
  addedAt: z.number(),
  degree: z.enum(['1', '2']),
});

export type Friend = z.infer<typeof FriendSchema>;

/**
 * Relationships store state
 */
interface RelationshipsStore {
  /** Map of public key to friend data */
  friends: Record<string, Friend>;
  /** Whether data is loading */
  loading: boolean;
  /** Error if any */
  error: Error | null;
  /** Active subscription cleanup */
  cleanup: (() => void) | null;
}

/**
 * Create relationships store
 */
function createRelationshipsStore() {

  const relationshipsStore = define({
    friends: {},
    loading: false,
    error: null,
    cleanup: null,
  } as RelationshipsStore);

  return {
    getState: relationshipsStore.getState,
    setState: relationshipsStore.setState,
    subscribe: relationshipsStore.subscribe,

    /**
     * Subscribe to user's friends list
     */
    subscribeFriends: (userRef: IGunChainReference) => {

      const state = relationshipsStore.getState();

      // Cleanup existing subscription
      if (state.cleanup) state.cleanup();

      // Set loading
      relationshipsStore.setState({ loading: true, error: null });

      console.log('[Relationships] Subscribing to friends...');

      // Subscribe to friends set
      userRef
        .get('friends')
        .map()
        .on((raw: any, pub: string) => {

          try {
            // Handle friend removal
            if (raw === null || raw === undefined) {
              const currentState = relationshipsStore.getState();
              const { [pub]: _, ...remaining } = currentState.friends;
              relationshipsStore.setState({ friends: remaining, loading: false });
              return;
            }

            // Clean Gun metadata
            const clean: any = {};
            for (const prop in raw) {
              if (!prop.startsWith('_')) {
                clean[prop] = raw[prop];
              }
            }

            // Ensure degree field exists (default to '1' for first-degree friends)
            if (!clean.degree) {
              clean.degree = '1';
            }

            // Validate schema
            const result = Result.parse(FriendSchema, clean);
            if (!result.ok) {
              console.error('[Relationships] Invalid friend data:', result.error);
              return;
            }

            // Update store
            const currentState = relationshipsStore.getState();
            relationshipsStore.setState({
              friends: {
                ...currentState.friends,
                [pub]: result.value,
              },
              loading: false,
              error: null,
            });

            console.log('[Relationships] Friend updated:', pub, result.value.alias);
          } catch (err) {
            console.error('[Relationships] Error processing friend:', err);
            relationshipsStore.setState({
              loading: false,
              error: err instanceof Error ? err : new Error(String(err)),
            });
          }
        });

      // Store cleanup
      const cleanup = () => {
        console.log('[Relationships] Cleanup');
        // Gun doesn't provide .off() for .map(), so we just clear state
        relationshipsStore.setState({ friends: {}, loading: false, error: null });
      };

      relationshipsStore.setState({ cleanup });
    },

    /**
     * Unsubscribe from friends list
     */
    off: () => {
      const state = relationshipsStore.getState();
      if (state.cleanup) {
        state.cleanup();
        relationshipsStore.setState({ cleanup: null });
      }
    },

    /**
     * Add a friend
     */
    addFriend: async (userRef: IGunChainReference, friendPub: string, alias?: string) => {

      try {
        const friend: Friend = {
          pub: friendPub,
          alias,
          addedAt: Date.now(),
          degree: '1',
        };

        // Validate
        const result = Result.parse(FriendSchema, friend);
        if (!result.ok) {
          return Result.error(new Error(`Invalid friend data: ${result.error.message}`));
        }

        // Add to Gun
        await new Promise<void>((resolve, reject) => {
          userRef.get('friends').get(friendPub).put(friend as any, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err));
            } else {
              resolve();
            }
          });
        });

        console.log('[Relationships] Friend added:', friendPub);
        return Result.ok(undefined);
      } catch (err) {
        console.error('[Relationships] Error adding friend:', err);
        return Result.error(err instanceof Error ? err : new Error(String(err)));
      }
    },

    /**
     * Remove a friend
     */
    removeFriend: async (userRef: IGunChainReference, friendPub: string) => {

      try {
        // Remove from Gun by setting to null
        await new Promise<void>((resolve, reject) => {
          userRef.get('friends').get(friendPub).put(null, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err));
            } else {
              resolve();
            }
          });
        });

        console.log('[Relationships] Friend removed:', friendPub);
        return Result.ok(undefined);
      } catch (err) {
        console.error('[Relationships] Error removing friend:', err);
        return Result.error(err instanceof Error ? err : new Error(String(err)));
      }
    },

    /**
     * Get all friends
     */
    getFriends: (): Friend[] => {
      const state = relationshipsStore.getState();
      return Object.values(state.friends);
    },

    /**
     * Get friend by public key
     */
    getFriend: (pub: string): Friend | null => {
      const state = relationshipsStore.getState();
      return state.friends[pub] ?? null;
    },

    /**
     * Calculate degree of separation for a public key
     */
    getDegree: (pub: string, currentUserPub?: string): 0 | 1 | 2 | null => {
      // Degree 0: It's the current user
      if (currentUserPub && pub === currentUserPub) {
        return 0;
      }

      // Degree 1: Direct friend
      const state = relationshipsStore.getState();
      const friend = state.friends[pub];
      if (friend && friend.degree === '1') {
        return 1;
      }

      // Degree 2: Friend of friend
      if (friend && friend.degree === '2') {
        return 2;
      }

      // Not in network
      return null;
    },

    /**
     * Check if user is a friend
     */
    isFriend: (pub: string): boolean => {
      const state = relationshipsStore.getState();
      return pub in state.friends;
    },

    /**
     * Get loading state
     */
    loading: (): boolean => {
      return relationshipsStore.getState().loading;
    },

    /**
     * Get error state
     */
    error: (): Error | null => {
      return relationshipsStore.getState().error;
    },
  };
}

/**
 * Default relationships store
 */
const useRelationshipsStore = createRelationshipsStore();

/**
 * Relationships API - Simple interface for managing social graph
 *
 * @example
 * ```typescript
 * import { relationships, graph, useAuth } from '@ariob/core';
 *
 * const g = graph();
 * const { user } = useAuth(g);
 *
 * // Subscribe to friends
 * relationships().subscribe(g.user());
 *
 * // In component
 * const friends = relationships().getFriends();
 * const isMyFriend = relationships().isFriend('some-pub-key');
 * const degree = relationships().getDegree('some-pub-key', user?.pub);
 *
 * // Add friend
 * await relationships().addFriend(g.user(), 'friend-pub-key', 'Friend Alias');
 *
 * // Remove friend
 * await relationships().removeFriend(g.user(), 'friend-pub-key');
 *
 * // Unsubscribe
 * relationships().off();
 * ```
 */
export function relationships() {

  const store = useRelationshipsStore;

  return {
    /**
     * Subscribe to user's friends list
     */
    subscribe: (userRef: IGunChainReference) => {
      store.subscribeFriends(userRef);
    },

    /**
     * Unsubscribe
     */
    off: () => {
      store.off();
    },

    /**
     * Add a friend
     */
    addFriend: async (userRef: IGunChainReference, friendPub: string, alias?: string): Promise<Result<void, Error>> => {
      return store.addFriend(userRef, friendPub, alias);
    },

    /**
     * Remove a friend
     */
    removeFriend: async (userRef: IGunChainReference, friendPub: string): Promise<Result<void, Error>> => {
      return store.removeFriend(userRef, friendPub);
    },

    /**
     * Get all friends
     */
    getFriends: (): Friend[] => {
      return store.getFriends();
    },

    /**
     * Get friend by public key
     */
    getFriend: (pub: string): Friend | null => {
      return store.getFriend(pub);
    },

    /**
     * Calculate degree of separation
     */
    getDegree: (pub: string, currentUserPub?: string): 0 | 1 | 2 | null => {
      return store.getDegree(pub, currentUserPub);
    },

    /**
     * Check if user is a friend
     */
    isFriend: (pub: string): boolean => {
      return store.isFriend(pub);
    },

    /**
     * Get loading state
     */
    loading: (): boolean => {
      return store.loading();
    },

    /**
     * Get error state
     */
    error: (): Error | null => {
      return store.error();
    },
  };
}

/**
 * Hook for using relationships in React components
 */
export function useRelationships() {

  // Use Zustand store with selectors
  const friends = useRelationshipsStore((s) => Object.values(s.friends));
  const loading = useRelationshipsStore((s) => s.loading);
  const error = useRelationshipsStore((s) => s.error);

  return {
    friends,
    loading,
    error,
    subscribe: (userRef: IGunChainReference) => relationships().subscribeFriends(userRef),
    off: () => relationships().off(),
    addFriend: (userRef: IGunChainReference, friendPub: string, alias?: string) =>
      relationships().addFriend(userRef, friendPub, alias),
    removeFriend: (userRef: IGunChainReference, friendPub: string) =>
      relationships().removeFriend(userRef, friendPub),
    getFriend: (pub: string) => relationships().getFriend(pub),
    getDegree: (pub: string, currentUserPub?: string) => relationships().getDegree(pub, currentUserPub),
    isFriend: (pub: string) => relationships().isFriend(pub),
  };
}

// Export store for advanced use
export { useRelationshipsStore, createRelationshipsStore };
export type { RelationshipsStore };
