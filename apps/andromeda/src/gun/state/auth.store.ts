import { AppError, createUnknownError } from '@/gun/schema/errors';
import type { Who } from '@/gun/schema/who.schema';
import * as whoService from '@/gun/services/who.service';
import { Result } from 'neverthrow';
import { create } from 'zustand';

interface AuthState {
  user: Who | null;
  isLoading: boolean;
  error: string | null;
  errorType: string | null;
  signup: (alias: string) => Promise<void>;
  login: (keyPair: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: false,
  error: null,
  errorType: null,

  signup: async (alias) => {
    set({ isLoading: true, error: null, errorType: null });
    
    const result = await whoService.signup({ alias });
    
    result.match(
      (user) => {
        set({ user, isLoading: false });
      },
      (error: AppError) => {
        set({
          error: error.message,
          errorType: error.type,
          isLoading: false,
        });
      }
    );
  },
  
  login: async (keyPair) => {
    set({ isLoading: true, error: null, errorType: null });
    
    const result = await whoService.login(keyPair);
    
    result.match(
      (user) => {
        set({ user, isLoading: false });
      },
      (error: AppError) => {
        set({
          error: error.message,
          errorType: error.type,
          isLoading: false,
        });
      }
    );
  },

  logout: () => {
    whoService.logout();
    set({ user: null });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    
    const result = await whoService.getCurrentUser();
    
    result.match(
      (user) => {
        set({ user, isLoading: false });
      },
      (error: AppError) => {
        console.error('Auth check error:', error);
        set({ isLoading: false });
      }
    );
  },
}));
