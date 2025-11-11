/**
 * Auth - Authentication Store & Hook
 *
 * Unified authentication management with Gun user system.
 * Flow: alias → keypair → authenticate → persist
 */

import { useCallback, useEffect, useState } from 'react';
import type { IGunChainReference, KeyPair } from './graph';
import { Result } from './result';
import { pair as generatePair } from './crypto';
import { createStore, useStoreSelector } from './utils/createStore';

/**
 * User info
 */
export interface User {
  pub: string;
  epub: string;
  alias: string;
}

/**
 * Auth store state
 */
interface AuthState {
  /** Current authenticated user */
  user: User | null;
  /** User's cryptographic keys */
  keys: KeyPair | null;
  /** Whether user is logged in */
  isLoggedIn: boolean;
}

const STORAGE_KEY = 'auth-store';

/**
 * Load persisted state from localStorage
 */
function loadPersistedState(): AuthState {
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      const stored = globalThis.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          user: parsed.user || null,
          keys: parsed.keys || null,
          isLoggedIn: !!parsed.user,
        };
      }
    }
  } catch (err) {
    console.error('[Auth] Failed to load persisted state:', err);
  }

  return {
    user: null,
    keys: null,
    isLoggedIn: false,
  };
}

/**
 * Save state to localStorage
 */
function persistState(state: AuthState) {
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: state.user,
          keys: state.keys,
        })
      );
    }
  } catch (err) {
    console.error('[Auth] Failed to persist state:', err);
  }
}

/**
 * Default empty state for initial render
 */
const defaultState: AuthState = {
  user: null,
  keys: null,
  isLoggedIn: false,
};

/**
 * Auth store with localStorage persistence
 * Initialize with empty state, will be loaded on first access
 */
const authStore = createStore<AuthState>(defaultState);

/**
 * Flag to track if store has been initialized
 */
let storeInitialized = false;

/**
 * Lazy initialize store with persisted state
 */
function ensureStoreInitialized() {
  if (storeInitialized) return;
  storeInitialized = true;

  // Load persisted state
  const persistedState = loadPersistedState();
  console.log('[Auth] Store initialized with persisted state:', !!persistedState.user);

  // Set initial state if we have persisted data
  if (persistedState.user) {
    authStore.setState(persistedState);
  }

  // Subscribe to changes and persist
  authStore.subscribe(() => {
    persistState(authStore.getState());
  });
}

/**
 * Auth store actions
 */
const authActions = {
  setUser: (user: User | null) => {
    const current = authStore.getState().user;

    // Deduplicate - only update if values actually changed
    if (current?.pub === user?.pub && current?.alias === user?.alias) {
      return;
    }

    authStore.setState({
      user,
      isLoggedIn: user !== null,
    });
    persistState(authStore.getState());
  },

  setKeys: (keys: KeyPair | null) => {
    authStore.setState({ keys });
    persistState(authStore.getState());
  },

  reset: () => {
    authStore.setState({
      user: null,
      keys: null,
      isLoggedIn: false,
    });
    persistState(authStore.getState());
  },
};

/**
 * Auth result
 */
export type AuthResult = Result<User, Error>;

/**
 * Create account with alias (generates keypair automatically)
 *
 * @param alias - Username/alias for the account
 * @param graph - Gun graph instance
 * @returns Result containing user info or error
 *
 * @example
 * ```typescript
 * const result = await createAccount('alice', graph());
 * if (result.ok) {
 *   console.log('Account created:', result.value);
 * }
 * ```
 */
export async function createAccount(alias: string, graph: IGunChainReference): Promise<AuthResult> {
  return new Promise(async (resolve) => {
    console.log('[Auth] Creating account for alias:', alias);

    if (!graph.user) {
      resolve(Result.error(new Error('Gun user() not available')));
      return;
    }

    try {
      // Generate keypair
      console.log('[Auth] Generating keypair...');
      const pairResult = await generatePair();
      if (!pairResult.ok) {
        resolve(Result.error(pairResult.error));
        return;
      }

      const keys = pairResult.value;
      console.log('[Auth] Keypair generated, pub:', keys.pub);

      // For pre-generated keypairs, we use auth() which handles both new and existing users
      // GUN will implicitly create the user on first write to user space
      const userRef = graph.user();
      console.log('[Auth] Authenticating with generated keypair...');

      userRef.auth(keys, async (ack: any) => {
        if (ack.err) {
          console.error('[Auth] Authentication failed:', ack.err);
          resolve(Result.error(new Error(ack.err)));
          return;
        }

        console.log('[Auth] ✓ Authenticated with keypair');

        // Update Gun user data with alias and profile
        if (userRef.is) {
          // CRITICAL: Wait for SEA keys to be loaded before resolving
          // This ensures subsequent profile writes will succeed
          const waitForSEA = () => {
            return new Promise<void>((resolveSEA) => {
              const checkSEA = () => {
                if ((userRef as any)._ && (userRef as any)._.sea) {
                  console.log('[Auth] ✓ SEA keys loaded');
                  resolveSEA();
                } else {
                  console.log('[Auth] Waiting for SEA keys...');
                  setTimeout(checkSEA, 100); // Poll every 100ms
                }
              };
              checkSEA();
            });
          };

          // Wait for SEA keys with timeout
          const seaTimeout = new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('SEA keys timeout')), 5000)
          );

          try {
            await Promise.race([waitForSEA(), seaTimeout]);
          } catch (err) {
            console.error('[Auth] SEA keys failed to load:', err);
            resolve(Result.error(new Error('Failed to initialize cryptographic keys')));
            return;
          }

          const user: User = {
            pub: userRef.is.pub,
            epub: userRef.is.epub,
            alias: alias,
          };

          // Save alias to Gun
          userRef.get('alias').put(alias);

          // Update store
          authActions.setUser(user);
          authActions.setKeys(keys);

          console.log('[Auth] ✓ Account created successfully with SEA keys ready');
          resolve(Result.ok(user));
        } else {
          resolve(Result.error(new Error('Authentication succeeded but user info not available')));
        }
      }); // Close auth callback
    } catch (err) {
      console.error('[Auth] Error creating account:', err);
      resolve(Result.error(err instanceof Error ? err : new Error(String(err))));
    }
  });
}

/**
 * Login with existing keypair
 *
 * @param keys - Cryptographic keypair
 * @param graph - Gun graph instance
 * @returns Result containing user info or error
 *
 * @example
 * ```typescript
 * const result = await login(savedKeys, graph());
 * if (result.ok) {
 *   console.log('Logged in:', result.value);
 * }
 * ```
 */
export async function login(keys: KeyPair, graph: IGunChainReference): Promise<AuthResult> {
  return new Promise((resolve) => {
    console.log('[Auth] Logging in with keypair, pub:', keys.pub);

    if (!graph.user) {
      resolve(Result.error(new Error('Gun user() not available')));
      return;
    }

    const userRef = graph.user();
    userRef.auth(keys, async (ack: any) => {
      if (ack.err) {
        console.error('[Auth] Login failed:', ack.err);
        resolve(Result.error(new Error(ack.err)));
        return;
      }

      console.log('[Auth] ✓ Login successful');

      if (userRef.is) {
        // CRITICAL: Wait for SEA keys to be loaded before resolving
        const waitForSEA = () => {
          return new Promise<void>((resolveSEA) => {
            const checkSEA = () => {
              if ((userRef as any)._ && (userRef as any)._.sea) {
                console.log('[Auth] ✓ SEA keys loaded');
                resolveSEA();
              } else {
                console.log('[Auth] Waiting for SEA keys...');
                setTimeout(checkSEA, 100); // Poll every 100ms
              }
            };
            checkSEA();
          });
        };

        // Wait for SEA keys with timeout
        const seaTimeout = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('SEA keys timeout')), 5000)
        );

        try {
          await Promise.race([waitForSEA(), seaTimeout]);
        } catch (err) {
          console.error('[Auth] SEA keys failed to load:', err);
          resolve(Result.error(new Error('Failed to initialize cryptographic keys')));
          return;
        }

        // Try to get alias from Gun with timeout
        let aliasResolved = false;

        // Set a timeout in case alias never loads
        const timeoutId = setTimeout(() => {
          if (!aliasResolved) {
            aliasResolved = true;
            console.log('[Auth] ⚠ Alias load timeout, using pub as fallback');

            const user: User = {
              pub: userRef.is!.pub,
              epub: userRef.is!.epub,
              alias: userRef.is!.pub, // fallback to pub
            };

            // Update store
            authActions.setUser(user);
            authActions.setKeys(keys);

            console.log('[Auth] ✓ User data loaded (timeout) with SEA keys ready');
            resolve(Result.ok(user));
          }
        }, 2000); // 2 second timeout

        userRef.get('alias').once((alias: string) => {
          if (!aliasResolved) {
            aliasResolved = true;
            clearTimeout(timeoutId);

            const user: User = {
              pub: userRef.is!.pub,
              epub: userRef.is!.epub,
              alias: alias || userRef.is!.pub, // fallback to pub if no alias
            };

            // Update store
            authActions.setUser(user);
            authActions.setKeys(keys);

            console.log('[Auth] ✓ User data loaded with SEA keys ready');
            resolve(Result.ok(user));
          }
        });
      } else {
        resolve(Result.error(new Error('Login succeeded but user info not available')));
      }
    });
  });
}

/**
 * Logout current user
 *
 * @param graph - Gun graph instance
 *
 * @example
 * ```typescript
 * logout(graph());
 * ```
 */
export function logout(graph: IGunChainReference): void {
  console.log('[Auth] Logging out');

  if (graph.user) {
    const userRef = graph.user();
    userRef.leave();
  }

  authActions.reset();
  console.log('[Auth] ✓ Logged out');
}

/**
 * Recall session from localStorage
 *
 * @param graph - Gun graph instance
 * @returns Result containing user info or error
 *
 * @example
 * ```typescript
 * const result = await recall(graph());
 * if (result.ok) {
 *   console.log('Session recalled:', result.value);
 * }
 * ```
 */
export async function recall(graph: IGunChainReference): Promise<AuthResult> {
  console.log('[Auth] Attempting to recall session');

  const state = authStore.getState();

  if (!state.keys || !state.user) {
    return Result.error(new Error('No session to recall'));
  }

  // Re-authenticate with Gun using stored keys
  return new Promise((resolve) => {
    if (!graph.user) {
      resolve(Result.error(new Error('Gun user() not available')));
      return;
    }

    const userRef = graph.user();
    userRef.auth(state.keys!, async (ack: any) => {
      if (ack.err) {
        console.error('[Auth] Recall authentication failed:', ack.err);
        resolve(Result.error(new Error(ack.err)));
        return;
      }

      console.log('[Auth] ✓ Session recalled successfully');

      // CRITICAL: Wait for SEA keys to be loaded before resolving
      const waitForSEA = () => {
        return new Promise<void>((resolveSEA) => {
          const checkSEA = () => {
            if ((userRef as any)._ && (userRef as any)._.sea) {
              console.log('[Auth] ✓ SEA keys loaded');
              resolveSEA();
            } else {
              console.log('[Auth] Waiting for SEA keys...');
              setTimeout(checkSEA, 100); // Poll every 100ms
            }
          };
          checkSEA();
        });
      };

      // Wait for SEA keys with timeout
      const seaTimeout = new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('SEA keys timeout')), 5000)
      );

      try {
        await Promise.race([waitForSEA(), seaTimeout]);
      } catch (err) {
        console.error('[Auth] SEA keys failed to load:', err);
        resolve(Result.error(new Error('Failed to initialize cryptographic keys')));
        return;
      }

      // Use the stored user info instead of fetching from Gun
      // This ensures we keep the original alias
      console.log('[Auth] ✓ Session recalled with SEA keys ready');
      resolve(Result.ok(state.user!));
    });
  });
}

/**
 * Hook for using auth in React components
 *
 * @param graph - Gun graph instance
 * @returns Auth functions and current state
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const g = graph();
 *   const { user, isLoggedIn, create, login, logout, recall } = useAuth(g);
 *
 *   const handleCreate = async () => {
 *     const result = await create('alice');
 *     if (result.ok) {
 *       console.log('Created:', result.value);
 *     }
 *   };
 *
 *   return (
 *     <view>
 *       {isLoggedIn ? (
 *         <text>Logged in as: {user?.alias}</text>
 *       ) : (
 *         <button onTap={handleCreate}>Create Account</button>
 *       )}
 *     </view>
 *   );
 * }
 * ```
 */
export function useAuth(graph: IGunChainReference) {
  // Ensure store is initialized with persisted state on first access
  useState(() => {
    ensureStoreInitialized();
  });

  const user = useStoreSelector(authStore, (s) => s.user);
  const keys = useStoreSelector(authStore, (s) => s.keys);
  const isLoggedIn = useStoreSelector(authStore, (s) => s.isLoggedIn);

  const create = useCallback(
    (alias: string) => createAccount(alias, graph),
    [graph]
  );

  const loginWithKeys = useCallback(
    (keys: KeyPair) => login(keys, graph),
    [graph]
  );

  const logoutUser = useCallback(() => logout(graph), [graph]);

  const recallSession = useCallback(() => recall(graph), [graph]);

  // Note: Gun .on('auth') event listener removed - auth state is managed
  // directly by createAccount() and login() functions to prevent re-render loops

  return {
    user,
    keys,
    isLoggedIn,
    create,
    login: loginWithKeys,
    logout: logoutUser,
    recall: recallSession,
  };
}

// Export store for advanced use
export { authStore };
