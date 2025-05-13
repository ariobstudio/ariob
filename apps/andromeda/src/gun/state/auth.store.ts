import type { Who } from '@/gun/schema/who.schema';
import * as whoService from '@/gun/services/who.service';
import { create } from 'zustand';

interface AuthState {
  user: Who | null;
  isLoading: boolean;
  error: string | null;
  signup: (alias: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: false,
  error: null,

  signup: async (alias) => {
    set({ isLoading: true, error: null });
    try {
      const user = await whoService.signup({ alias });
      set({ user, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Signup failed',
        isLoading: false,
      });
    }
  },
  login: async (keyPair) => {
    set({ isLoading: true, error: null });
    try {
      const user = await whoService.login(keyPair);
      set({ user, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      });
    }
  },

  logout: () => {
    whoService.logout();
    set({ user: null });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await whoService.getCurrentUser();
      set({ user, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
