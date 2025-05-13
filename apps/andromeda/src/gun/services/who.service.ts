import gun from '@/gun/core/gun';
import {
  Who,
  WhoAuthSchema,
  WhoCredentialsSchema,
  WhoSchema,
} from '@/gun/schema/who.schema';
import { createThingService } from '@/gun/services/thing.service';

// Create the base thing service for Who
const whoThingService = createThingService(WhoSchema, 'who');

// Signup a new user
export const signup = async (auth: {
  alias: string;
  passphrase?: string;
}): Promise<Who> => {
  // Validate auth data
  const validAuth = WhoAuthSchema.parse(auth);

  const pair = await gun.sea.pair();
  return new Promise((resolve, reject) => {
    console.log('pair', pair);

    gun.user().auth(pair, async (ack: any) => {
      if (ack.err) {
        reject(new Error(ack.err));
        return;
      }
      const who = WhoSchema.parse({
        schema: 'who',
        id: pair.pub,
        soul: pair.pub,
        createdAt: gun.state(),
        joinedAt: gun.state(),
        alias: validAuth.alias,
        pub: pair.pub,
        epub: pair.epub,
        priv: pair.priv,
        epriv: pair.epriv,
      });
      resolve(who);
    });
  });
};

// Login a user
export const login = async (keyPair: string): Promise<Who> => {
  // Validate auth data
  console.log(keyPair);
  return new Promise((resolve, reject) => {
    try {
      const pair = JSON.parse(keyPair);
      const validAuth = WhoCredentialsSchema.parse(pair);
    } catch (error) {
      throw new Error('Invalid key pair');
    }
  });
};

// Get current authenticated user
export const getCurrentUser = async (): Promise<Who | null> => {
  const credentials = gun.user().is;

  if (!credentials) {
    return null;
  }

  return new Promise((resolve) => {
    gun
      .user()
      .get('profile')
      .once((data) => {
        if (!data) {
          resolve(null);
          return;
        }

        try {
          const validatedWho = WhoSchema.parse(data);
          resolve(validatedWho);
        } catch (error) {
          console.error('Invalid profile data:', error);
          resolve(null);
        }
      });
  });
};

// Get user by public key
export const getByPub = async (pub: string): Promise<Who | null> => {
  const data = await whoThingService.get(pub);
  if (!data) return null;
  return WhoSchema.parse(data);
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
): Promise<Who | null> => {
  const current = await getCurrentUser();

  if (!current) {
    throw new Error('Not authenticated');
  }

  const updatedWho: Who = {
    ...current,
    ...updates,
    updatedAt: gun.state(),
  };

  // Validate
  const validatedWho = WhoSchema.parse(updatedWho);

  return new Promise((resolve, reject) => {
    gun
      .user()
      .get('profile')
      .put(validatedWho, (ack) => {
        if (ack.err) {
          reject(new Error(ack.err));
        } else {
          resolve(validatedWho);
        }
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
