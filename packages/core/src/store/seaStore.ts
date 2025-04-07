import { useState, useCallback, useEffect } from '@lynx-js/react';

// Define the state interface
interface SeaState {
  pair: any;
  enc: string;
  dec: string;
  signed: string;
  proof: string;
  check: string;
  alice: any;
  bob: any;
  sharedEnc: string;
  sharedDec: string;
}

// Initial state
const initialState: SeaState = {
  pair: null,
  enc: '',
  dec: '',
  signed: '',
  proof: '',
  check: '',
  alice: null,
  bob: null,
  sharedEnc: '',
  sharedDec: ''
};

// Create a global store instance
let state = initialState;
let listeners: (() => void)[] = [];

// Function to update the state
function setState(newState: Partial<SeaState>) {
  state = { ...state, ...newState };
  listeners.forEach(listener => listener());
}

// Hook for components to use the store
export function useSeaStore() {
  const [localState, setLocalState] = useState<SeaState>(state);

  // Register the component as a listener
  useEffect(() => {
    const listener = () => setLocalState({ ...state });
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  // Functions to update state
  const updatePair = useCallback((pair: any) => {
    setState({ pair });
  }, []);

  const updateEncryption = useCallback((enc: string, dec: string) => {
    setState({ enc, dec });
  }, []);

  const updateSigned = useCallback((signed: string) => {
    setState({ signed });
  }, []);

  const updateProofCheck = useCallback((proof: string, check: string) => {
    setState({ proof, check });
  }, []);

  const updatePeers = useCallback((alice: any, bob: any) => {
    setState({ alice, bob });
  }, []);

  const updateSharedEncryption = useCallback((sharedEnc: string, sharedDec: string) => {
    setState({ sharedEnc, sharedDec });
  }, []);

  return {
    state: localState,
    updatePair,
    updateEncryption,
    updateSigned,
    updateProofCheck,
    updatePeers,
    updateSharedEncryption
  };
} 