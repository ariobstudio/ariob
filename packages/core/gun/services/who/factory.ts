import { gun, sea } from '../../core/gun';
import { storage } from '../../lib/storage';
import { service, type WhoService } from './service';

/**
 * Singleton Who service instance
 * Pre-configured with Gun, SEA, and Storage
 * Following UNIX philosophy: one-word noun
 *
 * @example
 * ```typescript
 * import { who } from '@ariob/core';
 *
 * // Initialize service (auto-login if credentials exist)
 * await who.init();
 *
 * // Sign up new user
 * const result = await who.signup({
 *   method: 'traditional',
 *   alias: 'alice',
 *   passphrase: 'secure-password'
 * });
 *
 * // Get current user
 * const user = who.current();
 *
 * // Log out
 * who.logout();
 * ```
 */
export const who: WhoService = service(gun, sea, storage());
