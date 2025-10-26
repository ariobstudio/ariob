/**
 * Mock Data Generator
 *
 * Generates sample posts and messages for testing the feed.
 * Uses the proper @ariob/ripple API for data creation.
 */

import type { IGunChainReference } from '@ariob/core';
import type { Degree } from '@ariob/ripple';
import { feed } from '@ariob/ripple';

/**
 * Generate mock posts for testing
 */
export async function generateMockPosts(
  graph: IGunChainReference,
  userPub: string,
  count: number = 5
): Promise<void> {
  'background only';

  console.log(`[MockData] Generating ${count} mock posts using @ariob/ripple API...`);

  const mockPostContents = [
    "Just shipped a new feature! 🚀 The focus lens animation is looking smooth.",
    "Thinking about decentralized social networks and how they change content ownership.",
    "Coffee ☕ + Code = Perfect morning",
    "Who else is excited about Gun.js and P2P technologies?",
    "Hot take: CSS animations are underrated. They're faster than JS and easier to maintain.",
    "Reading about LynxJS dual-thread architecture. Mind = blown 🤯",
    "What's your favorite state management library? I'm team Zustand.",
    "Just discovered the IFR pattern. Game changer for performance!",
    "Building in public is scary but rewarding. Here's to shipping more features!",
    "Late night coding session. The best ideas come after midnight 🌙",
  ];

  const degrees: Degree[] = ['0', '1', '2'];

  for (let i = 0; i < count; i++) {
    const degree = degrees[i % degrees.length];
    const content = mockPostContents[i % mockPostContents.length];

    try {
      // Use the proper feed API to create posts
      const result = await feed({ degree }).post(graph, {
        content,
        author: userPub,
        authorAlias: 'TestUser',
        degree,
      });

      if (result.ok) {
        console.log(`[MockData] ✓ Created post ${i + 1}/${count} in degree ${degree}: ${result.value}`);
      } else {
        console.error(`[MockData] ✗ Failed to create post ${i + 1}:`, result.error.message);
      }
    } catch (err) {
      console.error(`[MockData] ✗ Exception creating post ${i + 1}:`, err);
    }

    // Small delay to avoid overwhelming Gun
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  console.log('[MockData] ✓ Mock data generation complete');
}

/**
 * Clear all mock data (for testing)
 */
export async function clearMockData(graph: IGunChainReference, userPub: string): Promise<void> {
  'background only';

  console.log('[MockData] Clearing mock data...');

  try {
    // Clear user's posts for each degree
    const degrees: Degree[] = ['0', '1', '2'];

    for (const degree of degrees) {
      graph.get('~' + userPub).get('posts').get(degree).put(null);
      graph.get('posts').get(`post-${degree}`).put(null);
    }

    console.log('[MockData] ✓ Mock data cleared');
  } catch (err) {
    console.error('[MockData] Failed to clear mock data:', err);
  }
}

/**
 * Check if mock data exists
 */
export function hasMockData(graph: IGunChainReference, userPub: string): Promise<boolean> {
  'background only';

  return new Promise((resolve) => {
    graph.get('~' + userPub).get('posts').get('1').once((data: any) => {
      resolve(!!data);
    });

    // Timeout after 1 second
    setTimeout(() => resolve(false), 1000);
  });
}
