/**
 * Search Hashtags - Query the hashtag index for posts
 *
 * Searches the `public/hashtags/{tag}` namespace for posts.
 * Returns post references sorted by recency.
 *
 * @module search/searchHashtags
 */

import { graph } from '@ariob/core';
import type { HashtagRef, Post } from '../schemas';

/**
 * Search for posts by hashtag
 *
 * @param tag - Hashtag to search (with or without #)
 * @returns Promise with array of post references, newest first
 *
 * @example
 * ```ts
 * const posts = await searchByHashtag('ariob');
 * // [{ postId: '...', postAuthor: '...', created: 1234567890 }]
 * ```
 */
export async function searchByHashtag(tag: string): Promise<HashtagRef[]> {
  const gun = graph();
  const results: HashtagRef[] = [];

  // Normalize tag (lowercase, remove #)
  const tagLower = tag.toLowerCase().replace(/^#/, '').trim();

  if (!tagLower) {
    return [];
  }

  return new Promise((resolve) => {
    gun
      .get(`public/hashtags/${tagLower}`)
      .map()
      .once((ref: any, _lexId: string) => {
        if (!ref || !ref.postId) return;

        results.push({
          postId: ref.postId,
          postAuthor: ref.postAuthor,
          created: ref.created,
        });
      });

    // Allow time for Gun to traverse
    setTimeout(() => {
      // Sort by created timestamp (newest first)
      results.sort((a, b) => b.created - a.created);
      resolve(results);
    }, 200);
  });
}

/**
 * Fetch full post data from hashtag references
 *
 * @param refs - Array of hashtag references
 * @returns Promise with array of full post objects
 *
 * @example
 * ```ts
 * const refs = await searchByHashtag('ariob');
 * const posts = await fetchPostsFromRefs(refs.slice(0, 10));
 * ```
 */
export async function fetchPostsFromRefs(refs: HashtagRef[]): Promise<Post[]> {
  const gun = graph();
  const posts: Post[] = [];

  return new Promise((resolve) => {
    let remaining = refs.length;

    if (remaining === 0) {
      resolve([]);
      return;
    }

    for (const ref of refs) {
      gun
        .get(`~${ref.postAuthor}/posts/${ref.postId}`)
        .once((post: any) => {
          remaining--;

          if (post && post.type === 'post') {
            posts.push({
              ...post,
              '#': ref.postId,
            } as Post);
          }

          if (remaining === 0) {
            // Sort by created (newest first)
            posts.sort((a, b) => b.created - a.created);
            resolve(posts);
          }
        });
    }

    // Timeout fallback
    setTimeout(() => {
      if (remaining > 0) {
        posts.sort((a, b) => b.created - a.created);
        resolve(posts);
      }
    }, 500);
  });
}
