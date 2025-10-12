/**
 * Authentication State Store
 *
 * Zustand store for managing authentication state including user info,
 * cryptographic keys, and login status.
 */

import { create } from 'zustand';
import type { KeyPair } from '../gun/graph';


/**
 * User authentication information
 */
export interface UserInfo {
  pub: string;
  epub: string;
  alias: string;
}

/**
 * Authentication state interface
 */
interface AuthState {
  /** Current authenticated user info */
  user: UserInfo | null;
  /** User's cryptographic key pair */
  keys: KeyPair | null;
  /** Whether a user is currently logged in */
  isLoggedIn: boolean;

  /** Set the current user info */
  setUser: (user: UserInfo | null) => void;
  /** Set the user's key pair */
  setKeys: (keys: KeyPair | null) => void;
  /** Set the login status */
  setLoggedIn: (status: boolean) => void;
  /** Reset all auth state to initial values */
  reset: () => void;
}

/**
 * Initial authentication state
 */
const initialState = {
  user: null,
  keys: null,
  isLoggedIn: false,
};

/**
 * Zustand store for authentication state.
 *
 * @example
 * ```typescript
 * const { user, keys, isLoggedIn, setUser, setKeys, setLoggedIn, reset } = useAuthStore();
 *
 * // Update user info
 * setUser({ pub: 'key...', epub: 'ekey...', alias: 'alice' });
 *
 * // Update keys
 * setKeys({ pub, priv, epub, epriv });
 *
 * // Mark as logged in
 * setLoggedIn(true);
 *
 * // Clear all state
 * reset();
 * ```
 */
export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setUser: (user) => {
    set({
      user,
      isLoggedIn: user !== null,
    });
  },

  setKeys: (keys) => {
    set({ keys });
  },

  setLoggedIn: (status) => {
    set({ isLoggedIn: status });
  },

  reset: () => {
    set(initialState);
  },
}));
