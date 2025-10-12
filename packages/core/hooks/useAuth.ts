/**
 * useAuth Hook
 *
 * React hook for managing Gun user authentication.
 * Provides login, logout functionality and syncs with auth store.
 */

import { useCallback, useEffect } from 'react';
import type { IGunChainReference, KeyPair } from '../gun/graph';
import { useAuthStore } from '../store/auth';


/**
 * Authentication result returned by login/create operations
 */
export interface AuthResult {
  /** Whether the operation succeeded */
  ok: boolean;
  /** Error message if operation failed */
  err?: string;
  /** Public key of the authenticated user */
  pub?: string;
}

/**
 * Result object returned by useAuth hook
 */
export interface UseAuthResult {
  /** Login with alias and password */
  login: (alias: string, password: string) => Promise<AuthResult>;
  /** Login with existing key pair */
  loginWithKeys: (pair: KeyPair) => Promise<AuthResult>;
  /** Create new user account */
  create: (alias: string, password: string) => Promise<AuthResult>;
  /** Logout current user */
  logout: () => void;
  /** Current authenticated user info */
  user: { pub: string; epub: string; alias: string } | null;
  /** Whether a user is currently logged in */
  isLoggedIn: boolean;
  /** User's cryptographic key pair */
  keys: KeyPair | null;
}

/**
 * Hook for managing Gun user authentication.
 *
 * Provides functions for login, logout, and user creation while
 * synchronizing authentication state with the Zustand store.
 *
 * @param graph - Gun instance with user() method
 * @returns Object containing auth functions and current auth state
 *
 * @example
 * ```typescript
 * const graph = createGraph();
 * const { login, logout, create, user, isLoggedIn } = useAuth(graph);
 *
 * // Create new user
 * const result = await create('alice', 'password123');
 * if (result.ok) {
 *   console.log('User created:', result.pub);
 * }
 *
 * // Login
 * await login('alice', 'password123');
 *
 * // Logout
 * logout();
 *
 * // Login with existing keys
 * await loginWithKeys(savedKeys);
 * ```
 */
export function useAuth(graph: IGunChainReference): UseAuthResult {
  const { user, keys, isLoggedIn, setUser, setKeys, reset } = useAuthStore();

  /**
   * Creates a new user account with alias and password.
   */
  const create = useCallback(
    (alias: string, password: string): Promise<AuthResult> => {
      return new Promise((resolve) => {

        if (!graph.user) {
          resolve({ ok: false, err: 'Gun user() not available' });
          return;
        }

        const userRef = graph.user();

        userRef.create(alias, password, (ack: any) => {
          if (ack.err) {
            resolve({ ok: false, err: ack.err });
            return;
          }


          // Auto-login after creation
          userRef.auth(alias, password, (authAck: any) => {
            if (authAck.err) {
              resolve({ ok: true, pub: ack.pub, err: 'Created but login failed' });
              return;
            }

            // Update store with user info
            if (userRef.is) {
              setUser({
                pub: userRef.is.pub,
                epub: userRef.is.epub,
                alias: userRef.is.alias,
              });

              // Extract keys from Gun's internal state
              const gunKeys = (userRef as any)._.sea;
              if (gunKeys) {
                setKeys(gunKeys);
              }

            }

            resolve({ ok: true, pub: ack.pub });
          });
        });
      });
    },
    [graph, setUser, setKeys]
  );

  /**
   * Logs in with alias and password.
   */
  const login = useCallback(
    (alias: string, password: string): Promise<AuthResult> => {
      return new Promise((resolve) => {

        if (!graph.user) {
          resolve({ ok: false, err: 'Gun user() not available' });
          return;
        }

        const userRef = graph.user();

        userRef.auth(alias, password, (ack: any) => {
          if (ack.err) {
            resolve({ ok: false, err: ack.err });
            return;
          }

          // Update store with user info
          if (userRef.is) {
            setUser({
              pub: userRef.is.pub,
              epub: userRef.is.epub,
              alias: userRef.is.alias,
            });

            // Extract keys from Gun's internal state
            const gunKeys = (userRef as any)._.sea;
            if (gunKeys) {
              setKeys(gunKeys);
            }

            resolve({ ok: true, pub: userRef.is.pub });
          } else {
            resolve({ ok: false, err: 'Login succeeded but user info not available' });
          }
        });
      });
    },
    [graph, setUser, setKeys]
  );

  /**
   * Logs in with an existing key pair.
   */
  const loginWithKeys = useCallback(
    (pair: KeyPair): Promise<AuthResult> => {
      return new Promise((resolve) => {

        if (!graph.user) {
          resolve({ ok: false, err: 'Gun user() not available' });
          return;
        }

        const userRef = graph.user();

        userRef.auth(pair, (ack: any) => {
          if (ack.err) {
            resolve({ ok: false, err: ack.err });
            return;
          }

          // Update store with user info
          if (userRef.is) {
            setUser({
              pub: userRef.is.pub,
              epub: userRef.is.epub,
              alias: userRef.is.alias || pair.pub,
            });

            setKeys(pair);

            resolve({ ok: true, pub: userRef.is.pub });
          } else {
            resolve({ ok: false, err: 'Login succeeded but user info not available' });
          }
        });
      });
    },
    [graph, setUser, setKeys]
  );

  /**
   * Logs out the current user.
   */
  const logout = useCallback(() => {
    if (graph.user) {
      const userRef = graph.user();
      userRef.leave();
    }
    reset();
  }, [graph, reset]);

  // Listen for Gun's 'auth' event to sync state
  useEffect(() => {
    if (!graph.on) return;

    const handleAuth = (gunState: any) => {
      if (gunState && gunState.sea) {
        const userRef = graph.user();
        if (userRef && userRef.is) {
          setUser({
            pub: userRef.is.pub,
            epub: userRef.is.epub,
            alias: userRef.is.alias,
          });
          setKeys(gunState.sea);
        }
      }
    };

    // Gun's on method has different signatures - use type assertion
    (graph.on as any)('auth', handleAuth);

    // No cleanup needed as Gun doesn't provide off for global events
  }, [graph, setUser, setKeys]);

  return {
    login,
    loginWithKeys,
    create,
    logout,
    user,
    isLoggedIn,
    keys,
  };
}
