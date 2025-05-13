// src/gun/schema/who.schema.ts
import { z } from 'zod';
import { ThingSchema } from './thing.schema';

/**
 * Who Schema
 *
 * This is the schema for a who.
 *
 * A who is a thing that represents a user.
 *
 * Properties
 * alias: The alias of the user.
 * pub: The public key of the user.
 * epub: The elliptic public key of the user.
 * displayName: The display name of the user.
 * bio: The bio of the user.
 * avatar: The avatar of the user.
 *
 * Settings
 * settings: The settings of the user.
 *
 * Stats
 * joinedAt: The date and time the user joined the network.
 * lastSeenAt: The date and time the user was last seen.
 */
export const WhoSchema = ThingSchema.extend({
  schema: z.literal('who'),
  alias: z.string().min(3).max(50),
  pub: z.string().min(1),
  epub: z.string().min(1),
  priv: z.string().min(1),
  epriv: z.string().min(1),

  // Profile data
  displayName: z.string().max(50).optional(),
  bio: z.string().max(1000).optional(),
  avatar: z.string().optional(),

  // Settings
  settings: z.record(z.string(), z.any()).optional(),

  // Stats
  joinedAt: z.number(),
  lastSeenAt: z.number().optional(),
});

export type Who = z.infer<typeof WhoSchema>;

/**
 * Who Auth Schema
 *
 * This is the schema for the authentication data of a who.
 * (Not stored in the database)
 *
 * Properties
 * alias: The alias of the user.
 * passphrase: The passphrase of the user.
 * or
 *
 * WhoCredentials
 * pub: The public key of the user.
 * epub: The elliptic public key of the user.
 * priv: The private key of the user.
 * epriv: The elliptic private key of the user.
 */
export const WhoAuthSchema = z.object({
  alias: z.string().min(3).max(50),
  passphrase: z.string().min(8).optional(),
});

export type WhoAuth = z.infer<typeof WhoAuthSchema>;

/**
 * Who Credentials Schema
 *
 * This is turned from Gun.user().is
 *
 * Properties
 * alias: The alias of the user.
 * pub: The public key of the user.
 * epub: The elliptic public key of the user.
 * priv: The private key of the user.
 * epriv: The elliptic private key of the user.
 */
export const WhoCredentialsSchema = z.object({
  alias: z.string().optional(),
  pub: z.string(),
  epub: z.string(),
  priv: z.string(),
  epriv: z.string(),
});

export type WhoCredentials = z.infer<typeof WhoCredentialsSchema>;
