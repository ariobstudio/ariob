import { useState, useEffect, useCallback, useRef } from 'react';
import { gunService } from '../data/gunService';

/**
 * Custom hook for subscribing to Gun data in React components
 * Inspired by ChainGun patterns for better Gun integration
 * 
 * @param path Gun path as a string or array of path segments
 * @param options Configuration options
 * @returns [data, put, loading, error]
 */
export function useGun<T = any>(
  path: string | string[],
  options: {
    live?: boolean; // Whether to subscribe to real-time updates
    initialValue?: T; // Initial value before Gun data loads
  } = {}
) {
  const { live = true, initialValue = null } = options;
  
  // State for data, loading status, and errors
  const [data, setData] = useState<T | null>(initialValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Store subscriptions to clean up on unmount
  const subscriptionRef = useRef<{ off?: () => void }>({});
  
  // Build the Gun reference path
  const getRef = useCallback(() => {
    if (typeof path === 'string') {
      return gunService.path(path);
    } else if (Array.isArray(path)) {
      let ref = gunService.getGun();
      for (const segment of path) {
        ref = ref.get(segment);
      }
      return ref;
    }
    throw new Error('Invalid path: must be string or string array');
  }, [path]);

  // Function to put data into Gun
  const put = useCallback(async (newData: Partial<T>) => {
    try {
      const ref = getRef();
      return await gunService.put(ref, newData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [getRef]);

  // Set up subscription to Gun data
  useEffect(() => {
    const ref = getRef();
    setLoading(true);
    
    // First get data once
    ref.once((value: T) => {
      if (value) {
        setData(value);
      }
      setLoading(false);
    });
    
    // Then subscribe to updates if live option is true
    if (live) {
      // Store the subscription to allow unsubscribing
      subscriptionRef.current.off = ref.on((value: T, key) => {
        if (value) {
          setData(value);
        }
      });
    }
    
    // Clean up subscription on unmount
    return () => {
      if (subscriptionRef.current.off) {
        subscriptionRef.current.off();
      }
    };
  }, [getRef, live]);
  
  return [data, put, loading, error] as [T | null, typeof put, boolean, Error | null];
}

export default useGun;
