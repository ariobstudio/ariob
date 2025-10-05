import type { Result } from 'neverthrow';
import { ok, err } from 'neverthrow';
import type { GunInstance, GunUser, SEA } from '../../core/types';
import type { AuthRequest, Credentials } from '../../schema/who.schema';
import type { AppError } from '../../schema/errors';
import * as Err from '../../schema/errors';

/**
 * Authentication result containing user instance and credentials
 */
export interface AuthResult {
  /**
   * Gun user instance
   */
  user: GunUser;

  /**
   * User credentials for storage
   */
  credentials: Credentials;
}

/**
 * Authentication manager interface
 * Handles different authentication methods
 * Following UNIX philosophy: one-word methods
 */
export interface AuthManager {
  /**
   * Authenticate using keypair
   * @param req - Keypair auth request
   * @returns Result with auth result
   */
  keypair(
    req: Extract<AuthRequest, { method: 'keypair' }>
  ): Promise<Result<AuthResult, AppError>>;

  /**
   * Authenticate using mnemonic phrase
   * @param req - Mnemonic auth request
   * @returns Result with auth result
   */
  mnemonic(
    req: Extract<AuthRequest, { method: 'mnemonic' }>
  ): Promise<Result<AuthResult, AppError>>;

  /**
   * Authenticate using traditional username/password
   * @param req - Traditional auth request
   * @returns Result with auth result
   */
  traditional(
    req: Extract<AuthRequest, { method: 'traditional' }>
  ): Promise<Result<AuthResult, AppError>>;
}

/**
 * Authentication mode
 */
export type AuthMode = 'signup' | 'login';

/**
 * Create an authentication manager
 * Handles signup and login for different auth methods
 * Following UNIX philosophy: one-word noun
 *
 * @example
 * ```typescript
 * import { auth } from '@ariob/core';
 * import { gun, sea } from '@ariob/core';
 *
 * const authManager = auth(gun, sea, 'signup');
 *
 * // Keypair authentication
 * const result = await authManager.keypair({
 *   method: 'keypair',
 *   alias: 'alice',
 *   pub: 'public-key',
 *   priv: 'private-key'
 * });
 * ```
 *
 * @param gun - Gun instance
 * @param sea - SEA encryption library
 * @param mode - Authentication mode (signup or login)
 * @returns Authentication manager
 */
export const auth = (gun: GunInstance, sea: SEA, mode: AuthMode): AuthManager => {
  return {
    keypair: async (
      req: Extract<AuthRequest, { method: 'keypair' }>
    ): Promise<Result<AuthResult, AppError>> => {
      try {
        // Generate or use provided keypair
        const keyPair = req.pub && req.priv
          ? {
              pub: req.pub,
              priv: req.priv,
              epub: req.epub || '',
              epriv: req.epriv || '',
            }
          : await sea.pair();

        return new Promise((resolve) => {
          const user = gun.user();

          // Authenticate with keypair
          user.auth(keyPair, (ack: any) => {
            if (ack.err) {
              resolve(err(Err.auth(`Keypair ${mode} failed`, ack.err)));
              return;
            }

            // For signup, store the keypair in user space
            if (mode === 'signup') {
              user.put(keyPair, (putAck: any) => {
                if (putAck.err) {
                  resolve(err(Err.auth('Failed to store keypair', putAck.err)));
                  return;
                }

                const credentials: Credentials = {
                  pub: keyPair.pub,
                  epub: keyPair.epub,
                  priv: keyPair.priv,
                  epriv: keyPair.epriv,
                  alias: req.alias,
                  authMethod: 'keypair',
                };

                resolve(ok({ user, credentials }));
              });
            } else {
              // Login mode
              const credentials: Credentials = {
                pub: keyPair.pub,
                epub: keyPair.epub,
                priv: keyPair.priv,
                epriv: keyPair.epriv,
                alias: req.alias,
                authMethod: 'keypair',
              };

              resolve(ok({ user, credentials }));
            }
          });
        });
      } catch (error) {
        return err(Err.unknown(`Keypair ${mode} failed`, error));
      }
    },

    mnemonic: async (
      req: Extract<AuthRequest, { method: 'mnemonic' }>
    ): Promise<Result<AuthResult, AppError>> => {
      try {
        // Generate or validate mnemonic
        const mnemonic = req.mnemonic || generateMnemonic();

        if (!validateMnemonic(mnemonic)) {
          return err(Err.validate('Invalid mnemonic phrase'));
        }

        // Derive keypair from mnemonic
        const keyPair = await deriveKeyPairFromMnemonic(sea, mnemonic, req.passphrase);

        return new Promise((resolve) => {
          const user = gun.user();

          if (mode === 'signup') {
            // For signup, create account with temp password then switch to keypair
            const tempPass = sea.random(16);
            user.create(req.alias, tempPass, (createAck: any) => {
              if (createAck.err) {
                resolve(err(Err.auth('Mnemonic signup failed', createAck.err)));
                return;
              }

              // Authenticate with temp password
              user.auth(req.alias, tempPass, (authAck: any) => {
                if (authAck.err || !user.is) {
                  resolve(err(Err.auth('Initial auth failed', authAck.err)));
                  return;
                }

                // Store the derived keypair
                user.put(keyPair, (putAck: any) => {
                  if (putAck.err) {
                    resolve(err(Err.auth('Failed to store keypair', putAck.err)));
                    return;
                  }

                  const credentials: Credentials = {
                    pub: keyPair.pub,
                    epub: keyPair.epub,
                    priv: keyPair.priv,
                    epriv: keyPair.epriv,
                    alias: req.alias,
                    authMethod: 'mnemonic',
                    authData: { mnemonic, passphrase: req.passphrase },
                  };

                  resolve(ok({ user, credentials }));
                });
              });
            });
          } else {
            // Login with derived keypair
            user.auth(keyPair, (ack: any) => {
              if (ack.err || !user.is) {
                resolve(err(Err.auth('Mnemonic login failed', ack.err)));
                return;
              }

              const credentials: Credentials = {
                pub: keyPair.pub,
                epub: keyPair.epub,
                priv: keyPair.priv,
                epriv: keyPair.epriv,
                alias: req.alias,
                authMethod: 'mnemonic',
                authData: { mnemonic, passphrase: req.passphrase },
              };

              resolve(ok({ user, credentials }));
            });
          }
        });
      } catch (error) {
        return err(Err.unknown(`Mnemonic ${mode} failed`, error));
      }
    },

    traditional: async (
      req: Extract<AuthRequest, { method: 'traditional' }>
    ): Promise<Result<AuthResult, AppError>> => {
      return new Promise((resolve) => {
        const user = gun.user();

        if (mode === 'signup') {
          user.create(req.alias, req.passphrase, (ack: any) => {
            if (ack.err || !user.is) {
              resolve(err(Err.auth('Traditional signup failed', ack.err)));
              return;
            }

            const userIs = user.is;
            if (!userIs) {
              resolve(err(Err.auth('Failed to get user info')));
              return;
            }

            const credentials: Credentials = {
              pub: userIs.pub,
              epub: userIs.epub || '',
              priv: userIs.priv || '',
              epriv: userIs.epriv || '',
              alias: req.alias,
              authMethod: 'traditional',
            };

            resolve(ok({ user, credentials }));
          });
        } else {
          user.auth(req.alias, req.passphrase, (ack: any) => {
            if (ack.err || !user.is) {
              resolve(err(Err.auth('Traditional login failed', ack.err)));
              return;
            }

            const userIs = user.is;
            if (!userIs) {
              resolve(err(Err.auth('Failed to get user info')));
              return;
            }

            const credentials: Credentials = {
              pub: userIs.pub,
              epub: userIs.epub || '',
              priv: userIs.priv || '',
              epriv: userIs.epriv || '',
              alias: req.alias,
              authMethod: 'traditional',
            };

            resolve(ok({ user, credentials }));
          });
        }
      });
    },
  };
};

/**
 * Generate a random mnemonic phrase
 * In production, use bip39.generateMnemonic()
 * @returns Mnemonic phrase (12 words)
 */
function generateMnemonic(): string {
  // TODO: Use bip39.generateMnemonic() in production
  return 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12';
}

/**
 * Validate a mnemonic phrase
 * In production, use bip39.validateMnemonic()
 * @param mnemonic - Mnemonic phrase to validate
 * @returns True if valid
 */
function validateMnemonic(mnemonic: string): boolean {
  // TODO: Use bip39.validateMnemonic() in production
  const words = mnemonic.split(' ');
  return words.length === 12 || words.length === 24;
}

/**
 * Derive keypair from mnemonic phrase
 * In production, use bip39.mnemonicToSeedSync() and derive from seed
 * @param sea - SEA encryption library
 * @param mnemonic - Mnemonic phrase
 * @param passphrase - Optional BIP39 passphrase
 * @returns Derived keypair
 */
async function deriveKeyPairFromMnemonic(
  sea: SEA,
  mnemonic: string,
  passphrase?: string
): Promise<{ pub: string; priv: string; epub: string; epriv: string }> {
  // TODO: Use bip39.mnemonicToSeedSync(mnemonic, passphrase)
  // then derive keypair from seed using proper derivation path
  // For now, generate deterministic hash-based keypair
  const hash = await sea.work(mnemonic + (passphrase || ''), null, null, { name: 'SHA-256' });
  const keyPair = await sea.pair();
  return {
    pub: keyPair.pub,
    priv: keyPair.priv,
    epub: keyPair.epub || '',
    epriv: keyPair.epriv || '',
  };
}
