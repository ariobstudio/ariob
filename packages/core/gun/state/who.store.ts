/**
 * Who Store - Zustand state management for authentication
 *
 * This module provides state management for user authentication and identity.
 * It wraps the Who service with Zustand for reactive state updates.
 *
 * @example
 * ```typescript
 * import { useWhoStore } from '@ariob/core';
 *
 * function LoginButton() {
 *   const { user, isLoading, login } = useWhoStore();
 *
 *   const handleLogin = async () => {
 *     await login({
 *       method: 'traditional',
 *       alias: 'alice',
 *       passphrase: 'password'
 *     });
 *   };
 *
 *   return <button onClick={handleLogin}>Login</button>;
 * }
 * ```
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { who } from '../services/who';
import type { Who, AuthRequest } from '../schema/who.schema';
import type { AppError } from '../schema/errors';
import { Result } from 'neverthrow';

/**
 * Who state interface
 */
interface WhoState {
  user: Who | null;
  isLoading: boolean;
  error: AppError | null;
}

/**
 * Who actions interface
 */
interface WhoActions {
  init: () => Promise<Result<Who | null, AppError>>;
  signup: (authRequest: AuthRequest) => Promise<Result<Who, AppError>>;
  login: (authRequest: AuthRequest) => Promise<Result<Who, AppError>>;
  logout: () => void;
}

/**
 * Combined Who store type
 */
export type WhoStore = WhoState & WhoActions;

/**
 * Who store singleton
 * Pre-configured with the Who service
 */
export const useWhoStore = create<WhoStore>()(
  devtools(
    (set) => ({
      // Initial state
      user: null,
      isLoading: false,
      error: null,

      // Actions
      init: async () => {
        set({ isLoading: true, error: null });
        const result = await who.init();

        result.match(
          (user) => set({ user, isLoading: false }),
          (error) => set({ error, isLoading: false })
        );

        return result;
      },

      signup: async (authRequest) => {
        set({ isLoading: true, error: null });
        const result = await who.signup(authRequest);

        result.match(
          (user) => set({ user, isLoading: false }),
          (error) => set({ error, isLoading: false })
        );

        return result;
      },

      login: async (authRequest) => {
        set({ isLoading: true, error: null });
        const result = await who.login(authRequest);

        result.match(
          (user) => set({ user, isLoading: false }),
          (error) => set({ error, isLoading: false })
        );

        return result;
      },

      logout: () => {
        who.logout();
        set({ user: null, error: null });
      },
    }),
    { name: 'WhoStore' }
  )
);
