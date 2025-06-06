import { useEffect } from 'react';
import { useWhoStore } from '../state/who.store';

/**
 * useWho Hook
 * 
 * A React hook that provides authentication state and methods for user management.
 * Automatically initializes the who service and restores saved sessions.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isLoading, error, login, logout } = useWho();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!user) return <LoginScreen />;
 *   
 *   return <div>Welcome, {user.alias}!</div>;
 * }
 * ```
 */
export const useWho = () => {
  const store = useWhoStore();

  useEffect(() => {
    if (!store.user && !store.isLoading) {
      store.init();
    }
  }, [store]);

  return {
    user: store.user,
    isLoading: store.isLoading,
    error: store.error,
    signup: store.signup,
    login: store.login,
    logout: store.logout,
    isAuthenticated: !!store.user,
  };
};
