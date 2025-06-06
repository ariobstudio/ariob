// src/gun/schema/who.schema.ts
import { z } from 'zod';

/**
 * Who Schema - Generic identity for decentralized platforms
 * This schema defines the PUBLIC profile data that gets stored in Gun.
 * SECURITY: Private keys are NEVER included in this schema.
 */
export const WhoSchema = z.object({
  // Core
  id: z.string().min(1),           // Same as pub
  schema: z.literal('who'),
  soul: z.string().min(1),         // "who/publicKey"
  
  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number().optional(),
  
  // Identity
  alias: z.string().min(1).max(50), // User identifier
  pub: z.string().min(1),          // Public key
  
  // Optional
  displayName: z.string().max(100).optional(),
  avatar: z.string().optional(),   // Avatar URL or hash
  
  public: z.boolean().default(true),
});

export type Who = z.infer<typeof WhoSchema>;

/**
 * Credentials Schema - Multiple auth method support 
 * NEVER store in Gun - only in encrypted local storage
 */
export const CredentialsSchema = z.object({
  pub: z.string(),
  epub: z.string(),
  priv: z.string(), // Private key - NEVER store unencrypted
  epriv: z.string(), // Elliptic private key - NEVER store unencrypted
  alias: z.string().optional(),
  authMethod: z.enum(['keypair', 'mnemonic', 'traditional']),
  // Method-specific data stored encrypted
  authData: z.record(z.any()).optional(),
});

export type Credentials = z.infer<typeof CredentialsSchema>;

/**
 * Auth Request Schema - For signup/login
 */
export const AuthRequestSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('keypair'),
    alias: z.string().min(1).max(50),
    pub: z.string().optional(),
    priv: z.string().optional(),
    epub: z.string().optional(),
    epriv: z.string().optional(),
  }),
  z.object({
    method: z.literal('mnemonic'),
    alias: z.string().min(1).max(50),
    mnemonic: z.string().optional(),   // For login/recovery
    passphrase: z.string().optional(), // Optional BIP39 passphrase
  }),
  z.object({
    method: z.literal('traditional'),
    alias: z.string().min(1).max(50),
    passphrase: z.string().min(1),     // Password
  }),
]);

export type AuthRequest = z.infer<typeof AuthRequestSchema>;

/**
 * Profile Update Schema
 * 
 * For updating profile information (subset of Who).
 */
export const ProfileUpdateSchema = z.object({
  displayName: z.string().max(100).optional(),
  avatar: z.string().optional(),
}).partial();

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
