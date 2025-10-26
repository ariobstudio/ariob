/**
 * Feed Store
 *
 * Unified feed management with degree-based filtering.
 * Combines posts and DM threads into a single chronological stream.
 */

import { useEffect, useCallback, useMemo } from 'react';
import { collection, useCollection, graph, Result, type Item, type IGunChainReference } from '@ariob/core';
import type { FeedItem, Post, Message, Degree } from './schemas';
import { FeedItemSchema, PostSchema, MessageSchema, createPost } from './schemas';

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
  /** Degree filter */
  degree: Degree;
  /** Gun graph instance (defaults to singleton) */
  graph?: IGunChainReference;
}

/**
 * Feed API - Unified feed with degree filtering
 *
 * @example
 * ```typescript
 * import { feed, graph } from '@ariob/core';
 *
 * const g = graph();
 *
 * // Subscribe to friends feed (degree 1)
 * feed({ degree: '1' }).subscribe(g);
 *
 * // In component
 * const items = feed({ degree: '1' }).get();
 * const loading = feed({ degree: '1' }).loading();
 *
 * // Create a post
 * await feed({ degree: '1' }).post(g, {
 *   content: 'Hello world!',
 *   author: user.pub,
 *   authorAlias: user.alias,
 *   degree: '1'
 * });
 *
 * // Unsubscribe
 * feed({ degree: '1' }).off();
 * ```
 */
export function feed(config: FeedConfig) {
  'background only';

  const { degree } = config;
  const collectionKey = `feed-${degree}`;

  return {
    /**
     * Subscribe to feed for this degree
     */
    subscribe: (gunGraph: IGunChainReference) => {
      'background only';

      const ref = gunGraph.get('global-feed').get(`${degree}-${DEGREE_NAMES[degree]}`);
      collection(collectionKey).map(ref, FeedItemSchema);

      console.log(`[Feed] Subscribed to degree ${degree} (${DEGREE_NAMES[degree]})`);
    },

    /**
     * Unsubscribe from feed
     */
    off: () => {
      'background only';
      collection(collectionKey).off();
      console.log(`[Feed] Unsubscribed from degree ${degree}`);
    },

    /**
     * Get current feed items
     */
    get: (): Item<FeedItem>[] => {
      return collection(collectionKey).get();
    },

    /**
     * Create and publish a post to this degree
     */
    post: async (gunGraph: IGunChainReference, post: Omit<Post, 'type' | 'created' | '#'>): Promise<Result<string, Error>> => {
      'background only';

      try {
        // Create post with metadata
        const fullPost = createPost(post);

        // Validate
        const validation = Result.parse(PostSchema, fullPost);
        if (!validation.ok) {
          return Result.error(new Error(`Invalid post: ${validation.error.message}`));
        }

        // Generate unique post ID
        const postId = `post-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

        // Save to posts collection
        await new Promise<void>((resolve, reject) => {
          gunGraph.get('posts').get(postId).put(fullPost as any, (ack: any) => {
            if (ack.err) {
              console.error('[Feed] Error saving post:', ack.err);
              reject(new Error(ack.err));
            } else {
              console.log('[Feed] Post saved:', postId);
              resolve();
            }
          });
        });

        // Add to degree-specific feed
        const feedPath = `${fullPost.degree}-${DEGREE_NAMES[fullPost.degree]}`;
        await new Promise<void>((resolve, reject) => {
          const postRef = gunGraph.get('posts').get(postId);
          gunGraph.get('global-feed').get(feedPath).set(postRef, (ack: any) => {
            if (ack.err) {
              console.error('[Feed] Error adding to feed:', ack.err);
              reject(new Error(ack.err));
            } else {
              console.log('[Feed] Added to feed:', feedPath);
              resolve();
            }
          });
        });

        console.log(`[Feed] Post published to degree ${degree}:`, postId);
        return Result.ok(postId);
      } catch (err) {
        console.error('[Feed] Error publishing post:', err);
        return Result.error(err instanceof Error ? err : new Error(String(err)));
      }
    },

    /**
     * Send a direct message
     */
    sendMessage: async (
      gunGraph: IGunChainReference,
      message: Omit<Message, 'type' | 'created' | 'encrypted' | 'read' | '#'>
    ): Promise<Result<string, Error>> => {
      'background only';

      try {
        // Create message with metadata
        const fullMessage: Message = {
          type: 'message',
          created: Date.now(),
          encrypted: true,
          read: false,
          ...message,
        };

        // Validate
        const validation = Result.parse(MessageSchema, fullMessage);
        if (!validation.ok) {
          return Result.error(new Error(`Invalid message: ${validation.error.message}`));
        }

        // Generate unique message ID
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

        // TODO: Encrypt message with SEA before storing
        // For now, storing unencrypted for MVP

        // Save to thread
        await new Promise<void>((resolve, reject) => {
          gunGraph
            .get('threads')
            .get(fullMessage.threadId)
            .get('messages')
            .get(messageId)
            .put(fullMessage as any, (ack: any) => {
              if (ack.err) {
                console.error('[Feed] Error saving message:', ack.err);
                reject(new Error(ack.err));
              } else {
                console.log('[Feed] Message saved:', messageId);
                resolve();
              }
            });
        });

        // Update thread metadata
        await new Promise<void>((resolve, reject) => {
          gunGraph
            .get('threads')
            .get(fullMessage.threadId)
            .put(
              {
                lastMessage: fullMessage.text.substring(0, 100),
                lastMessageAt: fullMessage.created,
              } as any,
              (ack: any) => {
                if (ack.err) {
                  console.error('[Feed] Error updating thread:', ack.err);
                  reject(new Error(ack.err));
                } else {
                  resolve();
                }
              }
            );
        });

        console.log(`[Feed] Message sent to thread ${fullMessage.threadId}:`, messageId);
        return Result.ok(messageId);
      } catch (err) {
        console.error('[Feed] Error sending message:', err);
        return Result.error(err instanceof Error ? err : new Error(String(err)));
      }
    },

    /**
     * Get loading state
     */
    loading: (): boolean => {
      return collection(collectionKey).loading();
    },

    /**
     * Get error state
     */
    error: (): Error | null => {
      return collection(collectionKey).error();
    },
  };
}

/**
 * Hook for using feed in React components
 *
 * Automatically subscribes to the feed for the given degree and provides
 * sorted, filtered feed items.
 *
 * @example
 * ```typescript
 * function FeedView() {
 *   const { items, loading, post, sendMessage } = useFeed({ degree: '1' });
 *
 *   const handlePost = async () => {
 *     await post({
 *       content: 'Hello!',
 *       author: user.pub,
 *       degree: '1'
 *     });
 *   };
 *
 *   return (
 *     <view>
 *       {items.map(item => <FeedItem key={item.id} data={item.data} />)}
 *     </view>
 *   );
 * }
 * ```
 */
export function useFeed(config: FeedConfig) {
  'background only';

  const { degree } = config;
  const g = config.graph || graph();
  const collectionKey = `feed-${degree}`;

  // Subscribe on mount
  useEffect(() => {
    'background only';
    const ref = g.get('global-feed').get(`${degree}-${DEGREE_NAMES[degree]}`);
    collection(collectionKey).map(ref, FeedItemSchema);

    return () => collection(collectionKey).off();
  }, [degree, collectionKey, g]);

  // Get raw items from collection
  const { items: rawItems, loading, error } = useCollection(collectionKey);

  // Sort by created timestamp (newest first)
  const items = useMemo(() => {
    return [...rawItems].sort((a, b) => {
      const aTime = a.data.created || 0;
      const bTime = b.data.created || 0;
      return bTime - aTime; // Descending order
    });
  }, [rawItems]);

  // Post creation
  const post = useCallback(
    async (data: Omit<Post, 'type' | 'created' | '#'>) => {
      'background only';
      return feed({ degree }).post(g, data);
    },
    [degree, g]
  );

  // Message sending
  const sendMessage = useCallback(
    async (data: Omit<Message, 'type' | 'created' | 'encrypted' | 'read' | '#'>) => {
      'background only';
      return feed({ degree }).sendMessage(g, data);
    },
    [degree, g]
  );

  return {
    items,
    loading,
    error,
    post,
    sendMessage,
  };
}

/**
 * Export helpers
 */
export { DEGREE_NAMES };
