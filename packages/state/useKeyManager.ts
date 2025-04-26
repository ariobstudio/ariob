import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  id: string;
}

interface KeyManagerState {
  keys: KeyPair[];
  activeKeyId: string | null;
  // Actions
  addKey: (keyPair: KeyPair) => void;
  removeKey: (id: string) => void;
  setActiveKey: (id: string) => void;
  getActiveKey: () => KeyPair | undefined;
  clearKeys: () => void;
  generateNewKeyPair: () => Promise<KeyPair>;
}

export const useKeyManager = create<KeyManagerState>()(
  persist(
    (set, get) => ({
      keys: [],
      activeKeyId: null,
      
      addKey: (keyPair: KeyPair) => 
        set((state) => ({
          keys: [...state.keys, keyPair],
          // If this is the first key, set it as active
          activeKeyId: state.activeKeyId === null ? keyPair.id : state.activeKeyId
        })),
        
      removeKey: (id: string) => 
        set((state) => {
          const filteredKeys = state.keys.filter(key => key.id !== id);
          // If active key was removed, select the first available key as active
          const newActiveKeyId = state.activeKeyId === id 
            ? (filteredKeys.length > 0 ? filteredKeys[0].id : null)
            : state.activeKeyId;
            
          return {
            keys: filteredKeys,
            activeKeyId: newActiveKeyId
          };
        }),
        
      setActiveKey: (id: string) => 
        set((state) => {
          // Ensure the key exists before setting it as active
          const keyExists = state.keys.some(key => key.id === id);
          return {
            activeKeyId: keyExists ? id : state.activeKeyId
          };
        }),
        
      getActiveKey: () => {
        const { keys, activeKeyId } = get();
        return keys.find(key => key.id === activeKeyId);
      },
      
      clearKeys: () => set({ keys: [], activeKeyId: null }),
      
      generateNewKeyPair: async () => {
        // This is a mock implementation - in a real app you'd use
        // cryptographic libraries to generate actual keys
        const randomId = Math.random().toString(36).substring(2, 15);
        const keyPair = {
          id: randomId,
          publicKey: `pub_${randomId}`,
          privateKey: `priv_${randomId}`
        };
        
        // Add the new key pair to the state
        get().addKey(keyPair);
        return keyPair;
      }
    }),
    {
      name: 'ariob-key-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the keys and activeKeyId, not the methods
      partialize: (state) => ({ 
        keys: state.keys,
        activeKeyId: state.activeKeyId 
      }),
    }
  )
); 