/**
 * Search Users - Query the public profile index
 *
 * Searches the `public/profiles` namespace for users matching a query.
 * Uses client-side filtering with prefix and substring matching.
 *
 * @module search/searchUsers
 */

import { graph } from '@ariob/core';
import type { UserSearchResult } from '../schemas';

/**
 * Search for users by alias or display name
 *
 * @param query - Search query (minimum 2 characters)
 * @returns Promise with array of matching users, sorted by relevance
 *
 * @example
 * ```ts
 * const users = await searchUsers('alice');
 * // [{ pub: '...', alias: 'alice', name: 'Alice Smith', ... }]
 * ```
 */
export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const gun = graph();
  const results: UserSearchResult[] = [];
  const queryLower = query.toLowerCase().trim();

  // Require minimum query length
  if (queryLower.length < 2) {
    return [];
  }

  return new Promise((resolve) => {
    // Traverse public profile index
    gun
      .get('public/profiles')
      .map()
      .once((profile: any, _key: string) => {
        if (!profile || !profile.alias) return;

        const aliasLower = profile.alias.toLowerCase();
        const nameLower = (profile.name || '').toLowerCase();

        // Match on:
        // 1. Alias starts with query (highest relevance)
        // 2. Alias contains query
        // 3. Name contains query
        if (
          aliasLower.startsWith(queryLower) ||
          aliasLower.includes(queryLower) ||
          nameLower.includes(queryLower)
        ) {
          results.push({
            pub: profile.pub,
            alias: profile.alias,
            name: profile.name,
            avatar: profile.avatar,
            bio: profile.bio,
          });
        }
      });

    // Allow time for Gun to traverse the graph
    // In a real app, this could be optimized with pagination/cursors
    setTimeout(() => {
      // Sort results by relevance:
      // 1. Exact alias match
      // 2. Alias starts with query
      // 3. Alphabetical
      results.sort((a, b) => {
        const aAlias = a.alias.toLowerCase();
        const bAlias = b.alias.toLowerCase();

        // Exact match first
        const aExact = aAlias === queryLower;
        const bExact = bAlias === queryLower;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Prefix match second
        const aPrefix = aAlias.startsWith(queryLower);
        const bPrefix = bAlias.startsWith(queryLower);
        if (aPrefix && !bPrefix) return -1;
        if (!aPrefix && bPrefix) return 1;

        // Alphabetical fallback
        return aAlias.localeCompare(bAlias);
      });

      // Return top 20 results
      resolve(results.slice(0, 20));
    }, 200);
  });
}
