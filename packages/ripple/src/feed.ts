/**
 * Feed Store - Simplified using useCollection hook
 */

import { useCollection, graph, Result, type IGunChainReference } from '@ariob/core';
import type { FeedItem, Post, Message, Degree } from './schemas';
import { FeedItemSchema, PostSchema, createPost } from './schemas';

/**
 * Degree names for Gun paths
 */
const DEGREE_NAMES: Record<Degree, string> = {
  '0': 'me',
  '1': 'friends',
  '2': 'extended',
};

/**
 * Feed configuration
 */
export interface FeedConfig {
  degree: Degree;
  graph?: IGunChainReference;
}

/**
 * Simple hook using useCollection from @ariob/core
 */
export function useFeed(config: FeedConfig) {
  const { degree } = config;
  const g = config.graph || graph();

  // Use the useCollection hook directly
  const feedPath = `global-feed/${degree}-${DEGREE_NAMES[degree]}`;
  const collection = useCollection({
    path: feedPath,
    schema: FeedItemSchema,
    graph: g,
  });

  // Sort by created timestamp (newest first)
  const items = [...collection.items].sort((a, b) => {
    const aTime = a.data.created || 0;
    const bTime = b.data.created || 0;
    return bTime - aTime;
  });

  // Post creation
  const post = async (data: Omit<Post, 'type' | 'created' | '#'>) => {
    try {
      const fullPost = createPost(data);

      const validation = Result.parse(PostSchema, fullPost);
      if (!validation.ok) {
        return Result.error(new Error(`Invalid post: ${validation.error.message}`));
      }

      const postId = `post-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

      await new Promise<void>((resolve, reject) => {
        g.get('posts').get(postId).put(fullPost as any, (ack: any) => {
          if (ack.err) {
            reject(new Error(ack.err));
          } else {
            resolve();
          }
        });
      });

      const feedPath = `${fullPost.degree}-${DEGREE_NAMES[fullPost.degree]}`;
      await new Promise<void>((resolve, reject) => {
        const postRef = g.get('posts').get(postId);
        g.get('global-feed').get(feedPath).set(postRef, (ack: any) => {
          if (ack.err) {
            reject(new Error(ack.err));
          } else {
            resolve();
          }
        });
      });

      return Result.ok(postId);
    } catch (err) {
      return Result.error(err instanceof Error ? err : new Error(String(err)));
    }
  };

  return {
    items,
    loading: collection.isLoading,
    error: collection.error,
    post,
    refresh: collection.refetch,
  };
}

export { DEGREE_NAMES };
