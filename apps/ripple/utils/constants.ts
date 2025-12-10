/**
 * Centralized constants for the Ripple app
 *
 * This file consolidates repeated constants from multiple components
 * to ensure consistency and reduce duplication.
 */

import type { Ionicons } from '@expo/vector-icons';

// ============================================================================
// Content Types
// ============================================================================

/**
 * Content type for filtering posts in feed
 */
export type FilterContentTypeId = 'all' | 'post' | 'image-post' | 'video-post' | 'poll' | 'share';

/**
 * Content types for filtering feed content
 * Used in: ContentTypeFilter.tsx
 */
export const FILTER_CONTENT_TYPES: {
  id: FilterContentTypeId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'post', label: 'Text', icon: 'document-text' },
  { id: 'image-post', label: 'Photos', icon: 'image' },
  { id: 'video-post', label: 'Videos', icon: 'videocam' },
  { id: 'poll', label: 'Polls', icon: 'bar-chart' },
  { id: 'share', label: 'Shares', icon: 'repeat' },
];

// ============================================================================
// Degrees (Social Distance)
// ============================================================================

/**
 * Degree value type - represents social graph distance
 * 0 = Me, 1 = Friends, 2 = Network, 3 = Global
 */
export type DegreeValue = 0 | 1 | 2 | 3;

export interface DegreeOption {
  id: DegreeValue;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
}

/**
 * Social distance degrees for filtering content
 * Used in: DegreeFilterPill.tsx, index.tsx
 *
 * | Degree | Label    | Icon    | Description           |
 * |--------|----------|---------|----------------------|
 * | 0      | Me       | person  | Personal content     |
 * | 1      | Friends  | people  | Direct connections   |
 * | 2      | Network  | network | Extended connections |
 * | 3      | Global   | globe   | Public discovery     |
 */
export const DEGREES: readonly DegreeOption[] = [
  { id: 0, label: 'Me', icon: 'person', iconFilled: 'person' },
  { id: 1, label: 'Friends', icon: 'people-outline', iconFilled: 'people' },
  { id: 2, label: 'Network', icon: 'git-network-outline', iconFilled: 'git-network' },
  { id: 3, label: 'Global', icon: 'globe-outline', iconFilled: 'globe' },
] as const;

/**
 * Simple degree labels for quick access
 */
export const DEGREE_LABELS = DEGREES.map((d) => ({ id: d.id, label: d.label }));

// ============================================================================
// View Modes
// ============================================================================

/**
 * Content types that open in immersive (full-screen) view
 * Used in: FeedView.tsx
 */
export const IMMERSIVE_CONTENT_TYPES = ['video-post', 'thread'] as const;

/**
 * Check if a content type should open in immersive view
 */
export function isImmersiveType(type: string): boolean {
  return IMMERSIVE_CONTENT_TYPES.includes(type as typeof IMMERSIVE_CONTENT_TYPES[number]);
}
