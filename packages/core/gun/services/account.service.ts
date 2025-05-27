import { gun, sea } from '../core/gun';
import * as Err from '../schema/errors';
import { Who, WhoAuthSchema, WhoCredentialsSchema } from '../schema/who.schema';
import { who } from './who.service';
import { Result, ok, err } from 'neverthrow';
import { secureStorage } from './secure-storage.service';
import { storage } from '../lib/native-storage';

// Account storage keys
const ACCOUNTS_METADATA_KEY = 'ariob_accounts_metadata';
const ACTIVE_ACCOUNT_KEY = 'ariob_active_account';

// Account metadata interface
export interface AccountMetadata {
  id: string; // public key
  alias: string;
  displayName?: string;
  avatar?: string;
  createdAt: number;
  lastUsedAt: number;
  isActive: boolean;
}

// Credentials stored securely and encrypted
interface SecureCredentials {
  pub: string;
  epub: string;
  priv: string; // Encrypted
  epriv: string; // Encrypted
}

// Account management service
export const AccountService = {
  /**
   * Create a new account with unique identity
   */
  createAccount: async (auth: { alias: string; passphrase?: string }): Promise<Result<AccountMetadata, Err.AppError>> => {
    try {
      // Generate new key pair
      const pair = await sea.pair();
      
      console.log('pair', pair);
      // Create account metadata
      const metadata: AccountMetadata = {
        id: pair.pub,
        alias: auth.alias,
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
        isActive: false,
      };

      // Store credentials securely (encrypted)
      const credentials: SecureCredentials = {
        pub: pair.pub,
        epub: pair.epub,
        priv: pair.priv,
        epriv: pair.epriv,
      };

      // Save encrypted credentials
      const storeResult = await secureStorage.storeEncrypted(`account_credentials_${pair.pub}`, credentials);
      if (storeResult.isErr()) {
        return err(storeResult.error);
      }

      // Save metadata (non-sensitive) to regular storage
      const saveMetadataResult = await AccountService.saveAccountMetadata(metadata);
      if (saveMetadataResult.isErr()) {
        return err(saveMetadataResult.error);
      }

      // Create the account in Gun/who service
      const createResult = await who.signup(auth);
      if (createResult.isErr()) {
        // Remove from storage if Gun creation fails
        await AccountService.removeAccount(metadata.id);
        return err(createResult.error);
      }

      return ok(metadata);
    } catch (error) {
      return err(Err.unknown('Failed to create account', error));
    }
  },

  /**
   * Import an existing account using credentials
   */
  importAccount: async (credentials: string, alias?: string): Promise<Result<AccountMetadata, Err.AppError>> => {
    try {
      const pair = JSON.parse(credentials);
      
      // Validate credentials format
      const credCheck = WhoCredentialsSchema.safeParse(pair);
      if (!credCheck.success) {
        return err(Err.validate('Invalid credentials format'));
      }

      // Check if account already exists
      const existing = await AccountService.getAccount(pair.pub);
      if (existing.isOk() && existing.value) {
        return err(Err.validate('Account already exists'));
      }

      // Test authentication with Gun
      const loginResult = await who.login(credentials);
      if (loginResult.isErr()) {
        return err(loginResult.error);
      }

      // Create metadata
      const metadata: AccountMetadata = {
        id: pair.pub,
        alias: alias || pair.alias || 'Imported Account',
        displayName: loginResult.value.displayName,
        avatar: loginResult.value.avatar,
        createdAt: loginResult.value.createdAt || Date.now(),
        lastUsedAt: Date.now(),
        isActive: false,
      };

      // Store credentials securely
      const secureCredentials: SecureCredentials = {
        pub: pair.pub,
        epub: pair.epub,
        priv: pair.priv,
        epriv: pair.epriv,
      };

      const storeResult = await secureStorage.storeEncrypted(`account_credentials_${pair.pub}`, secureCredentials);
      if (storeResult.isErr()) {
        return err(storeResult.error);
      }

      // Save metadata
      const saveMetadataResult = await AccountService.saveAccountMetadata(metadata);
      if (saveMetadataResult.isErr()) {
        return err(saveMetadataResult.error);
      }

      return ok(metadata);
    } catch (error) {
      return err(Err.unknown('Failed to import account', error));
    }
  },

  /**
   * Switch to a different account
   */
  switchAccount: async (accountId: string): Promise<Result<Who, Err.AppError>> => {
    try {
      // Get account metadata
      const accountResult = await AccountService.getAccount(accountId);
      if (accountResult.isErr()) {
        return err(accountResult.error);
      }

      const account = accountResult.value;
      if (!account) {
        return err(Err.validate('Account not found'));
      }

      // Logout current user
      who.logout();

      // Get stored credentials securely
      const credentialsResult = await AccountService.getAccountCredentials(accountId);
      if (credentialsResult.isErr()) {
        return err(credentialsResult.error);
      }

      // Login with account credentials
      const loginResult = await who.login(JSON.stringify(credentialsResult.value));
      if (loginResult.isErr()) {
        return err(loginResult.error);
      }

      // Update account metadata
      await AccountService.updateAccountMetadata(accountId, {
        lastUsedAt: Date.now(),
        isActive: true,
      });

      // Set as active account
      storage.setString(ACTIVE_ACCOUNT_KEY, accountId);

      // Deactivate other accounts
      const accounts = await AccountService.getAllAccounts();
      if (accounts.isOk()) {
        for (const acc of accounts.value) {
          if (acc.id !== accountId) {
            await AccountService.updateAccountMetadata(acc.id, { isActive: false });
          }
        }
      }

      return loginResult;
    } catch (error) {
      return err(Err.unknown('Failed to switch account', error));
    }
  },

  /**
   * Get all stored accounts
   */
  getAllAccounts: async (): Promise<Result<AccountMetadata[], Err.AppError>> => {
    try {
      const stored = storage.getJSON<AccountMetadata[]>(ACCOUNTS_METADATA_KEY, []);
      return ok(stored);
    } catch (error) {
      return err(Err.unknown('Failed to get accounts', error));
    }
  },

  /**
   * Get specific account metadata
   */
  getAccount: async (accountId: string): Promise<Result<AccountMetadata | null, Err.AppError>> => {
    try {
      const allResult = await AccountService.getAllAccounts();
      if (allResult.isErr()) {
        return err(allResult.error);
      }

      const account = allResult.value.find(acc => acc.id === accountId);
      return ok(account || null);
    } catch (error) {
      return err(Err.unknown('Failed to get account', error));
    }
  },

  /**
   * Get account credentials (for authentication) - securely decrypted
   */
  getAccountCredentials: async (accountId: string): Promise<Result<SecureCredentials, Err.AppError>> => {
    try {
      const credentialsResult = await secureStorage.retrieveEncrypted<SecureCredentials>(`account_credentials_${accountId}`);
      if (credentialsResult.isErr()) {
        return err(credentialsResult.error);
      }

      if (!credentialsResult.value) {
        return err(Err.validate('Account credentials not found'));
      }

      return ok(credentialsResult.value);
    } catch (error) {
      return err(Err.unknown('Failed to get account credentials', error));
    }
  },

  /**
   * Update account metadata
   */
  updateAccountMetadata: async (
    accountId: string, 
    updates: Partial<Omit<AccountMetadata, 'id' | 'createdAt'>>
  ): Promise<Result<AccountMetadata, Err.AppError>> => {
    try {
      const accounts = storage.getJSON<AccountMetadata[]>(ACCOUNTS_METADATA_KEY, []);
      const accountIndex = accounts.findIndex(acc => acc.id === accountId);
      
      if (accountIndex === -1) {
        return err(Err.validate('Account not found'));
      }

      // Update metadata
      accounts[accountIndex] = {
        ...accounts[accountIndex],
        ...updates,
      };

      // Save back to storage
      storage.setJSON(ACCOUNTS_METADATA_KEY, accounts);

      return ok(accounts[accountIndex]);
    } catch (error) {
      return err(Err.unknown('Failed to update account metadata', error));
    }
  },

  /**
   * Remove an account
   */
  removeAccount: async (accountId: string): Promise<Result<void, Err.AppError>> => {
    try {
      // Remove secure credentials
      secureStorage.removeSecurely(`account_credentials_${accountId}`);

      // Remove from metadata
      const accounts = storage.getJSON<AccountMetadata[]>(ACCOUNTS_METADATA_KEY, []);
      const filteredAccounts = accounts.filter(acc => acc.id !== accountId);
      storage.setJSON(ACCOUNTS_METADATA_KEY, filteredAccounts);

      // If this was the active account, clear active account
      const activeAccount = storage.getString(ACTIVE_ACCOUNT_KEY);
      if (activeAccount === accountId) {
        storage.remove(ACTIVE_ACCOUNT_KEY);
      }

      return ok(undefined);
    } catch (error) {
      return err(Err.unknown('Failed to remove account', error));
    }
  },

  /**
   * Get currently active account
   */
  getActiveAccount: async (): Promise<Result<AccountMetadata | null, Err.AppError>> => {
    try {
      const activeId = storage.getString(ACTIVE_ACCOUNT_KEY);
      if (!activeId) {
        return ok(null);
      }

      return AccountService.getAccount(activeId);
    } catch (error) {
      return err(Err.unknown('Failed to get active account', error));
    }
  },

  /**
   * Export account credentials for backup/transfer
   */
  exportAccount: async (accountId: string): Promise<Result<string, Err.AppError>> => {
    try {
      const credentialsResult = await AccountService.getAccountCredentials(accountId);
      if (credentialsResult.isErr()) {
        return err(credentialsResult.error);
      }

      return ok(JSON.stringify(credentialsResult.value));
    } catch (error) {
      return err(Err.unknown('Failed to export account', error));
    }
  },

  /**
   * Store recovery information for an account
   */
  storeRecoveryInfo: async (
    accountId: string,
    recoveryData: {
      recoveryCode?: string;
      backupPhrases?: string[];
      securityQuestions?: Array<{ question: string; answer: string }>;
    }
  ): Promise<Result<void, Err.AppError>> => {
    return secureStorage.storeRecoveryInfo(accountId, recoveryData);
  },

  /**
   * Get recovery information for an account
   */
  getRecoveryInfo: async (accountId: string): Promise<Result<any, Err.AppError>> => {
    return secureStorage.getRecoveryInfo(accountId);
  },

  /**
   * Save account metadata (private helper)
   */
  saveAccountMetadata: async (metadata: AccountMetadata): Promise<Result<void, Err.AppError>> => {
    try {
      const accounts = storage.getJSON<AccountMetadata[]>(ACCOUNTS_METADATA_KEY, []);

      // Check for duplicates
      const existingIndex = accounts.findIndex(acc => acc.id === metadata.id);
      if (existingIndex !== -1) {
        // Update existing
        accounts[existingIndex] = metadata;
      } else {
        // Add new
        accounts.push(metadata);
      }

      storage.setJSON(ACCOUNTS_METADATA_KEY, accounts);
      return ok(undefined);
    } catch (error) {
      return err(Err.unknown('Failed to save account metadata', error));
    }
  },

  /**
   * Configure session security settings
   */
  configureSessionSecurity: (config: {
    sessionTimeout?: number;
    autoLogoutEnabled?: boolean;
    onSessionExpired?: () => void;
    onSessionWarning?: () => void;
  }) => {
    if (config.sessionTimeout || config.autoLogoutEnabled !== undefined) {
      secureStorage.setSessionConfig({
        sessionTimeout: config.sessionTimeout,
        autoLogoutEnabled: config.autoLogoutEnabled,
      });
    }

    if (config.onSessionExpired || config.onSessionWarning) {
      secureStorage.setSessionHandlers({
        onSessionExpired: config.onSessionExpired,
        onSessionWarning: config.onSessionWarning,
      });
    }
  },

  /**
   * Get current session status
   */
  getSessionStatus: () => secureStorage.getSessionStatus(),

  /**
   * Extend the current session
   */
  extendSession: () => secureStorage.extendSession(),
}; 