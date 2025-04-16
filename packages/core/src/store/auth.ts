import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean
  setAuth: (isAuthenticated: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  setAuth: (isAuthenticated) => set({ isAuthenticated }),
})) 