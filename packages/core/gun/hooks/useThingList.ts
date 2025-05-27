// src/gun/hooks/useThingList.ts (continued)
import { useEffect, useState } from 'react';
import { Thing } from '../schema/thing.schema';

// Hook for working with a list of things
export function useThingList<T extends Thing>(
  service: {
    list: () => Promise<T[]>;
  },
  dependencies: any[] = [],
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await service.list();

        if (mounted) {
          setItems(result);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err : new Error('Failed to fetch data'),
          );
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { items, loading, error };
}
