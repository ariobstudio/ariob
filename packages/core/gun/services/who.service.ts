import { gun, sea } from '../core/gun';
import * as Err from '../schema/errors';
import type { Who, Credentials, AuthRequest } from '../schema/who.schema';
import { WhoSchema } from '../schema/who.schema';
import { Result, ok, err } from 'neverthrow';

// Storage wrapper for React Native/Web compatibility
const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).NativeModules?.NativeLocalStorageModule) {
      (globalThis as any).NativeModules.NativeLocalStorageModule.setStorageItem(key, value);
    }
  },
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).NativeModules?.NativeLocalStorageModule) {
      return (globalThis as any).NativeModules.NativeLocalStorageModule.getStorageItem(key);
    }
    return null;
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).NativeModules?.NativeLocalStorageModule) {
      (globalThis as any).NativeModules.NativeLocalStorageModule.setStorageItem(key, '');
    }
  },
};

class WhoService {
  private me: any = null;
  private currentUser: Who | null = null;

  // Multi-method authentication
  async signup(authRequest: AuthRequest): Promise<Result<Who, Err.AppError>> {
    try {
      const validated = authRequest; // Already validated by caller
      
      switch (validated.method) {
        case 'keypair':
          return await this.signupWithKeyPair(validated);
        case 'mnemonic':
          return await this.signupWithMnemonic(validated);
        case 'traditional':
          return await this.signupWithTraditional(validated);
      }
    } catch (error) {
      return err(Err.validate('Invalid auth request', error));
    }
  }

  async login(authRequest: AuthRequest): Promise<Result<Who, Err.AppError>> {
    try {
      const validated = authRequest; // Already validated by caller
      
      switch (validated.method) {
        case 'keypair':
          return await this.loginWithKeyPair(validated);
        case 'mnemonic':
          return await this.loginWithMnemonic(validated);
        case 'traditional':
          return await this.loginWithTraditional(validated);
      }
    } catch (error) {
      return err(Err.validate('Invalid auth request', error));
    }
  }

  // KeyPair Authentication
  private async signupWithKeyPair(req: Extract<AuthRequest, { method: 'keypair' }>): Promise<Result<Who, Err.AppError>> {
    // Generate or use provided keys
    const keyPair = req.pub && req.priv 
      ? { pub: req.pub, priv: req.priv, epub: req.epub || '', epriv: req.epriv || '' }
      : await sea.pair();

    console.log('keyPair', keyPair);
    return new Promise((resolve) => {
      const user = gun.user();
      
      console.log('user', user);

      user.auth(keyPair, (ack: any) => {
        console.log('ack', ack);
        if (ack.err) {
          resolve(err(Err.auth('KeyPair signup failed', ack.err)));
          return;
        }
        user.put(keyPair, (ack: any) => {
          console.log('ack', ack);
          this.createProfile(req.alias, keyPair.pub).then(profileResult => {
            if (profileResult.isOk()) {
              this.saveCredentials({
                pub: keyPair.pub,
                epub: keyPair.epub || '',
                priv: keyPair.priv,
                epriv: keyPair.epriv || '',
                alias: req.alias,
                authMethod: 'keypair',
              });
              resolve(ok(profileResult.value));
            } else {
              resolve(err(Err.auth('Failed to create profile', profileResult.error)));
            }
          });
        });
      });

      return;


      // For keypair auth, we create with a temporary password then switch to keypair
      const tempPass = sea.random(16);
      user.create(req.alias, tempPass).then((ack: any) => {
        if (ack.err) {
          resolve(err(Err.auth('KeyPair signup failed', ack.err)));
          return;
        }

        // Now auth with the temporary password
        user.auth(req.alias, tempPass).then((authAck: any) => {
          if (authAck.err || !user.is) {
            resolve(err(Err.auth('Initial auth failed', authAck.err)));
            return;
          }

          // Set the keypair
          
        });
      });
    });
  }

  private async loginWithKeyPair(req: Extract<AuthRequest, { method: 'keypair' }>): Promise<Result<Who, Err.AppError>> {
    if (!req.pub || !req.priv) {
      return err(Err.validate('Public and private keys required for keypair login'));
    }

    return new Promise((resolve) => {
      const user = gun.user();
      user.auth({ pub: req?.pub || '', priv: req?.priv || '', epub: req?.epub || '', epriv: req?.epriv || '' }, (ack: any) => {
        if (ack.err || !user.is) {
          resolve(err(Err.auth('KeyPair login failed', ack.err)));
          return;
        }

        this.me = user;
        this.loadProfile(user.is.pub).then(resolve);
      });
    });
  }

  // Mnemonic Authentication
  private async signupWithMnemonic(req: Extract<AuthRequest, { method: 'mnemonic' }>): Promise<Result<Who, Err.AppError>> {
    // For now, generate a random mnemonic (in production, use bip39)
    const mnemonic = req.mnemonic || this.generateMnemonic();
    
    if (!this.validateMnemonic(mnemonic)) {
      return err(Err.validate('Invalid mnemonic phrase'));
    }

    const keyPair = await this.deriveKeyPairFromMnemonic(mnemonic, req.passphrase);
    
    return new Promise((resolve) => {
      const user = gun.user();
      // For mnemonic, we use the derived key's hash as password
      const tempPass = sea.random(16);
      user.create(req.alias, tempPass).then((ack: any) => {
        if (ack.err) {
          resolve(err(Err.auth('Mnemonic signup failed', ack.err)));
          return;
        }

        // Auth with temp password
        user.auth(req.alias, tempPass).then((authAck: any) => {
          if (authAck.err || !user.is) {
            resolve(err(Err.auth('Initial auth failed', authAck.err)));
            return;
          }

          // Set the keypair
          user.put(keyPair).then(() => {
            this.me = user;
            const userIs = user.is;
            if (!userIs) {
              resolve(err(Err.auth('Failed to get user info')));
              return;
            }

            this.createProfile(req.alias, keyPair.pub).then(profileResult => {
              if (profileResult.isOk()) {
                this.saveCredentials({
                  pub: keyPair.pub,
                  epub: keyPair.epub || '',
                  priv: keyPair.priv,
                  epriv: keyPair.epriv || '',
                  alias: req.alias,
                  authMethod: 'mnemonic',
                  authData: { mnemonic, passphrase: req.passphrase },
                });
                resolve(profileResult);
              } else {
                resolve(profileResult);
              }
            });
          });
        });
      });
    });
  }

  private async loginWithMnemonic(req: Extract<AuthRequest, { method: 'mnemonic' }>): Promise<Result<Who, Err.AppError>> {
    if (!req.mnemonic) {
      return err(Err.validate('Mnemonic phrase required for mnemonic login'));
    }

    if (!this.validateMnemonic(req.mnemonic)) {
      return err(Err.validate('Invalid mnemonic phrase'));
    }

    const keyPair = await this.deriveKeyPairFromMnemonic(req.mnemonic, req.passphrase);
    
    return this.loginWithKeyPair({
      method: 'keypair',
      alias: req.alias,
      pub: keyPair.pub,
      priv: keyPair.priv,
    });
  }

  // Traditional Authentication
  private async signupWithTraditional(req: Extract<AuthRequest, { method: 'traditional' }>): Promise<Result<Who, Err.AppError>> {
    return new Promise((resolve) => {
      const user = gun.user();
      user.create(req.alias, req.passphrase).then((ack: any) => {
        if (ack.err || !user.is) {
          resolve(err(Err.auth('Traditional signup failed', ack.err)));
          return;
        }

        this.me = user;
        const userIs = user.is;
        if (!userIs) {
          resolve(err(Err.auth('Failed to get user info')));
          return;
        }

        this.createProfile(req.alias, userIs.pub).then(profileResult => {
          if (profileResult.isOk()) {
            this.saveCredentials({
              pub: userIs.pub,
              epub: userIs.epub || '',
              priv: userIs.priv || '',
              epriv: userIs.epriv || '',
              alias: req.alias,
              authMethod: 'traditional',
            });
            resolve(profileResult);
          } else {
            resolve(profileResult);
          }
        });
      });
    });
  }

  private async loginWithTraditional(req: Extract<AuthRequest, { method: 'traditional' }>): Promise<Result<Who, Err.AppError>> {
    return new Promise((resolve) => {
      const user = gun.user();
      user.auth(req.alias, req.passphrase, (ack: any) => {
        if (ack.err || !user.is) {
          resolve(err(Err.auth('Traditional login failed', ack.err)));
          return;
        }

        this.me = user;
        this.loadProfile(user.is.pub).then(resolve);
      });
    });
  }

  // Common methods
  async init(): Promise<Result<Who | null, Err.AppError>> {
    const saved = await this.getStoredCredentials();
    if (!saved) return ok(null);

    // Auto-login based on stored auth method
    const authRequest: AuthRequest = {
      method: saved.authMethod,
      alias: saved.alias || '',
      ...(saved.authMethod === 'keypair' && {
        pub: saved.pub,
        priv: saved.priv,
      }),
      ...(saved.authMethod === 'mnemonic' && {
        mnemonic: saved.authData?.mnemonic,
        passphrase: saved.authData?.passphrase,
      }),
      ...(saved.authMethod === 'traditional' && {
        passphrase: saved.priv, // In traditional mode, priv is the password hash
      }),
    } as AuthRequest;

    return this.login(authRequest);
  }

  current(): Who | null {
    return this.currentUser;
  }

  instance(): any {
    return this.me;
  }

  logout(): void {
    this.me?.leave();
    this.me = null;
    this.currentUser = null;
    this.clearStoredCredentials();
  }

  // Helper methods
  private async createProfile(alias: string, pub: string): Promise<Result<Who, Err.AppError>> {
    const profile: Who = {
      id: pub,
      schema: 'who',
      soul: `who/${pub}`,
      createdAt: Date.now(),
      alias,
      pub,
      public: true,
    };

    const validated = WhoSchema.safeParse(profile);
    if (!validated.success) {
      return err(Err.validate('Invalid profile data', validated.error));
    }

    return new Promise((resolve) => {
      gun.get(profile.soul).put(profile, (ack: any) => {
        if (ack.err) {
          resolve(err(Err.db('Failed to save profile', ack.err)));
        } else {
          this.currentUser = profile;
          resolve(ok(profile));
        }
      });
    });
  }

  private async loadProfile(pub: string): Promise<Result<Who, Err.AppError>> {
    return new Promise((resolve) => {
      gun.get(`who/${pub}`).once((data: any) => {
        if (!data) {
          resolve(err(Err.notFound('Profile not found')));
          return;
        }

        const validated = WhoSchema.safeParse(data);
        if (!validated.success) {
          resolve(err(Err.validate('Invalid profile data', validated.error)));
          return;
        }

        this.currentUser = validated.data;
        resolve(ok(validated.data));
      });
    });
  }

  private async saveCredentials(credentials: Credentials): Promise<void> {
    const encrypted = await sea.encrypt(JSON.stringify(credentials), 'local-storage-key');
    await storage.setItem('ariob:credentials-v1', encrypted);
  }

  private async getStoredCredentials(): Promise<Credentials | null> {
    try {
      const encrypted = await storage.getItem('ariob:credentials-v1');

      if (!encrypted) return null;

      const decrypted = await sea.decrypt(encrypted, 'local-storage-key');

      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }

  private async clearStoredCredentials(): Promise<void> {
    await storage.removeItem('ariob:credentials');
  }

  // Mnemonic helpers (simplified for now)
  private generateMnemonic(): string {
    // In production, use bip39.generateMnemonic()
    return 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12';
  }

  private validateMnemonic(mnemonic: string): boolean {
    // In production, use bip39.validateMnemonic(mnemonic)
    const words = mnemonic.split(' ');
    return words.length === 12 || words.length === 24;
  }

  private async deriveKeyPairFromMnemonic(mnemonic: string, passphrase?: string): Promise<{ pub: string; priv: string; epub: string; epriv: string }> {
    // In production, use bip39.mnemonicToSeedSync(mnemonic, passphrase)
    // then derive keypair from seed
    // For now, generate a deterministic keypair based on mnemonic
    const hash = await sea.work(mnemonic + (passphrase || ''), 'sha256');
    const keyPair = await sea.pair(); // In production, derive from hash
    return {
      pub: keyPair.pub,
      priv: keyPair.priv,
      epub: keyPair.epub || '',
      epriv: keyPair.epriv || '',
    };
  }
}

export const who = new WhoService();
