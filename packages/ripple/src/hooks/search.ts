/**
 * Search hooks - Reactive search for users and hashtags
 *
 * Provides debounced search with loading states for the decentralized
 * profile and hashtag indexes.
 *
 * @module hooks/search
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { searchUsers, searchByHashtag, fetchPostsFromRefs } from '../search';
import type { UserSearchResult, HashtagRef, Post } from '../schemas';

/** Search type options */
export type SearchType = 'users' | 'hashtags' | 'all';

/** Search hook configuration */
export interface SearchConfig {
  /** Search type filter */
  type?: SearchType;
  /** Debounce delay in ms (default: 300) */
  debounce?: number;
  /** Minimum query length (default: 2) */
  minLength?: number;
  /** Enable/disable search */
  enabled?: boolean;
}

/** Combined search results */
export interface SearchResults {
  users: UserSearchResult[];
  posts: Post[];
  hashtags: HashtagRef[];
}

/** Search hook return type */
export interface Search {
  /** Current query */
  query: string;
  /** Set search query */
  setQuery: (q: string) => void;
  /** Search results */
  results: SearchResults;
  /** Loading state */
  isSearching: boolean;
  /** Error state */
  error: Error | null;
  /** Active search type */
  type: SearchType;
  /** Set search type */
  setType: (t: SearchType) => void;
  /** Clear search */
  clear: () => void;
}

/**
 * Main search hook with debouncing and type filtering
 *
 * @example
 * ```tsx
 * const { query, setQuery, results, isSearching } = useSearch();
 *
 * <TextInput value={query} onChangeText={setQuery} />
 * {isSearching && <ActivityIndicator />}
 * {results.users.map(user => <UserRow key={user.pub} {...user} />)}
 * ```
 */
export function useSearch(config: SearchConfig = {}): Search {
  const {
    type: initialType = 'users',
    debounce = 300,
    minLength = 2,
    enabled = true,
  } = config;

  const [query, setQuery] = useState('');
  const [type, setType] = useState<SearchType>(initialType);
  const [results, setResults] = useState<SearchResults>({
    users: [],
    posts: [],
    hashtags: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track latest query for race condition handling
  const latestQueryRef = useRef(query);
  latestQueryRef.current = query;

  const clear = useCallback(() => {
    setQuery('');
    setResults({ users: [], posts: [], hashtags: [] });
    setError(null);
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (!enabled) return;

    const trimmedQuery = query.trim();

    // Clear results if query too short
    if (trimmedQuery.length < minLength) {
      setResults({ users: [], posts: [], hashtags: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const newResults: SearchResults = {
          users: [],
          posts: [],
          hashtags: [],
        };

        // Search based on type
        if (type === 'users' || type === 'all') {
          newResults.users = await searchUsers(trimmedQuery);
        }

        if (type === 'hashtags' || type === 'all') {
          const refs = await searchByHashtag(trimmedQuery);
          newResults.hashtags = refs;
          // Fetch full posts for top 10 results
          if (refs.length > 0) {
            newResults.posts = await fetchPostsFromRefs(refs.slice(0, 10));
          }
        }

        // Only update if this is still the current query
        if (latestQueryRef.current.trim() === trimmedQuery) {
          setResults(newResults);
          setIsSearching(false);
        }
      } catch (err) {
        if (latestQueryRef.current.trim() === trimmedQuery) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsSearching(false);
        }
      }
    }, debounce);

    return () => clearTimeout(timeoutId);
  }, [query, type, debounce, minLength, enabled]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    type,
    setType,
    clear,
  };
}

/** User search hook return type */
export interface UserSearch {
  users: UserSearchResult[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Focused user search hook
 *
 * @example
 * ```tsx
 * const { users, isLoading } = useUserSearch('alice');
 * ```
 */
export function useUserSearch(query: string): UserSearch {
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    searchUsers(trimmed)
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => setIsLoading(false));
  }, [query, refreshKey]);

  return { users, isLoading, error, refetch };
}

/** Hashtag search hook return type */
export interface HashtagSearch {
  refs: HashtagRef[];
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hashtag search hook
 *
 * @example
 * ```tsx
 * const { posts, isLoading } = useHashtagSearch('ariob');
 * ```
 */
export function useHashtagSearch(tag: string): HashtagSearch {
  const [refs, setRefs] = useState<HashtagRef[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const trimmed = tag.trim().replace(/^#/, '');
    if (!trimmed) {
      setRefs([]);
      setPosts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    searchByHashtag(trimmed)
      .then(async (foundRefs) => {
        setRefs(foundRefs);
        if (foundRefs.length > 0) {
          const fetchedPosts = await fetchPostsFromRefs(foundRefs.slice(0, 20));
          setPosts(fetchedPosts);
        } else {
          setPosts([]);
        }
      })
      .catch((err) => setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => setIsLoading(false));
  }, [tag, refreshKey]);

  return { refs, posts, isLoading, error, refetch };
}
