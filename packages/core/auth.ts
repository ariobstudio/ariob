/**
 * Auth - Authentication System
 *
 * - create(username, password?) - Create account
 * - auth(usernameOrKeys, password?) - Smart authentication (detects keypair vs password)
 * - leave() - Clear session
 * - recall() - Restore session
 * - useAuth() - Reactive hook
 */

import type { KeyPair } from './graph';
import { graph as getGraph } from './graph';
import { Result } from './result';
import { define } from './utils/store';
import { pair as generatePair } from './crypto';

// ============================================================================
// Types
// ============================================================================

export interface User {
  pub: string;
  epub: string;
  alias: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type AuthResult = Result<User, Error>;

// ============================================================================
// Store
// ============================================================================

export const authStore = define<AuthState>({
  user: null,
  isAuthenticated: false,
});

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Extract user info from Gun user reference
 */
function getUserFromRef(userRef: any, alias?: string): User | null {
  if (!userRef.is) return null;

  return {
    pub: userRef.is.pub,
    epub: userRef.is.epub,
    alias: userRef.is.alias || alias || 'unknown',
  } as User;
}

/**
 * Update auth store with user data
 */
function setAuthenticated(user: User | null) {
  authStore.setState({
    user,
    isAuthenticated: !!user,
  });
}

/**
 * Check if value is a KeyPair object
 */
function isKeyPair(value: any): value is KeyPair {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.pub === 'string' &&
    typeof value.priv === 'string' &&
    typeof value.epub === 'string' &&
    typeof value.epriv === 'string'
  );
}

// ============================================================================
// Core API
// ============================================================================

/**
 * Create account with username and optional password
 *
 * @param username - Username/alias
 * @param password - Optional password (if omitted, generates keypair and uses key-based auth)
 * @returns Result with user info or error
 *
 * @example
 * ```ts
 * // Password-based account
 * const result = await create('alice', 'secret123');
 *
 * // Key-based account (generates keypair automatically)
 * const result = await create('alice');
 * ```
 */
export async function create(username: string, password?: string): Promise<AuthResult> {
  const graph = getGraph();

  if (!graph.user) {
    return Result.error(new Error('Gun user() not available'));
  }

  // If no password provided, generate keypair and use key-based auth
  if (!password) {
    const pairResult = await generatePair();
    if (!pairResult.ok) {
      console.error('[Auth] Failed to generate keypair:', pairResult.error);
      return Result.error(new Error('Failed to generate keypair: ' + pairResult.error?.message));
    }

    const keys = pairResult.value;

    // Create account with keypair
    return new Promise((resolve) => {
      const userRef = graph.user();

      userRef.create(keys, username, (ack: any) => {
        if (ack.err) {
          console.error('[Auth] Create failed:', ack.err);
          resolve(Result.error(new Error(ack.err)));
          return;
        }

        // Authenticate with the generated keys
        userRef.auth(keys, (authAck: any) => {
          if (authAck.err) {
            console.error('[Auth] Auto-auth after create failed:', authAck.err);
            resolve(Result.error(new Error(authAck.err)));
            return;
          }

          const user = getUserFromRef(userRef, username);
          if (!user) {
            resolve(Result.error(new Error('Failed to get user data after creation')));
            return;
          }

          setAuthenticated(user);
          console.log('[Auth] ✓ Account created with keypair:', user.alias);
          console.log('[Auth] ℹ️  Save your keys to login later:', keys);
          resolve(Result.ok(user));
        });
      });
    });
  }

  // Password-based account creation
  return new Promise((resolve) => {
    const userRef = graph.user();

    userRef.create(username, password, (ack: any) => {
      if (ack.err) {
        console.error('[Auth] Create failed:', ack.err);
        resolve(Result.error(new Error(ack.err)));
        return;
      }

      const user = getUserFromRef(userRef, username);
      if (!user) {
        resolve(Result.error(new Error('Failed to get user data after creation')));
        return;
      }

      setAuthenticated(user);
      console.log('[Auth] ✓ Account created:', user.alias);
      resolve(Result.ok(user));
    });
  });
}

/**
 * Smart authentication - detects keypair vs password automatically
 *
 * @param usernameOrKeys - Either username (string) or keypair (object)
 * @param password - Required password when using username (omit when using keypair)
 * @returns Result with user info or error
 *
 * @example
 * ```ts
 * // Password-based auth (password required!)
 * const result = await auth('alice', 'secret123');
 *
 * // Keypair-based auth
 * const keys = { pub, priv, epub, epriv };
 * const result = await auth(keys);
 * ```
 */
export async function auth(
  usernameOrKeys: string | KeyPair,
  password?: string
): Promise<AuthResult> {
  return new Promise((resolve) => {
    const graph = getGraph();

    if (!graph.user) {
      resolve(Result.error(new Error('Gun user() not available')));
      return;
    }

    const userRef = graph.user();

    // Detect authentication type
    if (isKeyPair(usernameOrKeys)) {
      // Keypair-based authentication
      userRef.auth(usernameOrKeys, (ack: any) => {
        if (ack.err) {
          console.error('[Auth] Key auth failed:', ack.err);
          resolve(Result.error(new Error(ack.err)));
          return;
        }

        const user = getUserFromRef(userRef);
        if (!user) {
          resolve(Result.error(new Error('Failed to get user data after key auth')));
          return;
        }

        setAuthenticated(user);
        console.log('[Auth] ✓ Authenticated with keys:', user.pub.substring(0, 20) + '...');
        resolve(Result.ok(user));
      });
    } else {
      // Username/password authentication
      const username = usernameOrKeys;

      // Security: Require password for username/password auth
      if (!password) {
        console.error('[Auth] Password required for username/password authentication');
        resolve(Result.error(new Error('Password required for username/password authentication')));
        return;
      }

      userRef.auth(username, password, (ack: any) => {
        if (ack.err) {
          console.error('[Auth] Login failed:', ack.err);
          resolve(Result.error(new Error(ack.err)));
          return;
        }

        const user = getUserFromRef(userRef, username);
        if (!user) {
          resolve(Result.error(new Error('Failed to get user data after login')));
          return;
        }

        setAuthenticated(user);
        console.log('[Auth] ✓ Logged in:', user.alias);
        resolve(Result.ok(user));
      });
    }
  });
}

/**
 * Leave (logout) current user
 * Following Gun's naming: gun.user().leave()
 *
 * @example
 * ```ts
 * leave();
 * console.log('Logged out');
 * ```
 */
export function leave(): void {
  const graph = getGraph();

  if (graph.user) {
    const userRef = graph.user();
    userRef.leave();
  }

  setAuthenticated(null);
  console.log('[Auth] ✓ Logged out');
}

/**
 * Restore session from Gun's session storage
 *
 * @returns Result with user info or error
 *
 * @example
 * ```ts
 * const result = await recall();
 * if (result.ok) {
 *   console.log('Session restored:', result.value.alias);
 * }
 * ```
 */
export async function recall(): Promise<AuthResult> {
  return new Promise((resolve) => {
    const graph = getGraph();

    if (!graph.user) {
      resolve(Result.error(new Error('Gun user() not available')));
      return;
    }

    const userRef = graph.user();

    userRef.recall({ sessionStorage: true }, (ack: any) => {
      if (ack.err) {
        resolve(Result.error(new Error('No session found')));
        return;
      }

      const user = getUserFromRef(userRef);
      if (!user) {
        resolve(Result.error(new Error('Failed to restore session')));
        return;
      }

      setAuthenticated(user);
      console.log('[Auth] ✓ Session restored:', user.alias);
      resolve(Result.ok(user));
    });
  });
}

// ============================================================================
// React Hook
// ============================================================================

/**
 * Reactive auth state hook
 *
 * @returns Current authentication state
 *
 * @example
 * ```tsx
 * function Profile() {
 *   const auth = useAuth();
 *
 *   if (!auth.isAuthenticated) {
 *     return <LoginForm />;
 *   }
 *
 *   return <div>Welcome {auth.user?.alias}!</div>;
 * }
 * ```
 */
export function useAuth() {
  const user = authStore((s) => s.user);
  const isAuthenticated = authStore((s) => s.isAuthenticated);

  return {
    user,
    isAuthenticated,
  };
}
