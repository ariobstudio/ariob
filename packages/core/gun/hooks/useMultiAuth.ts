import { useEffect } from 'react';
import { useMultiAuthStore } from '../state/multi-auth.store';
import { useAuthStore } from '../state/auth.store';
import type { Who } from '../schema/who.schema';
import type { AccountMetadata } from '../services/account.service';

/**
 * Multi-account authentication hook that provides advanced account management functionality.
 * 
 * This hook extends the basic authentication capabilities to support multiple user accounts,
 * allowing users to switch between different identities while maintaining backward compatibility
 * with the single-user authentication system.
 * 
 * @example
 * ```tsx
 * function AccountSwitcher() {
 *   const { 
 *     accounts, 
 *     currentUser, 
 *     switchAccount, 
 *     createAccount, 
 *     removeAccount,
 *     isAuthenticated 
 *   } = useMultiAuth();
 *   
 *   return (
 *     <div>
 *       <h3>Current User: {currentUser?.alias}</h3>
 *       <ul>
 *         {accounts.map(account => (
 *           <li key={account.id}>
 *             <button onClick={() => switchAccount(account.id)}>
 *               {account.alias}
 *             </button>
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @returns Multi-account authentication state and methods
 */
export interface UseMultiAuthReturn {
  /** List of all stored user account metadata */
  accounts: AccountMetadata[];
  /** Currently active user account */
  currentUser: Who | null;
  /** ID of the currently active account */
  activeAccountId: string | null;
  /** Whether any user is currently authenticated */
  isAuthenticated: boolean;
  /** Whether an authentication operation is in progress */
  isLoading: boolean;
  /** Whether accounts are being loaded */
  isLoadingAccounts: boolean;
  /** Whether an account switch is in progress */
  isSwitchingAccount: boolean;
  /** Current error message, null if no error */
  error: string | null;
  /** Type of the current error for categorization */
  errorType: string | null;
  /** Create a new account and add it to the multi-auth system */
  createAccount: (alias: string, passphrase?: string) => Promise<void>;
  /** Import an existing account into the multi-auth system */
  importAccount: (credentials: string, alias?: string) => Promise<void>;
  /** Remove an account from the multi-auth system */
  removeAccount: (accountId: string) => Promise<void>;
  /** Switch to a different account */
  switchAccount: (accountId: string) => Promise<void>;
  /** Export account credentials for backup */
  exportAccount: (accountId: string) => Promise<string | null>;
  /** Update the current user's profile */
  updateProfile: (updates: Partial<Who>) => Promise<void>;
  /** Log out the current user and clear both auth stores */
  logout: () => void;
  /** Load all stored accounts from persistent storage */
  loadAccounts: () => Promise<void>;
  /** Check authentication status for the current user */
  checkAuth: () => Promise<void>;
  /** Clear any current error state */
  clearError: () => void;
  /** Backward compatibility: current user (alias for currentUser) */
  user: Who | null;
}

export function useMultiAuth(): UseMultiAuthReturn {
  const multiAuth = useMultiAuthStore();
  const singleAuth = useAuthStore();

  // Sync multi-auth current user with single auth store for backward compatibility
  useEffect(() => {
    if (multiAuth.currentUser && !singleAuth.user) {
      // Update single auth store when multi-auth has a user
      singleAuth.checkAuth();
    } else if (!multiAuth.currentUser && singleAuth.user) {
      // Clear single auth when multi-auth logs out
      singleAuth.logout();
    }
  }, [multiAuth.currentUser, singleAuth.user, singleAuth]);

  // Initialize multi-auth system on component mount
  useEffect(() => {
    multiAuth.loadAccounts();
    multiAuth.checkAuth();
  }, [multiAuth]);

  // Enhanced logout that clears both stores for complete cleanup
  const logout = (): void => {
    multiAuth.logout();
    singleAuth.logout();
  };

  return {
    // Multi-account specific functionality
    accounts: multiAuth.accounts,
    currentUser: multiAuth.currentUser,
    activeAccountId: multiAuth.activeAccountId,
    isLoading: multiAuth.isLoading,
    isLoadingAccounts: multiAuth.isLoadingAccounts,
    isSwitchingAccount: multiAuth.isSwitchingAccount,
    error: multiAuth.error,
    errorType: multiAuth.errorType,
    createAccount: multiAuth.createAccount,
    importAccount: multiAuth.importAccount,
    removeAccount: multiAuth.removeAccount,
    switchAccount: multiAuth.switchAccount,
    exportAccount: multiAuth.exportAccount,
    updateProfile: multiAuth.updateProfile,
    loadAccounts: multiAuth.loadAccounts,
    checkAuth: multiAuth.checkAuth,
    clearError: multiAuth.clearError,
    
    // Computed properties
    isAuthenticated: !!multiAuth.currentUser,
    
    // Backward compatibility
    user: multiAuth.currentUser,
    
    // Enhanced methods
    logout,
  };
} 