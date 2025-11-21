/**
 * Mock Posts for Testing
 */

import type { Post } from '@ariob/ripple';

export const mockPosts: Post[] = [
  {
    type: 'post',
    content: 'Just discovered this amazing new social network! The unified feed concept is revolutionary. 🌊',
    author: 'user1',
    authorAlias: 'Alice',
    created: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    degree: '1',
  },
  {
    type: 'post',
    content: 'Building decentralized apps with Gun.js is so much fun. No backend servers needed!',
    author: 'user2',
    authorAlias: 'Bob',
    created: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    degree: '1',
    tags: ['gunjs', 'decentralized'],
  },
  {
    type: 'post',
    content: 'The Grayscale Symphony design is so clean and minimal. Love the aesthetic! 🎨',
    author: 'user3',
    authorAlias: 'Charlie',
    created: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    degree: '2',
  },
  {
    type: 'post',
    content: 'Degree-based filtering is genius. Finally, a way to organize my social graph that makes sense.',
    author: 'user4',
    authorAlias: 'Diana',
    created: Date.now() - 1000 * 60 * 60, // 1 hour ago
    degree: '2',
    tags: ['design', 'ux'],
  },
  {
    type: 'post',
    content: 'Just published my first post on Ripple! This is going to change everything. 🚀',
    author: 'user5',
    authorAlias: 'Eve',
    created: Date.now() - 1000 * 60 * 120, // 2 hours ago
    degree: '1',
  },
];

/**
 * Add mock posts to Gun.js graph
 */
export async function seedMockPosts(gun: any, userPub: string) {
  console.log('[Mock] Seeding mock posts...');

  for (const post of mockPosts) {
    const postId = `post-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    // Add to posts collection
    await new Promise<void>((resolve) => {
      gun.get('posts').get(postId).put(post, () => {
        console.log('[Mock] Added post:', postId);
        resolve();
      });
    });

    // Add to degree-specific feed
    const feedPath = `${post.degree}-${post.degree === '0' ? 'me' : post.degree === '1' ? 'friends' : 'extended'}`;
    await new Promise<void>((resolve) => {
      const postRef = gun.get('posts').get(postId);
      gun.get('global-feed').get(feedPath).set(postRef, () => {
        resolve();
      });
    });

    // Small delay to prevent overwhelming Gun
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('[Mock] ✅ Mock posts seeded!');
}
