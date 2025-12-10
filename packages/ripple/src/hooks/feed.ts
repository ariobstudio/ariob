/**
 * Feed hook - Reactive feed data for degree-based content
 *
 * Wraps useCollection with feed-specific logic for posts and threads.
 */

import { useCollection, type Item } from '@ariob/core';
import { FeedItemSchema, type FeedItem, type Degree } from '../schemas';
import { getPath, type DegreeId } from '../config/degrees';

/** Feed configuration */
export interface FeedConfig {
  /** Degree filter (0-4) */
  degree: Degree;
  /** Enable/disable subscription */
  enabled?: boolean;
}

/** Feed hook return type */
export interface Feed {
  /** Feed items */
  items: Item<FeedItem>[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh feed */
  refresh: () => void;
  /** Add item to feed */
  add: (data: FeedItem, id?: string) => Promise<any>;
}

/**
 * Reactive feed hook
 *
 * @example
 * ```tsx
 * const { items, loading, refresh } = useFeed({ degree: '1' });
 * ```
 */
export function useFeed(config: FeedConfig): Feed {
  const { degree, enabled = true } = config;

  // Get path from config (no hardcoded paths)
  const path = getPath(Number(degree) as DegreeId);

  const {
    items,
    isLoading,
    error,
    refetch,
    add,
  } = useCollection<FeedItem>({
    path,
    schema: FeedItemSchema,
    sort: 'desc', // Newest first
    enabled,
  });

  return {
    items,
    loading: isLoading,
    error,
    refresh: refetch,
    add,
  };
}
