import { useEffect } from 'react';
import { useAuthStore } from '../state/auth.store';
import type { Who } from '../schema/who.schema';

/**
 * Authentication hook that provides access to user authentication state and actions.
 * 
 * This hook automatically checks authentication status on mount and provides
 * reactive access to the current user, loading states, and authentication methods.
 * 
 * @example
 * ```tsx
 * function LoginComponent() {
 *   const { user, isAuthenticated, login, logout, isLoading, error } = useAuth();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   
 *   return isAuthenticated ? (
 *     <button onClick={logout}>Logout {user?.alias}</button>
 *   ) : (
 *     <button onClick={() => login('user-keypair')}>Login</button>
 *   );
 * }
 * ```
 * 
 * @returns Authentication state and methods
 */
export interface UseAuthReturn {
  /** Current authenticated user, null if not authenticated */
  user: Who | null;
  /** Whether an authentication operation is in progress */
  isLoading: boolean;
  /** Current error message, null if no error */
  error: string | null;
  /** Type of the current error for categorization */
  errorType: string | null;
  /** Whether a user is currently authenticated */
  isAuthenticated: boolean;
  /** Sign up a new user with the provided alias */
  signup: (alias: string) => Promise<void>;
  /** Log in an existing user with the provided key pair */
  login: (keyPair: string) => Promise<void>;
  /** Log out the current user */
  logout: () => void;
  /** Update the current user's profile */
  updateProfile: (updates: Partial<Who>) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { 
    user, 
    isLoading, 
    error, 
    errorType, 
    signup, 
    login, 
    logout, 
    checkAuth,
    updateProfile
  } = useAuthStore();

  // Check authentication status on component mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isLoading,
    error,
    errorType,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
    updateProfile,
  };
}
