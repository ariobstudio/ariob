import { useEffect } from 'react';
import { useAuthStore } from '@/gun/state/auth.store';

// Hook for authentication
export function useAuth() {
  const { user, isLoading, error, login, signup, logout, checkAuth, updateProfile } = useAuthStore();

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
  };
}
