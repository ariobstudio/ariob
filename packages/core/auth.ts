/**
 * Auth - Authentication System
 *
 * - create(username) - Create account (generates keys + auth)
 * - auth(keys) - Login with keys
 * - leave() - Clear session
 * - recall() - Restore session from storage
 * - useAuth() - Reactive hook
 */

import type { KeyPair } from './graph';
import { graph as getGraph } from './graph';
import { Result } from './result';
import { define } from './utils/store';
import { pair as generatePair } from './crypto';
import { LocalStorage } from './localStorage';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'gun_auth_pair';

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
 * Global lock to prevent concurrent auth operations.
 */
let authLock = Promise.resolve();

async function withAuthLock<T>(operation: () => Promise<T>): Promise<T> {
  let releaseLock: () => void;
  const newLock = new Promise<void>((resolve) => { releaseLock = resolve; });
  const previousLock = authLock;
  authLock = newLock;
  try {
    await previousLock.catch(() => {});
    return await operation();
  } finally {
    releaseLock!();
  }
}

function getUserFromRef(userRef: any, alias?: string): User | null {
  if (!userRef.is) return null;
  return {
    pub: userRef.is.pub,
    epub: userRef.is.epub,
    alias: userRef.is.alias || alias || 'unknown',
  } as User;
}

function setAuthenticated(user: User | null) {
  authStore.setState({
    user,
    isAuthenticated: !!user,
  });
}

function isKeyPair(value: any): value is KeyPair {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.pub === 'string' &&
    typeof value.priv === 'string'
  );
}

/**
 * Internal login helper that handles:
 * 1. Gun auth
 * 2. Storage persistence
 * 3. Store update
 */
async function loginWithKeys(keys: KeyPair): Promise<AuthResult> {
  return new Promise((resolve) => {
    const graph = getGraph();
    
    // Authenticate
    console.log('[Auth] Authenticating with keys...');
    graph.user().auth(keys, async (ack: any) => {
      if (ack.err) {
        console.error('[Auth] Login failed:', ack.err);
        resolve(Result.error(new Error(ack.err)));
        return;
      }
      console.log('[Auth] Gun auth successful');

      // Persist keys securely
      try {
        await LocalStorage.setItemAsync(STORAGE_KEY, JSON.stringify(keys));
        console.log('[Auth] Keys persisted to storage');
      } catch (e) {
        console.warn('[Auth] Failed to persist keys to storage:', e);
      }

      // Resolve immediately to unblock the UI
      const user: User = {
        pub: keys.pub,
        epub: keys.epub,
        alias: 'unknown'
      };

      // Fetch profile name in background without awaiting
      graph.user().get('profile').get('name').once((name: any) => {
        if (typeof name === 'string') {
           const updatedUser = { ...user, alias: name };
           setAuthenticated(updatedUser);
           console.log('[Auth] ✓ Profile loaded:', name);
        }
      });

      setAuthenticated(user);
      console.log('[Auth] ✓ Authenticated (initial)');
      resolve(Result.ok(user));
    });
  });
}

// ============================================================================
// Core API
// ============================================================================

/**
 * Create account with username
 * Generates a keypair, authenticates, and saves the username to profile.
 * 
 * @param username - Display name for the user
 */
export async function create(username: string): Promise<AuthResult> {
  return withAuthLock(async () => {
    console.log('[Auth] create() called for:', username);
    
    // 1. Generate Keypair
    console.log('[Auth] Generating keypair...');
    const pairResult = await generatePair();
    if (!pairResult.ok) {
      return Result.error(new Error('Failed to generate keypair'));
    }
    const keys = pairResult.value;
    console.log('[Auth] Keys generated');

    // 2. Login (Auth) with keys
    // This implicitly "creates" the user in Gun by establishing the identity
    const loginResult = await loginWithKeys(keys);
    
    if (loginResult.ok) {
      // 3. Save profile name
      console.log('[Auth] Saving profile name:', username);
      const graph = getGraph();
      graph.user().get('profile').get('name').put(username as any);
      
      // Update local user object with the new name immediately
      const updatedUser = { ...loginResult.value, alias: username };
      setAuthenticated(updatedUser);
      return Result.ok(updatedUser);
    }

    return loginResult;
  });
}

/**
 * Authenticate with existing keys or username/password
 */
export async function auth(
  usernameOrKeys: string | KeyPair,
  password?: string
): Promise<AuthResult> {
  return withAuthLock(async () => {
    // Keypair Auth
    if (isKeyPair(usernameOrKeys)) {
      console.log('[Auth] Authenticating with keys...');
      return loginWithKeys(usernameOrKeys);
    }

    // Password Auth (Legacy/Fallback)
    console.log('[Auth] Authenticating with password...');
    return new Promise((resolve) => {
      const graph = getGraph();
      const username = usernameOrKeys;

      if (!password) {
        resolve(Result.error(new Error('Password required')));
        return;
      }

      graph.user().auth(username, password, (ack: any) => {
        if (ack.err) {
          resolve(Result.error(new Error(ack.err)));
          return;
        }

        const user = getUserFromRef(graph.user(), username);
        if (user) {
          setAuthenticated(user);
          console.log('[Auth] ✓ Logged in:', user.alias);
          resolve(Result.ok(user));
        } else {
          resolve(Result.error(new Error('Login failed')));
        }
      });
    });
  });
}

/**
 * Leave (logout) current user and clear session
 */
export async function leave(): Promise<void> {
  const graph = getGraph();
  if (graph.user) {
    graph.user().leave();
  }
  
  await LocalStorage.removeItemAsync(STORAGE_KEY);
  setAuthenticated(null);
  console.log('[Auth] ✓ Logged out');
}

/**
 * Restore session from storage
 */
export async function recall(): Promise<AuthResult> {
  return withAuthLock(async () => {
    console.log('[Auth] recall() checking storage...');
    
    try {
      // Try async/secure storage first
      const stored = await LocalStorage.getItemAsync(STORAGE_KEY);
      
      if (stored) {
        try {
          const keys = JSON.parse(stored);
          console.log('[Auth] Found stored keys, authenticating...');
          return await loginWithKeys(keys);
        } catch (e) {
          console.error('[Auth] Failed to parse stored keys');
        }
      }
    } catch (e) {
      console.error('[Auth] Failed to read from storage:', e);
    }

    // Fallback to Gun's session storage (if any)
    return new Promise((resolve) => {
      const graph = getGraph();
      // @ts-ignore - recall signature might be missing in types
      graph.user().recall({ sessionStorage: true }, (ack: any) => {
        if (ack.err || !graph.user().is) {
          resolve(Result.error(new Error('No session found')));
          return;
        }
        
        const user = getUserFromRef(graph.user());
        if (user) {
          setAuthenticated(user);
          console.log('[Auth] ✓ Session restored (Gun)', user.alias);
          resolve(Result.ok(user));
        } else {
          resolve(Result.error(new Error('Restore failed')));
        }
      });
    });
  });
}

// ============================================================================
// React Hook
// ============================================================================

export function useAuth() {
  const user = authStore((s) => s.user);
  const isAuthenticated = authStore((s) => s.isAuthenticated);
  return { user, isAuthenticated };
}
