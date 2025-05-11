import { useEffect, useState } from 'react';
import gun from '@/gun/core/gun';

// Hook for real-time updates to any Gun node
export function useRealtime<T = any>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up Gun subscription
    const gunRef = gun.get(path);
    
    // Listen for changes
    gunRef.on((data) => {
      setData(data as T);
      setLoading(false);
    });
    
    // Cleanup function
    return () => {
      gunRef.off();
    };
  }, [path]);

  return { data, loading };
}
