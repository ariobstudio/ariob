import * as Err from '../schema/errors';
import type { Who } from '../schema/who.schema';
import { who } from '../services/who.service';
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
  updateProfile: (updates: Partial<Who>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: false,
  error: null,
  errorType: null,

  signup: async (alias) => {
    set({ isLoading: true, error: null, errorType: null });
    console.log('signing up2222: ', alias)
    const result = await who.signup({ alias });
    console.log(result)
    result.match(
      (user) => {
        set({ user, isLoading: false });
      },
      (error: Err.AppError) => {
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
    
    const result = await who.login(keyPair);
    
    result.match(
      (user) => {
        set({ user, isLoading: false });
      },
      (error: Err.AppError) => {
        set({
          error: error.message,
          errorType: error.type,
          isLoading: false,
        });
      }
    );
  },

  logout: () => {
    who.logout();
    set({ user: null });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    
    const result = await who.current();
    
    result.match(
      (user) => {
        set({ user, isLoading: false });
      },
      (error: Err.AppError) => {
        console.error('Auth check error:', error);
        set({ isLoading: false });
      }
    );
  },

  updateProfile: async (updates) => {
    set({ isLoading: true, error: null, errorType: null });
    
    const result = await who.update(updates);
    
    result.match(
      (user) => {
        set({ user, isLoading: false });
      },
      (error: Err.AppError) => {
        set({
          error: error.message,
          errorType: error.type,
          isLoading: false,
        });
      }
    );
  },
}));
