import { create } from 'zustand';
import { who } from '../services/who.service';
import { Who, AuthRequest } from '../schema/who.schema';
import { AppError } from '../schema/errors';
import { Result } from 'neverthrow';

interface WhoState {
  user: Who | null;
  isLoading: boolean;
  error: AppError | null;
}

interface WhoActions {
  init: () => Promise<Result<Who | null, AppError>>;
  signup: (authRequest: AuthRequest) => Promise<Result<Who, AppError>>;
  login: (authRequest: AuthRequest) => Promise<Result<Who, AppError>>;
  logout: () => void;
}

export type WhoStore = WhoState & WhoActions;

export const useWhoStore = create<WhoStore>()(
  (set) => ({
    user: null,
    isLoading: false,
    error: null,

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
  })
);
