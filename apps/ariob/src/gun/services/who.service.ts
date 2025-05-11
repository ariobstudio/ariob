import gun from '@/gun/core/gun';
import { WhoSchema, WhoAuthSchema, Who } from '@/gun/schema/who.schema';
import { createThingService } from '@/gun/services/thing.service';

// Create the base thing service for Who
const whoThingService = createThingService(WhoSchema, 'who');

// Signup a new user
export const signup = async (auth: { alias: string; passphrase: string }): Promise<Who> => {
  // Validate auth data
  const validAuth = WhoAuthSchema.parse(auth);
  
  return new Promise((resolve, reject) => {
    gun.user().create(validAuth.alias, validAuth.passphrase, async (ack: any) => {
      if (ack.err) {
        reject(new Error(ack.err));
        return;
      }
      
      try {
        const user = await login({ alias: validAuth.alias, passphrase: validAuth.passphrase });
        resolve(user);
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Login a user
export const login = async (auth: { alias: string; passphrase: string }): Promise<Who> => {
  // Validate auth data
  const validAuth = WhoAuthSchema.parse(auth);
  
  return new Promise((resolve, reject) => {
    gun.user().auth(validAuth.alias, validAuth.passphrase, async (ack) => {
      if (ack.err) {
        reject(new Error(ack.err));
        return;
      }
      
      const credentials = gun.user().is;
      
      if (!credentials) {
        reject(new Error('Authentication failed'));
        return;
      }
      
      // Get or create the who profile
      try {
        // Try to get existing profile
        const existingWho = await getByPub(credentials.pub);
        
        if (existingWho) {
          // Update last seen
          gun.user().get('profile').get('lastSeenAt').put({ lastSeenAt: gun.state() });
          resolve(existingWho);
          return;
        }
        
        // Create new who profile
        const id = credentials.pub;
        const who: Who = {
          id,
          createdAt: gun.state(),
          updatedAt: gun.state(),
          schema: 'who',
          soul: whoThingService.makeSoul(id),
          version: 1,
          
          // User data
          alias: credentials.alias,
          pub: credentials.pub,
          epub: credentials.epub,
          joinedAt: gun.state(),
          lastSeenAt: gun.state(),
        };
        
        // Validate and create
        const validatedWho = WhoSchema.parse(who);
        
        gun.user().get('profile').put(validatedWho, (profileAck) => {
          if (profileAck.err) {
            reject(new Error(profileAck.err));
          } else {
            resolve(validatedWho);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Get current authenticated user
export const getCurrentUser = async (): Promise<Who | null> => {
  const credentials = gun.user().is;
  
  if (!credentials) {
    return null;
  }
  
  return new Promise((resolve) => {
    gun.user().get('profile').once((data) => {
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
export const updateProfile = async (updates: Partial<Omit<Who, 'id' | 'pub' | 'epub' | 'alias' | 'createdAt' | 'soul' | 'schema'>>): Promise<Who | null> => {
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
    gun.user().get('profile').put(validatedWho, (ack) => {
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
  updateProfile
};
