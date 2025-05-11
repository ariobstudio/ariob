import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as whoService from '@/gun/services/who.service';
import type { Who } from '@/gun/schema/who.schema';

interface AuthState {
  // State
  user: Who | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (alias: string, passphrase: string) => Promise<void>;
  signup: (alias: string, passphrase: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<Who>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      
      login: async (alias, passphrase) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = await whoService.login({ alias, passphrase });
          set({ user, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed', 
            isLoading: false 
          });
        }
      },
      
      signup: async (alias, passphrase) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = await whoService.signup({ alias, passphrase });
          set({ user, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Signup failed', 
            isLoading: false 
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
        } catch (error) {
          set({ isLoading: false });
        }
      },
      
      updateProfile: async (updates) => {
        set({ isLoading: true, error: null });
        
        try {
          const updatedUser = await whoService.updateProfile(updates);
          
          if (updatedUser) {
            set({ user: updatedUser, isLoading: false });
          } else {
            set({ error: 'Update failed', isLoading: false });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Update failed', 
            isLoading: false 
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
