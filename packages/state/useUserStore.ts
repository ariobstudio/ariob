import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { gunService } from '../data/gunService';

interface UserProfile {
  name?: string;
  bio?: string;
  avatar?: string;
  createdAt?: number;
}

interface UserState {
  alias: string;
  pub: string | null;
  isAuthed: boolean;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  // Actions
  login: (alias: string, pass: string) => Promise<void>;
  signup: (alias: string, pass: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

/**
 * User store for authentication and profile management using Gun and Zustand
 * Follows ChainGun-inspired patterns for better user session management
 */
export const useUserStore = create<UserState>(
  persist(
    (set, get) => ({
      alias: '',
      pub: null,
      isAuthed: false,
      profile: null,
      loading: false,
      error: null,

      // Login with existing credentials
      login: async (alias, pass) => {
        try {
          set({ loading: true, error: null });
          
          return new Promise((resolve, reject) => {
            gunService.user().auth(alias, pass, (ack: any) => {
              if (ack.err) {
                set({ 
                  loading: false, 
                  error: new Error(ack.err) 
                });
                return reject(new Error(ack.err));
              }
              
              set({ 
                alias, 
                pub: ack.pub, 
                isAuthed: true, 
                loading: false 
              });
              
              // Fetch user profile after successful login
              get().fetchProfile();
              
              resolve();
            });
          });
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error : new Error(String(error)) 
          });
          throw error;
        }
      },

      // Register a new user
      signup: async (alias, pass) => {
        try {
          set({ loading: true, error: null });
          
          return new Promise((resolve, reject) => {
            gunService.user().create(alias, pass, (ack: any) => {
              if (ack.err) {
                set({ 
                  loading: false, 
                  error: new Error(ack.err) 
                });
                return reject(new Error(ack.err));
              }
              
              // After creation, authenticate
              gunService.user().auth(alias, pass, (authAck: any) => {
                if (authAck.err) {
                  set({ 
                    loading: false, 
                    error: new Error(authAck.err) 
                  });
                  return reject(new Error(authAck.err));
                }
                
                // Initialize user profile
                const profile: UserProfile = {
                  name: alias,
                  createdAt: Date.now()
                };
                
                // Save profile to Gun
                gunService.user().get('profile').put(profile);
                
                set({ 
                  alias, 
                  pub: authAck.pub, 
                  isAuthed: true, 
                  profile,
                  loading: false 
                });
                
                resolve();
              });
            });
          });
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error : new Error(String(error)) 
          });
          throw error;
        }
      },

      // Logout current user
      logout: () => {
        gunService.user().leave();
        set({ 
          alias: '', 
          pub: null, 
          isAuthed: false, 
          profile: null 
        });
      },

      // Update user profile
      updateProfile: async (profileUpdates: Partial<UserProfile>) => {
        try {
          const { isAuthed } = get();
          
          if (!isAuthed) {
            throw new Error('User must be authenticated to update profile');
          }
          
          set({ loading: true, error: null });
          
          // Get current profile
          const currentProfile = get().profile || {};
          
          // Merge updates with current profile
          const updatedProfile = {
            ...currentProfile,
            ...profileUpdates
          };
          
          // Save to Gun
          await gunService.put(
            gunService.user().get('profile'),
            updatedProfile
          );
          
          // Update local state
          set({ profile: updatedProfile, loading: false });
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error : new Error(String(error)) 
          });
          throw error;
        }
      },

      // Fetch user profile
      fetchProfile: async () => {
        try {
          const { isAuthed } = get();
          
          if (!isAuthed) {
            return;
          }
          
          set({ loading: true, error: null });
          
          // Get profile from Gun
          const profile = await gunService.once(
            gunService.user().get('profile')
          );
          
          // Update state with fetched profile
          set({ profile: profile || null, loading: false });
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error : new Error(String(error)) 
          });
        }
      }
    }),
    {
      name: 'ariob-user-store',
      partialize: (state) => ({
        // Only persist the minimal needed info, not functions
        alias: state.alias,
        pub: state.pub,
        isAuthed: state.isAuthed
        // We don't persist profile - will be refetched on login
      })
    }
  )
);

export default useUserStore;
