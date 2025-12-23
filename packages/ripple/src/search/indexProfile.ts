/**
 * Index Profile - Publish profile to public index for discoverability
 *
 * Writes profile data to `public/profiles/{pubKey}` for search.
 *
 * @module search/indexProfile
 */

import { graph, Result } from '@ariob/core';
import type { PublicProfile } from '../schemas';

/**
 * Index the current user's profile for discoverability
 *
 * Publishes minimal profile data to the public index so other
 * users can find this user via search.
 *
 * @returns Result indicating success or error
 *
 * @example
 * ```ts
 * const result = await indexMyProfile();
 * if (result.ok) {
 *   console.log('Profile indexed!');
 * }
 * ```
 */
export async function indexMyProfile(): Promise<Result<void, Error>> {
  const gun = graph();
  const user = gun.user();
  const myPub = user.is?.pub;

  if (!myPub) {
    return Result.error(new Error('Not authenticated'));
  }

  return new Promise((resolve) => {
    // Get current profile data
    user.get('profile').once((profile: any) => {
      if (!profile) {
        // No profile yet - create minimal index entry
        const indexData: PublicProfile = {
          pub: myPub,
          alias: 'anonymous',
          indexed: Date.now(),
        };

        gun
          .get('public/profiles')
          .get(myPub)
          .put(indexData as any, (ack: any) => {
            if (ack.err) {
              resolve(Result.error(new Error(ack.err)));
            } else {
              resolve(Result.ok(undefined));
            }
          });
        return;
      }

      // Build index data from profile
      const indexData: PublicProfile = {
        pub: myPub,
        alias: profile.alias || 'anonymous',
        name: profile.name,
        avatar: profile.avatar,
        bio: profile.bio,
        indexed: Date.now(),
      };

      // Write to public index
      gun
        .get('public/profiles')
        .get(myPub)
        .put(indexData as any, (ack: any) => {
          if (ack.err) {
            resolve(Result.error(new Error(ack.err)));
          } else {
            resolve(Result.ok(undefined));
          }
        });
    });
  });
}

/**
 * Index a post's hashtags to the public hashtag index
 *
 * @param postId - Post ID (soul)
 * @param authorPub - Author's public key
 * @param content - Post content containing hashtags
 * @returns Result indicating success or error
 *
 * @example
 * ```ts
 * await indexPostHashtags('post_123', 'pubKey...', 'Hello #world!');
 * ```
 */
export async function indexPostHashtags(
  postId: string,
  authorPub: string,
  content: string
): Promise<Result<void, Error>> {
  const gun = graph();

  // Extract hashtags from content
  const regex = /#(\w+)/g;
  const matches = content.match(regex);

  if (!matches || matches.length === 0) {
    return Result.ok(undefined);
  }

  // Get unique lowercase tags
  const tags = Array.from(new Set(matches.map((t) => t.slice(1).toLowerCase())));
  const now = Date.now();

  try {
    // Index each hashtag
    for (const tag of tags) {
      await new Promise<void>((resolve, reject) => {
        gun
          .get(`public/hashtags/${tag}`)
          .get(postId)
          .put(
            {
              postId,
              postAuthor: authorPub,
              created: now,
            },
            (ack: any) => {
              if (ack.err) {
                reject(new Error(ack.err));
              } else {
                resolve();
              }
            }
          );
      });
    }

    return Result.ok(undefined);
  } catch (err) {
    return Result.error(err instanceof Error ? err : new Error(String(err)));
  }
}
