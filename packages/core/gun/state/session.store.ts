import { create } from 'zustand';
import { storage } from '../lib/native-storage';
import { secureStorage } from '../services/secure-storage.service';
import type { Who } from '../schema/who.schema';
import type { Thing } from '../schema/thing.schema';

// Session data interface
export interface SessionData {
  // User session
  user: Who | null;
  isAuthenticated: boolean;
  keyPair: string | null; // Stored key pair for session persistence (encrypted)
  
  // Active things/entities being worked on
  activeThings: Thing[];
  currentThing: Thing | null;
  
  // Session metadata
  sessionId: string | null;
  lastActivity: number;
  
  // Persistence settings
  persistSession: boolean;
}

// Session actions interface
export interface SessionActions {
  // Authentication actions
  setUser: (user: Who | null, keyPair?: string) => void;
  clearUser: () => void;
  
  // Thing management actions
  setCurrentThing: (thing: Thing | null) => void;
  addActiveThing: (thing: Thing) => void;
  removeActiveThing: (thingId: string) => void;
  clearActiveThings: () => void;
  
  // Session management actions
  generateSessionId: () => void;
  updateLastActivity: () => void;
  setPersistSession: (persist: boolean) => void;
  
  // Persistence actions
  loadSession: () => Promise<void>;
  saveSession: () => Promise<void>;
  clearSession: () => Promise<void>;
  
  // Combined state getter
  getSessionState: () => SessionData;
}

// Storage keys for non-sensitive data
const STORAGE_KEYS = {
  SESSION: 'ariob_session',
  USER: 'ariob_session_user',
  ACTIVE_THINGS: 'ariob_session_active_things',
  CURRENT_THING: 'ariob_session_current_thing',
  METADATA: 'ariob_session_metadata'
} as const;

// Secure storage keys for sensitive data
const SECURE_STORAGE_KEYS = {
  KEY_PAIR: 'session_keypair'
} as const;

// Initial state
const initialState: SessionData = {
  user: null,
  isAuthenticated: false,
  keyPair: null,
  activeThings: [],
  currentThing: null,
  sessionId: null,
  lastActivity: Date.now(),
  persistSession: true
};

// Session store type
type SessionStore = SessionData & SessionActions;

// Create the session store
export const useSessionStore = create<SessionStore>()((set, get) => ({
  ...initialState,

  // Authentication actions
  setUser: (user: Who | null, keyPair?: string) => {
    const state = get();
    const newState = {
      user,
      isAuthenticated: !!user,
      keyPair: keyPair || state.keyPair,
      lastActivity: Date.now()
    };
    
    set(newState);
    
    // Auto-save if persistence is enabled
    if (state.persistSession) {
      storage.setJSON(STORAGE_KEYS.USER, user);
      if (keyPair) {
        // Store key pair securely
        secureStorage.storeEncrypted(SECURE_STORAGE_KEYS.KEY_PAIR, keyPair);
      }
      get().saveSession();
    }
  },

  clearUser: () => {
    set({
      user: null,
      isAuthenticated: false,
      keyPair: null,
      lastActivity: Date.now()
    });
    
    // Clear user data from storage
    storage.remove(STORAGE_KEYS.USER);
    secureStorage.removeSecurely(SECURE_STORAGE_KEYS.KEY_PAIR);
    get().saveSession();
  },

  // Thing management actions
  setCurrentThing: (thing: Thing | null) => {
    set({
      currentThing: thing,
      lastActivity: Date.now()
    });
    
    const state = get();
    if (state.persistSession) {
      storage.setJSON(STORAGE_KEYS.CURRENT_THING, thing);
      get().saveSession();
    }
  },

  addActiveThing: (thing: Thing) => {
    const state = get();
    const activeThings = state.activeThings.filter(t => t.id !== thing.id);
    activeThings.unshift(thing); // Add to beginning
    
    // Limit to 10 active things
    const limitedThings = activeThings.slice(0, 10);
    
    set({
      activeThings: limitedThings,
      lastActivity: Date.now()
    });
    
    if (state.persistSession) {
      storage.setJSON(STORAGE_KEYS.ACTIVE_THINGS, limitedThings);
      get().saveSession();
    }
  },

  removeActiveThing: (thingId: string) => {
    const state = get();
    const activeThings = state.activeThings.filter(t => t.id !== thingId);
    
    set({
      activeThings,
      lastActivity: Date.now()
    });
    
    if (state.persistSession) {
      storage.setJSON(STORAGE_KEYS.ACTIVE_THINGS, activeThings);
      get().saveSession();
    }
  },

  clearActiveThings: () => {
    set({
      activeThings: [],
      lastActivity: Date.now()
    });
    
    const state = get();
    if (state.persistSession) {
      storage.remove(STORAGE_KEYS.ACTIVE_THINGS);
      get().saveSession();
    }
  },

  // Session management actions
  generateSessionId: () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    set({
      sessionId,
      lastActivity: Date.now()
    });
    
    const state = get();
    if (state.persistSession) {
      get().saveSession();
    }
  },

  updateLastActivity: () => {
    set({ lastActivity: Date.now() });
    
    const state = get();
    if (state.persistSession) {
      get().saveSession();
    }
  },

  setPersistSession: (persist: boolean) => {
    set({ persistSession: persist });
    
    if (!persist) {
      // Clear storage if persistence is disabled
      get().clearSession();
    } else {
      // Save current state if persistence is enabled
      get().saveSession();
    }
  },

  // Persistence actions
  loadSession: async () => {
    try {
      // Load user data
      const user = storage.getJSON<Who | null>(STORAGE_KEYS.USER, null);
      
      // Load key pair securely
      const keyPairResult = await secureStorage.retrieveEncrypted<string>(SECURE_STORAGE_KEYS.KEY_PAIR);
      const keyPair = keyPairResult.isOk() ? keyPairResult.value : null;
      
      // Load thing data
      const activeThings = storage.getJSON<Thing[]>(STORAGE_KEYS.ACTIVE_THINGS, []);
      const currentThing = storage.getJSON<Thing | null>(STORAGE_KEYS.CURRENT_THING, null);
      
      // Load metadata with proper typing
      const metadata = storage.getJSON<{
        sessionId?: string;
        lastActivity?: number;
        persistSession?: boolean;
      }>(STORAGE_KEYS.METADATA, {});
      
      set({
        user,
        isAuthenticated: !!user,
        keyPair,
        activeThings,
        currentThing,
        sessionId: metadata.sessionId || null,
        lastActivity: metadata.lastActivity || Date.now(),
        persistSession: metadata.persistSession ?? true
      });
      
      console.log('Session loaded from storage');
    } catch (error) {
      console.error('Failed to load session from storage:', error);
      // Reset to initial state on error
      set(initialState);
    }
  },

  saveSession: async () => {
    const state = get();
    
    if (!state.persistSession) {
      return;
    }
    
    try {
      // Save metadata (non-sensitive)
      const metadata = {
        sessionId: state.sessionId,
        lastActivity: state.lastActivity,
        persistSession: state.persistSession
      };
      
      storage.setJSON(STORAGE_KEYS.METADATA, metadata);
      
      console.log('Session saved to storage');
    } catch (error) {
      console.error('Failed to save session to storage:', error);
    }
  },

  clearSession: async () => {
    // Clear all session data from storage
    Object.values(STORAGE_KEYS).forEach(key => {
      storage.remove(key);
    });
    
    // Clear secure storage
    secureStorage.removeSecurely(SECURE_STORAGE_KEYS.KEY_PAIR);
    
    // Reset state
    set(initialState);
    
    console.log('Session cleared');
  },

  // Combined state getter
  getSessionState: () => {
    const state = get();
    return {
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      keyPair: state.keyPair,
      activeThings: state.activeThings,
      currentThing: state.currentThing,
      sessionId: state.sessionId,
      lastActivity: state.lastActivity,
      persistSession: state.persistSession
    };
  }
}));

// Initialize session on store creation
useSessionStore.getState().loadSession();

// Auto-generate session ID if none exists
if (!useSessionStore.getState().sessionId) {
  useSessionStore.getState().generateSessionId();
}

// Export utility functions
export const sessionUtils = {
  // Check if session is active
  isSessionActive: (): boolean => {
    const state = useSessionStore.getState();
    return state.isAuthenticated && !!state.user;
  },
  
  // Get time since last activity
  getTimeSinceLastActivity: (): number => {
    const state = useSessionStore.getState();
    return Date.now() - state.lastActivity;
  },
  
  // Export session data (for backup/restore)
  exportSession: (): string => {
    const state = useSessionStore.getState().getSessionState();
    return JSON.stringify(state);
  },
  
  // Import session data (for backup/restore)
  importSession: (sessionData: string): boolean => {
    try {
      const data = JSON.parse(sessionData) as SessionData;
      useSessionStore.setState(data);
      useSessionStore.getState().saveSession();
      return true;
    } catch (error) {
      console.error('Failed to import session:', error);
      return false;
    }
  }
}; 