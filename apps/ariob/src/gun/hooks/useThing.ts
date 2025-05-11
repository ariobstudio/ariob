import { useEffect, useState } from 'react';
import { Thing } from '@/gun/schema/thing.schema';

export function useThing<T extends Thing>(
  service: {
    get: (id: string) => Promise<T | null>;
    subscribe: (id: string, callback: (data: T | null) => void) => () => void;
  },
  id: string
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;
    
    const fetchData = async () => {
      try {
        // Initial fetch
        const result = await service.get(id);
        
        if (mounted) {
          setData(result);
          setLoading(false);
        }
        
        // Subscribe to real-time updates
        unsubscribe = service.subscribe(id, (updatedData) => {
          if (mounted) {
            setData(updatedData);
          }
        });
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch data'));
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [service, id]);

  return { data, loading, error };
}
