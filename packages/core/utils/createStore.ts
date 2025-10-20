/**
 * LynxJS-Compatible Store
 *
 * Simple store implementation that works in background thread
 * without relying on React's useSyncExternalStore.
 */

import { useState, useEffect } from 'react';

type Listener = () => void;

export interface Store<T> {
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: Listener) => () => void;
}

/**
 * Create a store that works in LynxJS (both threads)
 * Store creation must work on both main and background threads for SSR
 */
export function createStore<T>(initialState: T): Store<T> {
  let state = initialState;
  const listeners = new Set<Listener>();

  const getState = () => state;

  const setState = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    'background only';

    const newPartial = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...newPartial };

    // Notify all listeners
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: Listener) => {
    'background only';
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    getState,
    setState,
    subscribe,
  };
}

/**
 * Hook to use store in React components (background thread)
 */
export function useStore<T>(store: Store<T>): T {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    'background only';

    const handleChange = () => {
      'background only';
      setState(store.getState());
    };

    return store.subscribe(handleChange);
  }, [store]);

  return state;
}

/**
 * Hook to use specific selector from store
 */
export function useStoreSelector<T, R>(
  store: Store<T>,
  selector: (state: T) => R
): R {
  const [selected, setSelected] = useState(() => selector(store.getState()));

  useEffect(() => {
    'background only';

    const handleChange = () => {
      'background only';
      setSelected(selector(store.getState()));
    };

    return store.subscribe(handleChange);
  }, [store, selector]);

  return selected;
}
