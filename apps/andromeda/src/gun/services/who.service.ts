import gun from '@/gun/core/gun';
import {
  AppError,
  createAuthError,
  createDatabaseError,
  handleZodError,
} from '@/gun/schema/errors';
import {
  Who,
  WhoAuthSchema,
  WhoCredentialsSchema,
  WhoSchema,
} from '@/gun/schema/who.schema';
import { createThingService } from '@/gun/services/thing.service';
import { Result, ok, err, ResultAsync, fromPromise, okAsync, errAsync } from 'neverthrow';

// Create the base thing service for Who
const whoThingService = createThingService(WhoSchema, 'who');

// Helper function to validate with Zod schema and handle errors
const validateSchema = <T>(schema: any, data: any): Result<T, AppError> => {
  try {
    return ok(schema.parse(data));
  } catch (error) {
    return err(handleZodError(error));
  }
};

// Signup a new user
export const signup = async (auth: {
  alias: string;
  passphrase?: string;
}): Promise<Result<Who, AppError>> => {
  const user = gun.user();
  // Validate auth data
  return validateSchema<typeof auth>(WhoAuthSchema, auth)
    .asyncAndThen(() => {
      return ResultAsync.fromPromise(
        gun.sea.pair(),
        (error) => handleZodError(error)
      ).andThen((pair) => {
        return fromPromise(
          new Promise<Who>((resolve, reject) => {
            console.log('pair: ', JSON.stringify(pair));

            user.auth(pair, async (ack: any) => {
              if (ack.err) {
                reject(createAuthError(ack.err));
                return;
              }
              
              const whoData = {
                schema: 'who',
                id: pair.pub,
                soul: pair.pub,
                createdAt: gun.state(),
                joinedAt: gun.state(),
                alias: auth.alias,
                pub: pair.pub,
                epub: pair.epub,
                priv: pair.priv,
                epriv: pair.epriv,
              };
              
              // Validate the who object
              const whoResult = validateSchema<Who>(WhoSchema, whoData);
              if (whoResult.isOk()) {
                resolve(whoResult.value);
              } else {
                reject(whoResult.error);
              }
            });
          }),
          handleZodError
        );
      });
    });
};

// Login a user
export const login = async (keyPair: string): Promise<Result<Who, AppError>> => {
  try {
    const user = gun.user();
    const pair = JSON.parse(keyPair);
    return validateSchema<any>(WhoCredentialsSchema, pair)
      .andThen(() => {
        // Implementation needs to be completed here
        user.auth(pair, async (ack: any) => {
          if (ack.err) {
            return err(createAuthError(ack.err));
          }

          console.log('login: ', ack);
          const whoData = {
            schema: 'who',
            id: pair.pub,
            soul: pair.pub,
            pub: pair.pub,
            epub: pair.epub,
            priv: pair.priv,
            epriv: pair.epriv,
          };
          
          // Validate the who object
          const whoResult = validateSchema<Who>(WhoSchema, whoData);
          if (whoResult.isOk()) {
            return ok(whoResult.value);
          } else {
            return err(whoResult.error);
          }
        });
      });
  } catch (error) {
    return err(createAuthError('Invalid key pair'));
  }
};

// Get current authenticated user
export const getCurrentUser = async (): Promise<Result<Who | null, AppError>> => {
  const credentials = gun.user().is;

  if (!credentials) {
    return ok(null);
  }

  return fromPromise(
    new Promise<Who | null>((resolve, reject) => {
      gun
        .user()
        .get('profile')
        .once((data) => {
          if (!data) {
            resolve(null);
            return;
          }

          const whoResult = validateSchema<Who>(WhoSchema, data);
          if (whoResult.isOk()) {
            resolve(whoResult.value);
          } else {
            console.error('Invalid profile data:', whoResult.error);
            resolve(null); // Resolving with null is better than rejecting here
          }
        });
    }),
    handleZodError
  );
};

// Get user by public key
export const getByPub = async (pub: string): Promise<Result<Who | null, AppError>> => {
  const result = await whoThingService.get(pub);
  
  return result.andThen((data) => {
    if (!data) return ok(null);
    return validateSchema<Who>(WhoSchema, data);
  });
};

// Logout
export const logout = (): void => {
  gun.user().leave();
};

// Update user profile
export const updateProfile = async (
  updates: Partial<
    Omit<Who, 'id' | 'pub' | 'epub' | 'alias' | 'createdAt' | 'soul' | 'schema'>
  >,
): Promise<Result<Who, AppError>> => {
  const userResult = await getCurrentUser();

  return userResult.asyncAndThen((current) => {
    if (!current) {
      return errAsync(createAuthError('Not authenticated'));
    }

    const updatedWho: Who = {
      ...current,
      ...updates,
      updatedAt: gun.state(),
    };

    // Validate and save in one go
    return validateSchema<Who>(WhoSchema, updatedWho)
      .asyncAndThen((validatedWho) => {
        return fromPromise(
          new Promise<Who>((resolve, reject) => {
            gun
              .user()
              .get('profile')
              .put(validatedWho, (ack) => {
                if (ack.err) {
                  reject(createDatabaseError(ack.err));
                } else {
                  resolve(validatedWho);
                }
              });
          }),
          handleZodError
        );
      });
  });
};

// Export Who service
export const whoService = {
  ...whoThingService,
  signup,
  login,
  logout,
  getCurrentUser,
  getByPub,
  updateProfile,
};
