/**
 * Who Service - Composable, testable, following UNIX philosophy
 *
 * This module provides a complete authentication and identity management
 * service for decentralized applications.
 *
 * @example Quick Start
 * ```typescript
 * import { who } from '@ariob/core';
 *
 * // Initialize (auto-login if credentials exist)
 * await who.init();
 *
 * // Sign up with traditional username/password
 * const result = await who.signup({
 *   method: 'traditional',
 *   alias: 'alice',
 *   passphrase: 'secure-password'
 * });
 *
 * // Sign up with keypair
 * const result2 = await who.signup({
 *   method: 'keypair',
 *   alias: 'bob',
 *   pub: 'public-key',
 *   priv: 'private-key'
 * });
 *
 * // Get current user
 * const user = who.current();
 *
 * // Log out
 * who.logout();
 * ```
 *
 * @example Advanced Usage - Custom Configuration
 * ```typescript
 * import { service, credentials, auth, profile } from '@ariob/core';
 * import { gun, sea } from '@ariob/core';
 * import { storage } from '@ariob/core';
 *
 * // Create custom Who service with different storage
 * const customStorage = new MyCustomStorage();
 * const customWho = service(gun, sea, customStorage);
 *
 * // Use low-level building blocks
 * const creds = credentials(storage(), sea);
 * await creds.save({
 *   pub: 'key',
 *   priv: 'key',
 *   alias: 'user',
 *   authMethod: 'keypair'
 * });
 * ```
 *
 * @example Testing with Custom Components
 * ```typescript
 * import { service, credentials, auth, profile } from '@ariob/core';
 * import { MockGun, MockSEA, MockStorage } from './mocks';
 *
 * // Create service with mocks for testing
 * const testWho = service(
 *   new MockGun(),
 *   new MockSEA(),
 *   new MockStorage()
 * );
 * ```
 */

// High-level singleton instance (most common use case)
export { who } from './factory';

// Service creation (for custom configurations)
export { service, type WhoService } from './service';

// Low-level building blocks (for advanced use and testing)
export { credentials, type CredentialsManager } from './credentials';
export { auth, type AuthManager, type AuthResult, type AuthMode } from './auth';
export { profile, type ProfileManager } from './profile';

// Re-export types from schema
export type { Who, Credentials, AuthRequest, ProfileUpdate } from '../../schema/who.schema';
