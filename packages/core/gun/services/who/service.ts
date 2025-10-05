import type { Result } from 'neverthrow';
import { ok, err } from 'neverthrow';
import type { GunInstance, GunUser, SEA } from '../../core/types';
import type { Storage } from '../../lib/storage';
import type { Who, AuthRequest } from '../../schema/who.schema';
import type { AppError } from '../../schema/errors';
import * as Err from '../../schema/errors';
import { credentials, type CredentialsManager } from './credentials';
import { auth, type AuthManager } from './auth';
import { profile, type ProfileManager } from './profile';

/**
 * Who service interface
 * Main authentication and profile management service
 * Following UNIX philosophy: composed from smaller modules
 */
export interface WhoService {
  /**
   * Initialize service with stored credentials
   * Attempts to auto-login if credentials exist
   * @returns Result with current user or null if not logged in
   */
  init(): Promise<Result<Who | null, AppError>>;

  /**
   * Sign up a new user
   * @param request - Authentication request
   * @returns Result with user profile
   */
  signup(request: AuthRequest): Promise<Result<Who, AppError>>;

  /**
   * Log in an existing user
   * @param request - Authentication request
   * @returns Result with user profile
   */
  login(request: AuthRequest): Promise<Result<Who, AppError>>;

  /**
   * Log out current user
   * Clears credentials and session
   */
  logout(): void;

  /**
   * Get current authenticated user
   * @returns Current user or null if not logged in
   */
  current(): Who | null;

  /**
   * Get Gun user instance
   * @returns Gun user instance or null if not logged in
   */
  instance(): GunUser | null;

  /**
   * Expose credentials manager for advanced use
   */
  credentials: CredentialsManager;

  /**
   * Expose profile manager for advanced use
   */
  profile: ProfileManager;
}

/**
 * Create a Who service
 * Composes credentials, auth, and profile managers
 * Following UNIX philosophy: one-word verb
 *
 * @example
 * ```typescript
 * import { service } from '@ariob/core';
 * import { gun, sea } from '@ariob/core';
 * import { storage } from '@ariob/core';
 *
 * const whoService = service(gun, sea, storage());
 *
 * // Initialize (auto-login if credentials exist)
 * await whoService.init();
 *
 * // Sign up new user
 * const result = await whoService.signup({
 *   method: 'traditional',
 *   alias: 'alice',
 *   passphrase: 'secure-password'
 * });
 *
 * // Get current user
 * const user = whoService.current();
 *
 * // Log out
 * whoService.logout();
 * ```
 *
 * @param gun - Gun instance
 * @param sea - SEA encryption library
 * @param store - Storage implementation
 * @returns Who service
 */
export const service = (gun: GunInstance, sea: SEA, store: Storage): WhoService => {
  // Internal state
  let currentUser: Who | null = null;
  let userInstance: GunUser | null = null;

  // Create managers
  const creds = credentials(store, sea);
  const profileMgr = profile(gun);

  return {
    init: async (): Promise<Result<Who | null, AppError>> => {
      // Load saved credentials
      const savedResult = await creds.load();
      if (savedResult.isErr()) return err(savedResult.error);

      const saved = savedResult.value;
      if (!saved) return ok(null);

      // Auto-login with saved credentials
      const authRequest: AuthRequest = {
        method: saved.authMethod,
        alias: saved.alias || '',
        ...(saved.authMethod === 'keypair' && {
          pub: saved.pub,
          priv: saved.priv,
          epub: saved.epub,
          epriv: saved.epriv,
        }),
        ...(saved.authMethod === 'mnemonic' && {
          mnemonic: saved.authData?.mnemonic,
          passphrase: saved.authData?.passphrase,
        }),
        ...(saved.authMethod === 'traditional' && {
          passphrase: saved.priv, // In traditional mode, priv stores password hash
        }),
      } as AuthRequest;

      // Use login logic
      const loginMgr = auth(gun, sea, 'login');

      let authResult: Result<{ user: GunUser; credentials: any }, AppError>;
      switch (saved.authMethod) {
        case 'keypair':
          authResult = await loginMgr.keypair(authRequest as Extract<AuthRequest, { method: 'keypair' }>);
          break;
        case 'mnemonic':
          authResult = await loginMgr.mnemonic(authRequest as Extract<AuthRequest, { method: 'mnemonic' }>);
          break;
        case 'traditional':
          authResult = await loginMgr.traditional(authRequest as Extract<AuthRequest, { method: 'traditional' }>);
          break;
      }

      if (authResult.isErr()) return err(authResult.error);

      userInstance = authResult.value.user;

      // Load profile
      const profileResult = await profileMgr.get(saved.pub);
      if (profileResult.isErr()) return err(profileResult.error);

      currentUser = profileResult.value;
      return ok(currentUser);
    },

    signup: async (request: AuthRequest): Promise<Result<Who, AppError>> => {
      const signupMgr = auth(gun, sea, 'signup');

      // Execute appropriate signup method
      let authResult: Result<{ user: GunUser; credentials: any }, AppError>;
      switch (request.method) {
        case 'keypair':
          authResult = await signupMgr.keypair(request);
          break;
        case 'mnemonic':
          authResult = await signupMgr.mnemonic(request);
          break;
        case 'traditional':
          authResult = await signupMgr.traditional(request);
          break;
      }

      if (authResult.isErr()) return err(authResult.error);

      const { user, credentials: authCreds } = authResult.value;
      userInstance = user;

      // Create profile
      const profileResult = await profileMgr.create(request.alias, authCreds.pub);
      if (profileResult.isErr()) return err(profileResult.error);

      currentUser = profileResult.value;

      // Save credentials
      await creds.save(authCreds);

      return ok(currentUser);
    },

    login: async (request: AuthRequest): Promise<Result<Who, AppError>> => {
      const loginMgr = auth(gun, sea, 'login');

      // Execute appropriate login method
      let authResult: Result<{ user: GunUser; credentials: any }, AppError>;
      switch (request.method) {
        case 'keypair':
          authResult = await loginMgr.keypair(request);
          break;
        case 'mnemonic':
          authResult = await loginMgr.mnemonic(request);
          break;
        case 'traditional':
          authResult = await loginMgr.traditional(request);
          break;
      }

      if (authResult.isErr()) return err(authResult.error);

      const { user, credentials: authCreds } = authResult.value;
      userInstance = user;

      // Load profile
      const profileResult = await profileMgr.get(authCreds.pub);
      if (profileResult.isErr()) return err(profileResult.error);

      currentUser = profileResult.value;

      // Ensure we have a valid profile
      if (!currentUser) {
        return err(Err.auth('Profile not found after login'));
      }

      // Save credentials
      await creds.save(authCreds);

      return ok(currentUser);
    },

    logout: (): void => {
      userInstance?.leave();
      userInstance = null;
      currentUser = null;
      creds.clear();
    },

    current: (): Who | null => {
      return currentUser;
    },

    instance: (): GunUser | null => {
      return userInstance;
    },

    credentials: creds,
    profile: profileMgr,
  };
};
