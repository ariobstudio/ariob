import { useAuthStore } from '@/gun/state/auth.store';
import { useEffect } from 'react';

// Hook for authentication
export function useAuth() {
  const { user, isLoading, error, signup, login, logout, checkAuth } =
    useAuthStore();

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
  };
}
