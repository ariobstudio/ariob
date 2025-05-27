import { gun, sea } from '../core/gun';
import * as Err from '../schema/errors';
import { Who, WhoAuthSchema, WhoCredentialsSchema, WhoSchema, ProfileUpdate, WhoCredentials } from '../schema/who.schema';
import { Result, ok, err } from 'neverthrow';

// Simple validation helper
const validate = <T>(schema: any, data: any): Result<T, Err.AppError> => {
  try {
    return ok(schema.parse(data));
  } catch (error) {
    return err(Err.fromZod(error));
  }
};

/**
 * Who Service
 * 
 * Simple, secure service for user identity management.
 * No over-engineering, just the essentials.
 */
export const who = {
  /**
   * Create new account (signup)
   */
  signup: async (auth: { alias: string; passphrase?: string }): Promise<Result<Who, Err.AppError>> => {
    const authCheck = validate(WhoAuthSchema, auth);
    if (authCheck.isErr()) {
      return err(authCheck.error);
    }

    try {
      // Generate key pair
      const pair = await sea.pair();
      
      return new Promise((resolve) => {
        const user = gun.user();
        
        user.auth(pair, (ack: any) => {
          if (ack.err) {
            resolve(err(Err.auth('Account creation failed: ' + ack.err)));
            return;
          }

          // Create profile
          const profile: Who = {
            id: pair.pub,
            schema: 'who',
            soul: pair.pub,
            createdAt: Date.now(),
            joinedAt: Date.now(),
            alias: auth.alias,
            pub: pair.pub,
            epub: pair.epub,
            public: true,
            version: 1,
          };

          // Validate profile
          const profileCheck = validate<Who>(WhoSchema, profile);
          if (profileCheck.isErr()) {
            resolve(err(profileCheck.error));
            return;
          }

          // Save profile to Gun
          user.get('profile').put(profile, (ack: any) => {
            if (ack.err) {
              resolve(err(Err.db('Failed to save profile: ' + ack.err)));
            } else {
              resolve(ok(profile));
            }
          });
        });
      });
    } catch (error) {
      return err(Err.unknown('Signup failed', error));
    }
  },

  /**
   * Login with credentials
   */
  login: async (credentials: string): Promise<Result<Who, Err.AppError>> => {
    try {
      const creds = JSON.parse(credentials);
      const credsCheck = validate(WhoCredentialsSchema, creds);
      if (credsCheck.isErr()) {
        return err(credsCheck.error);
      }

      return new Promise((resolve) => {
        const user = gun.user();
        
        user.auth(creds, (ack: any) => {
          if (ack.err) {
            resolve(err(Err.auth('Login failed: ' + ack.err)));
            return;
          }

          // Get profile
          user.get('profile').once((data: any) => {
            if (!data) {
              resolve(err(Err.auth('No profile found')));
              return;
            }

            const profileCheck = validate<Who>(WhoSchema, data);
            if (profileCheck.isErr()) {
              resolve(err(Err.validate('Invalid profile data')));
              return;
            }

            resolve(ok(profileCheck.value));
          });
        });
      });
    } catch (error) {
      return err(Err.unknown('Login failed', error));
    }
  },

  /**
   * Get current authenticated user
   */
  current: async (): Promise<Result<Who | null, Err.AppError>> => {
    const user = gun.user();
    if (!user.is) {
      return ok(null);
    }

    return new Promise((resolve) => {
      user.get('profile').once((data: any) => {
        if (!data) {
          resolve(ok(null));
          return;
        }

        const profileCheck = validate<Who>(WhoSchema, data);
        if (profileCheck.isErr()) {
          resolve(ok(null)); // Invalid data, treat as not logged in
          return;
        }

        resolve(ok(profileCheck.value));
      });
    });
  },

  /**
   * Get user profile by public key
   */
  get: async (pub: string): Promise<Result<Who | null, Err.AppError>> => {
    return new Promise((resolve) => {
      gun.get(pub).get('profile').once((data: any) => {
        if (!data) {
          resolve(ok(null));
          return;
        }

        const profileCheck = validate<Who>(WhoSchema, data);
        if (profileCheck.isErr()) {
          resolve(ok(null));
          return;
        }

        resolve(ok(profileCheck.value));
      });
    });
  },

  /**
   * Update current user's profile
   */
  update: async (updates: ProfileUpdate): Promise<Result<Who, Err.AppError>> => {
    const user = gun.user();
    if (!user.is) {
      return err(Err.auth('Not authenticated'));
    }

    return new Promise((resolve) => {
      user.get('profile').once((currentData: any) => {
        if (!currentData) {
          resolve(err(Err.auth('No profile found')));
          return;
        }

        const currentCheck = validate<Who>(WhoSchema, currentData);
        if (currentCheck.isErr()) {
          resolve(err(Err.validate('Invalid current profile')));
          return;
        }

        // Merge updates
        const updatedProfile = {
          ...currentCheck.value,
          ...updates,
          updatedAt: Date.now(),
        };

        const updateCheck = validate<Who>(WhoSchema, updatedProfile);
        if (updateCheck.isErr()) {
          resolve(err(updateCheck.error));
          return;
        }

        // Save updated profile
        user.get('profile').put(updatedProfile, (ack: any) => {
          if (ack.err) {
            resolve(err(Err.db('Failed to update profile: ' + ack.err)));
          } else {
            resolve(ok(updatedProfile));
          }
        });
      });
    });
  },

  /**
   * Logout current user
   */
  logout: (): void => {
    gun.user().leave();
  },

  /**
   * Get user credentials (for export/backup)
   * Returns credentials if user is authenticated
   */
  getCredentials: (): WhoCredentials | null => {
    const user = gun.user();
    if (!user.is) {
      return null;
    }

    return {
      pub: user.is.pub,
      epub: user.is.epub,
      priv: user.is.priv,
      epriv: user.is.epriv,
    };
  },
};
