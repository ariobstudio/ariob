/**
 * Auth - Simple Authentication System
 *
 * - create(username) - Create account (generates keys + auth)
 * - auth(keys) - Login with keys
 * - leave() - Clear session
 * - recall() - Restore session from storage
 * - useAuth() - Reactive hook
 */

import type { KeyPair } from './graph';
import { graph } from './graph';
import { Result } from './result';
import { define } from './utils/store';
import { pair } from './crypto';
import { LocalStorage } from './localStorage';

// ============================================================================
// Types
// ============================================================================

const STORAGE_KEY = 'gun_auth_pair';

export interface User {
  pub: string;
  epub: string;
  alias: string;
}

export type AuthResult = Result<User, Error>;

// ============================================================================
// Store
// ============================================================================

export const authStore = define<{
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}>({
  user: null,
  isAuthenticated: false,
  loading: false,
});

// ============================================================================
// Internal Helpers
// ============================================================================

function setUser(user: User | null) {
  authStore.setState({ user, isAuthenticated: !!user, loading: false });
}

function setLoading(loading: boolean) {
  authStore.setState({ loading });
}

/** Promisify Gun auth callback */
function authWithKeys(keys: KeyPair): Promise<AuthResult> {
  return new Promise((resolve) => {
    graph().user().auth(keys, (ack: any) => {
      if (ack.err) {
        resolve(Result.error(new Error(ack.err)));
      } else {
        resolve(Result.ok({
          pub: keys.pub,
          epub: keys.epub,
          alias: 'unknown',
        }));
      }
    });
  });
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Create account with username
 */
export async function create(username: string): Promise<AuthResult> {
  if (authStore.getState().loading) {
    return Result.error(new Error('Auth in progress'));
  }

  setLoading(true);

  const pairResult = await pair();
  if (!pairResult.ok) {
    setLoading(false);
    return Result.error(new Error('Failed to generate keypair'));
  }

  const keys = pairResult.value;
  const authResult = await authWithKeys(keys);

  if (!authResult.ok) {
    setLoading(false);
    return authResult;
  }

  // Save keys and profile
  await LocalStorage.setItemAsync(STORAGE_KEY, JSON.stringify(keys));
  graph().user().get('profile').get('name').put(username as any);

  const user = { ...authResult.value, alias: username };
  setUser(user);

  return Result.ok(user);
}

/**
 * Authenticate with existing keys
 */
export async function auth(keys: KeyPair): Promise<AuthResult> {
  if (authStore.getState().loading) {
    return Result.error(new Error('Auth in progress'));
  }

  setLoading(true);

  const authResult = await authWithKeys(keys);

  if (!authResult.ok) {
    setLoading(false);
    return authResult;
  }

  await LocalStorage.setItemAsync(STORAGE_KEY, JSON.stringify(keys));
  setUser(authResult.value);

  // Fetch profile name in background
  graph().user().get('profile').get('name').once((name: any) => {
    if (typeof name === 'string') {
      setUser({ ...authResult.value, alias: name });
    }
  });

  return authResult;
}

/**
 * Logout and clear session
 */
export async function leave(): Promise<void> {
  graph().user().leave();
  await LocalStorage.removeItemAsync(STORAGE_KEY);
  setUser(null);
}

/**
 * Restore session from storage
 */
export async function recall(): Promise<AuthResult> {
  const stored = await LocalStorage.getItemAsync(STORAGE_KEY);
  if (!stored) {
    return Result.error(new Error('No stored session'));
  }

  try {
    const keys = JSON.parse(stored);
    return auth(keys);
  } catch {
    return Result.error(new Error('Invalid stored keys'));
  }
}

// ============================================================================
// React Hook
// ============================================================================

export function useAuth() {
  const user = authStore((s) => s.user);
  const isAuthenticated = authStore((s) => s.isAuthenticated);
  const loading = authStore((s) => s.loading);
  return { user, isAuthenticated, loading };
}
