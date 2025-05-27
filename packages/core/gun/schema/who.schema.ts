// src/gun/schema/who.schema.ts
import { z } from 'zod';

/**
 * Who Schema (Public Profile)
 * 
 * This schema defines the PUBLIC profile data that gets stored in Gun.
 * SECURITY: Private keys are NEVER included in this schema.
 */
export const WhoSchema = z.object({
  // Core identity (stored in Gun)
  id: z.string().min(1), // Same as pub for simplicity
  schema: z.literal('who'),
  soul: z.string().min(1), // Gun soul path
  
  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number().optional(),
  joinedAt: z.number(),
  lastSeenAt: z.number().optional(),
  
  // Public identity
  alias: z.string().min(3).max(50),
  pub: z.string().min(1), // Public key - safe to store
  epub: z.string().min(1), // Elliptic public key - safe to store
  
  // Profile data (all optional)
  displayName: z.string().max(50).optional(),
  bio: z.string().max(1000).optional(),
  avatar: z.string().optional(),
  location: z.string().max(100).optional(),
  website: z.string().max(200).optional(),
  
  // Settings (non-sensitive)
  settings: z.record(z.string(), z.any()).optional(),
  
  // Access control
  public: z.boolean().default(true),
  version: z.number().default(1),
});

export type Who = z.infer<typeof WhoSchema>;

/**
 * Who Credentials Schema (NEVER stored in database)
 * 
 * This contains the full key pair including private keys.
 * Used only for authentication and local storage.
 * SECURITY: This data must be encrypted before any storage.
 */
export const WhoCredentialsSchema = z.object({
  pub: z.string(),
  epub: z.string(),
  priv: z.string(), // Private key - NEVER store unencrypted
  epriv: z.string(), // Elliptic private key - NEVER store unencrypted
  alias: z.string().optional(),
});

export type WhoCredentials = z.infer<typeof WhoCredentialsSchema>;

/**
 * Who Auth Schema
 * 
 * For authentication operations (signup/login).
 */
export const WhoAuthSchema = z.object({
  alias: z.string().min(3).max(50),
  passphrase: z.string().min(8).optional(),
});

export type WhoAuth = z.infer<typeof WhoAuthSchema>;

/**
 * Profile Update Schema
 * 
 * For updating profile information (subset of Who).
 */
export const ProfileUpdateSchema = z.object({
  displayName: z.string().max(50).optional(),
  bio: z.string().max(1000).optional(),
  avatar: z.string().optional(),
  location: z.string().max(100).optional(),
  website: z.string().max(200).optional(),
  settings: z.record(z.string(), z.any()).optional(),
}).partial();

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
