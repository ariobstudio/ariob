/**
 * useAuthFlow - Authentication flow orchestration
 *
 * Handles session restoration and provides auth state.
 * Screens use useBar() to open account sheets when needed.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth, recall, leave } from '@ariob/core';

export function useAuthFlow() {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Log auth state changes
  useEffect(() => {
    console.log('[useAuthFlow] Auth state changed:', {
      isAuthenticated,
      user: user ? { pub: user.pub?.slice(0, 20) + '...', alias: user.alias } : null,
      isLoading,
    });
  }, [user, isAuthenticated, isLoading]);

  // Restore session on mount
  useEffect(() => {
    console.log('[useAuthFlow] Attempting to recall session...');
    recall()
      .then((result) => {
        console.log('[useAuthFlow] Recall result:', result.ok ? 'success' : 'no session');
        if (result.ok) {
          console.log('[useAuthFlow] Restored user:', result.value.alias);
        }
      })
      .finally(() => {
        console.log('[useAuthFlow] Recall complete, setting isLoading=false');
        setIsLoading(false);
      });
  }, []);

  // Logout
  const logout = useCallback(async () => {
    console.log('[useAuthFlow] Logging out...');
    await leave();
    console.log('[useAuthFlow] Logged out');
  }, []);

  return { user, isAuthenticated, isLoading, logout };
}
