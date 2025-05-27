/**
 * Secure Storage Service
 * Provides encrypted storage for sensitive user data and cryptographic materials
 */

import { storage } from '../lib/native-storage';
import { sea } from '../core/gun';
import { Result, ok, err } from 'neverthrow';
import * as Err from '../schema/errors';

// Storage configuration
const STORAGE_CONFIG = {
  // Storage keys
  ENCRYPTED_DATA_PREFIX: 'ariob_encrypted_',
  INTEGRITY_PREFIX: 'ariob_integrity_',
  SESSION_CONFIG_KEY: 'ariob_session_config',
  
  // Security settings
  SESSION_TIMEOUT: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
  AUTO_LOGOUT_WARNING: 15 * 60 * 1000, // 15 minutes warning
  INTEGRITY_ALGORITHM: 'SHA-256',
  
  // Encryption settings
  ENCRYPTION_ALGORITHM: 'AES-GCM',
  KEY_DERIVATION: 'PBKDF2',
} as const;

// Encrypted data structure
interface EncryptedData {
  data: string; // SEA encrypted data
  timestamp: number;
  version: string;
}

// Session configuration
interface SessionConfig {
  lastActivity: number;
  sessionTimeout: number;
  autoLogoutEnabled: boolean;
  rememberSession: boolean;
}

// Integrity verification data
interface IntegrityData {
  hash: string;
  algorithm: string;
  timestamp: number;
}

export class SecureStorageService {
  private sessionConfig: SessionConfig = {
    lastActivity: Date.now(),
    sessionTimeout: STORAGE_CONFIG.SESSION_TIMEOUT,
    autoLogoutEnabled: true,
    rememberSession: true,
  };

  private autoLogoutTimer?: number;
  private warningTimer?: number;
  private onSessionExpired?: () => void;
  private onSessionWarning?: () => void;

  constructor() {
    this.loadSessionConfig();
    this.startSessionMonitoring();
  }

  /**
   * Store encrypted data with integrity verification
   */
  async storeEncrypted(
    key: string,
    data: any,
    encryptionKey?: string
  ): Promise<Result<void, Err.AppError>> {
    try {
      // Generate or use provided encryption key
      const encKey = encryptionKey || await this.generateStorageKey();
      
      // Encrypt the data using SEA
      const encrypted = await sea.encrypt(data, encKey);
      if (!encrypted) {
        return err(Err.unknown('Failed to encrypt data'));
      }

      // Create encrypted data structure
      const encryptedData: EncryptedData = {
        data: encrypted,
        timestamp: Date.now(),
        version: '1.0',
      };

      // Generate integrity hash
      const integrityResult = await this.generateIntegrityHash(encryptedData);
      if (integrityResult.isErr()) {
        return err(integrityResult.error);
      }

      // Store encrypted data
      const storageKey = STORAGE_CONFIG.ENCRYPTED_DATA_PREFIX + key;
      storage.setJSON(storageKey, encryptedData);

      // Store integrity data
      const integrityKey = STORAGE_CONFIG.INTEGRITY_PREFIX + key;
      storage.setJSON(integrityKey, integrityResult.value);

      // Update activity timestamp
      this.updateActivity();

      return ok(undefined);
    } catch (error) {
      return err(Err.unknown('Failed to store encrypted data', error));
    }
  }

  /**
   * Retrieve and decrypt data with integrity verification
   */
  async retrieveEncrypted<T>(
    key: string,
    encryptionKey?: string
  ): Promise<Result<T | null, Err.AppError>> {
    try {
      const storageKey = STORAGE_CONFIG.ENCRYPTED_DATA_PREFIX + key;
      const integrityKey = STORAGE_CONFIG.INTEGRITY_PREFIX + key;

      // Get encrypted data
      const encryptedData = storage.getJSON<EncryptedData | null>(storageKey, null);
      if (!encryptedData) {
        return ok(null);
      }

      // Verify integrity
      const integrityData = storage.getJSON<IntegrityData | null>(integrityKey, null);
      if (integrityData) {
        const verifyResult = await this.verifyIntegrity(encryptedData, integrityData);
        if (verifyResult.isErr()) {
          // Data may be corrupted, remove it
          this.removeSecurely(key);
          return err(verifyResult.error);
        }
      }

      // Decrypt the data
      const decKey = encryptionKey || await this.generateStorageKey();
      const decrypted = await sea.decrypt(encryptedData.data, decKey);
      
      if (decrypted === undefined) {
        return err(Err.unknown('Failed to decrypt data'));
      }

      // Update activity timestamp
      this.updateActivity();

      return ok(decrypted);
    } catch (error) {
      return err(Err.unknown('Failed to retrieve encrypted data', error));
    }
  }

  /**
   * Securely remove data and its integrity information
   */
  removeSecurely(key: string): void {
    const storageKey = STORAGE_CONFIG.ENCRYPTED_DATA_PREFIX + key;
    const integrityKey = STORAGE_CONFIG.INTEGRITY_PREFIX + key;
    
    storage.remove(storageKey);
    storage.remove(integrityKey);
    
    this.updateActivity();
  }

  /**
   * Store recovery information securely
   */
  async storeRecoveryInfo(
    accountId: string,
    recoveryData: {
      recoveryCode?: string;
      backupPhrases?: string[];
      securityQuestions?: Array<{ question: string; answer: string }>;
    }
  ): Promise<Result<void, Err.AppError>> {
    try {
      // Generate a recovery-specific encryption key
      const recoveryKey = await this.generateRecoveryKey(accountId);
      
      // Store recovery data encrypted
      const recoveryResult = await this.storeEncrypted(
        `recovery_${accountId}`,
        recoveryData,
        recoveryKey
      );

      return recoveryResult;
    } catch (error) {
      return err(Err.unknown('Failed to store recovery information', error));
    }
  }

  /**
   * Retrieve recovery information
   */
  async getRecoveryInfo(accountId: string): Promise<Result<any, Err.AppError>> {
    try {
      const recoveryKey = await this.generateRecoveryKey(accountId);
      return this.retrieveEncrypted(`recovery_${accountId}`, recoveryKey);
    } catch (error) {
      return err(Err.unknown('Failed to retrieve recovery information', error));
    }
  }

  /**
   * Configure session timeout settings
   */
  setSessionConfig(config: Partial<SessionConfig>): void {
    this.sessionConfig = { ...this.sessionConfig, ...config };
    this.saveSessionConfig();
    
    if (config.sessionTimeout || config.autoLogoutEnabled !== undefined) {
      this.restartSessionMonitoring();
    }
  }

  /**
   * Get current session status
   */
  getSessionStatus(): {
    isActive: boolean;
    timeRemaining: number;
    lastActivity: number;
  } {
    const now = Date.now();
    const timeElapsed = now - this.sessionConfig.lastActivity;
    const timeRemaining = Math.max(0, this.sessionConfig.sessionTimeout - timeElapsed);
    
    return {
      isActive: timeRemaining > 0,
      timeRemaining,
      lastActivity: this.sessionConfig.lastActivity,
    };
  }

  /**
   * Set session event handlers
   */
  setSessionHandlers(handlers: {
    onSessionExpired?: () => void;
    onSessionWarning?: () => void;
  }): void {
    this.onSessionExpired = handlers.onSessionExpired;
    this.onSessionWarning = handlers.onSessionWarning;
  }

  /**
   * Manually extend session
   */
  extendSession(): void {
    this.updateActivity();
    this.restartSessionMonitoring();
  }

  /**
   * Clear all secure storage
   */
  clearAllSecureData(): void {
    // Remove all encrypted data by clearing storage entirely
    // This is a simplified approach - in production, you might want to be more selective
    storage.clear();
  }

  // Private methods

  private async generateStorageKey(): Promise<string> {
    // Generate a device-specific key for encryption
    // This should be consistent for the same device but unique per device
    const deviceId = await this.getDeviceId();
    return await sea.work(deviceId, 'ariob_storage_salt');
  }

  private async generateRecoveryKey(accountId: string): Promise<string> {
    // Generate a recovery-specific key
    const deviceId = await this.getDeviceId();
    return await sea.work(accountId + deviceId, 'ariob_recovery_salt');
  }

  private async getDeviceId(): Promise<string> {
    // Try to get a device-specific identifier
    // This is a simplified version - in production, you'd want a more robust device ID
    let deviceId = storage.getString('ariob_device_id');
    
    if (!deviceId) {
      // Generate a new device ID
      const newDeviceId = await sea.work(Date.now() + Math.random(), 'device_id_salt');
      storage.setString('ariob_device_id', newDeviceId);
      return newDeviceId;
    }
    
    return deviceId;
  }

  private async generateIntegrityHash(data: EncryptedData): Promise<Result<IntegrityData, Err.AppError>> {
    try {
      const dataString = JSON.stringify(data);
      const hash = await sea.work(dataString, null, { name: STORAGE_CONFIG.INTEGRITY_ALGORITHM });
      
      return ok({
        hash,
        algorithm: STORAGE_CONFIG.INTEGRITY_ALGORITHM,
        timestamp: Date.now(),
      });
    } catch (error) {
      return err(Err.unknown('Failed to generate integrity hash', error));
    }
  }

  private async verifyIntegrity(
    data: EncryptedData,
    integrity: IntegrityData
  ): Promise<Result<void, Err.AppError>> {
    try {
      const dataString = JSON.stringify(data);
      const computedHash = await sea.work(dataString, null, { name: integrity.algorithm });
      
      if (computedHash !== integrity.hash) {
        return err(Err.validate('Data integrity verification failed'));
      }
      
      return ok(undefined);
    } catch (error) {
      return err(Err.unknown('Failed to verify data integrity', error));
    }
  }

  private updateActivity(): void {
    this.sessionConfig.lastActivity = Date.now();
    this.saveSessionConfig();
  }

  private loadSessionConfig(): void {
    const stored = storage.getJSON<SessionConfig | null>(STORAGE_CONFIG.SESSION_CONFIG_KEY, null);
    if (stored) {
      this.sessionConfig = { ...this.sessionConfig, ...stored };
    }
  }

  private saveSessionConfig(): void {
    storage.setJSON(STORAGE_CONFIG.SESSION_CONFIG_KEY, this.sessionConfig);
  }

  private startSessionMonitoring(): void {
    if (!this.sessionConfig.autoLogoutEnabled) {
      return;
    }

    this.restartSessionMonitoring();
  }

  private restartSessionMonitoring(): void {
    // Clear existing timers
    if (this.autoLogoutTimer) {
      clearTimeout(this.autoLogoutTimer);
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }

    if (!this.sessionConfig.autoLogoutEnabled) {
      return;
    }

    const now = Date.now();
    const timeElapsed = now - this.sessionConfig.lastActivity;
    const timeRemaining = Math.max(0, this.sessionConfig.sessionTimeout - timeElapsed);

    if (timeRemaining <= 0) {
      // Session already expired
      this.handleSessionExpired();
      return;
    }

    // Set warning timer
    const warningTime = Math.max(0, timeRemaining - STORAGE_CONFIG.AUTO_LOGOUT_WARNING);
    if (warningTime > 0) {
      this.warningTimer = setTimeout(() => {
        this.onSessionWarning?.();
      }, warningTime) as unknown as number;
    }

    // Set logout timer
    this.autoLogoutTimer = setTimeout(() => {
      this.handleSessionExpired();
    }, timeRemaining) as unknown as number;
  }

  private handleSessionExpired(): void {
    this.clearAllSecureData();
    this.onSessionExpired?.();
  }
}

// Export singleton instance
export const secureStorage = new SecureStorageService(); 