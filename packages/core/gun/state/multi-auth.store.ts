import * as Err from '../schema/errors';
import type { Who } from '../schema/who.schema';
import { AccountService, type AccountMetadata } from '../services/account.service';
import { who } from '../services/who.service';
import { create } from 'zustand';

interface MultiAuthState {
  // Current user state
  currentUser: Who | null;
  
  // Account management
  accounts: AccountMetadata[];
  activeAccountId: string | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingAccounts: boolean;
  isSwitchingAccount: boolean;
  
  // Error states
  error: string | null;
  errorType: string | null;
  
  // Actions for account creation
  createAccount: (alias: string, passphrase?: string) => Promise<void>;
  importAccount: (credentials: string, alias?: string) => Promise<void>;
  
  // Actions for account management
  switchAccount: (accountId: string) => Promise<void>;
  removeAccount: (accountId: string) => Promise<void>;
  exportAccount: (accountId: string) => Promise<string | null>;
  
  // Actions for profile management
  updateProfile: (updates: Partial<Who>) => Promise<void>;
  
  // Actions for session management
  logout: () => void;
  loadAccounts: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  // Utility actions
  clearError: () => void;
}

export const useMultiAuthStore = create<MultiAuthState>()((set, get) => ({
  // Initial state
  currentUser: null,
  accounts: [],
  activeAccountId: null,
  isLoading: false,
  isLoadingAccounts: false,
  isSwitchingAccount: false,
  error: null,
  errorType: null,

  // Create a new account
  createAccount: async (alias, passphrase) => {
    set({ isLoading: true, error: null, errorType: null });
    
    try {
      const result = await AccountService.createAccount({ alias, passphrase });
      
      if (result.isOk()) {
        // Reload accounts list
        await get().loadAccounts();
        
        // Auto-switch to the new account
        await get().switchAccount(result.value.id);
        
        set({ isLoading: false });
      } else {
        set({
          error: result.error.message,
          errorType: result.error.type,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: 'Failed to create account',
        errorType: 'unknown',
        isLoading: false,
      });
    }
  },

  // Import an existing account
  importAccount: async (credentials, alias) => {
    set({ isLoading: true, error: null, errorType: null });
    
    try {
      const result = await AccountService.importAccount(credentials, alias);
      
      if (result.isOk()) {
        // Reload accounts list
        await get().loadAccounts();
        
        set({ isLoading: false });
      } else {
        set({
          error: result.error.message,
          errorType: result.error.type,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: 'Failed to import account',
        errorType: 'unknown',
        isLoading: false,
      });
    }
  },

  // Switch to a different account
  switchAccount: async (accountId) => {
    set({ isSwitchingAccount: true, error: null, errorType: null });
    
    try {
      const result = await AccountService.switchAccount(accountId);
      
      if (result.isOk()) {
        set({
          currentUser: result.value,
          activeAccountId: accountId,
          isSwitchingAccount: false,
        });
        
        // Update account metadata
        await get().loadAccounts();
      } else {
        set({
          error: result.error.message,
          errorType: result.error.type,
          isSwitchingAccount: false,
        });
      }
    } catch (error) {
      set({
        error: 'Failed to switch account',
        errorType: 'unknown',
        isSwitchingAccount: false,
      });
    }
  },

  // Remove an account
  removeAccount: async (accountId) => {
    set({ isLoading: true, error: null, errorType: null });
    
    try {
      // Don't allow removing the currently active account
      if (accountId === get().activeAccountId) {
        set({
          error: 'Cannot remove the currently active account. Switch to another account first.',
          errorType: 'validation',
          isLoading: false,
        });
        return;
      }
      
      const result = await AccountService.removeAccount(accountId);
      
      if (result.isOk()) {
        // Reload accounts list
        await get().loadAccounts();
        set({ isLoading: false });
      } else {
        set({
          error: result.error.message,
          errorType: result.error.type,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: 'Failed to remove account',
        errorType: 'unknown',
        isLoading: false,
      });
    }
  },

  // Export account credentials
  exportAccount: async (accountId) => {
    try {
      const result = await AccountService.exportAccount(accountId);
      
      if (result.isOk()) {
        return result.value;
      } else {
        set({
          error: result.error.message,
          errorType: result.error.type,
        });
        return null;
      }
    } catch (error) {
      set({
        error: 'Failed to export account',
        errorType: 'unknown',
      });
      return null;
    }
  },

  // Update current user profile
  updateProfile: async (updates) => {
    set({ isLoading: true, error: null, errorType: null });
    
    try {
      const result = await who.update(updates);
      
      if (result.isOk()) {
        set({
          currentUser: result.value,
          isLoading: false,
        });
        
        // Update the account metadata if display name or avatar changed
        const { activeAccountId } = get();
        if (activeAccountId && (updates.displayName || updates.avatar)) {
          await AccountService.updateAccountMetadata(activeAccountId, {
            displayName: updates.displayName,
            avatar: updates.avatar,
          });
          await get().loadAccounts();
        }
      } else {
        set({
          error: result.error.message,
          errorType: result.error.type,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: 'Failed to update profile',
        errorType: 'unknown',
        isLoading: false,
      });
    }
  },

  // Logout current user
  logout: () => {
    who.logout();
    set({
      currentUser: null,
      activeAccountId: null,
    });
  },

  // Load all accounts from storage
  loadAccounts: async () => {
    set({ isLoadingAccounts: true });
    
    try {
      const accountsResult = await AccountService.getAllAccounts();
      const activeResult = await AccountService.getActiveAccount();
      
      if (accountsResult.isOk()) {
        set({
          accounts: accountsResult.value,
          activeAccountId: activeResult.isOk() ? activeResult.value?.id || null : null,
          isLoadingAccounts: false,
        });
      } else {
        set({
          error: accountsResult.error.message,
          errorType: accountsResult.error.type,
          isLoadingAccounts: false,
        });
      }
    } catch (error) {
      set({
        error: 'Failed to load accounts',
        errorType: 'unknown',
        isLoadingAccounts: false,
      });
    }
  },

  // Check current authentication status
  checkAuth: async () => {
    set({ isLoading: true });
    
    try {
      const result = await who.current();
      
      if (result.isOk()) {
        set({
          currentUser: result.value,
          isLoading: false,
        });
        
        // Load accounts and sync active account
        await get().loadAccounts();
      } else {
        set({
          currentUser: null,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        currentUser: null,
        isLoading: false,
      });
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null, errorType: null });
  },
})); 