/**
 * Feed Configuration
 *
 * Defines feed items and their visibility rules.
 * Replaces hardcoded if/else logic with config-driven approach.
 */

import type { DegreeId } from '@ariob/ripple';

/**
 * Feed item configuration
 */
export interface FeedItemConfig {
  /** Unique identifier */
  id: string;
  /** Item type for rendering */
  type: 'profile' | 'ai';
  /** Requires authentication to display */
  requiresAuth?: boolean;
  /** Visible only on specific degrees (undefined = all) */
  visibleOn?: DegreeId[];
  /** Sort priority (lower = higher in feed) */
  priority?: number;
}

/**
 * Feed item configurations
 */
export const FEED_ITEMS: FeedItemConfig[] = [
  {
    id: 'profile',
    type: 'profile',
    requiresAuth: true,
    visibleOn: [0], // Only on "Me" degree
    priority: 1,
  },
  {
    id: 'ai',
    type: 'ai',
    requiresAuth: true,
    visibleOn: [0], // Only on "Me" degree
    priority: 2,
  },
];

/**
 * Get visible feed items based on degree and authentication status
 */
export function getVisibleFeedItems(
  degree: DegreeId,
  isAuthenticated: boolean
): FeedItemConfig[] {
  return FEED_ITEMS.filter((item) => {
    // Check authentication requirement
    if (item.requiresAuth && !isAuthenticated) return false;
    // Check degree visibility
    if (item.visibleOn && !item.visibleOn.includes(degree)) return false;
    return true;
  }).sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
}
