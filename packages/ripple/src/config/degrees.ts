/**
 * Degree Configuration
 *
 * Visibility levels for content in the Ripple social graph.
 * Each degree represents a level of social proximity.
 */

/** Degree definition */
export interface DegreeConfig {
  name: string;
  path: string;
  icon: string;
  description: string;
}

/** All degree configurations */
export const degrees: Record<number, DegreeConfig> = {
  0: {
    name: 'Me',
    path: 'me/posts',
    icon: 'person',
    description: 'Personal posts and settings',
  },
  1: {
    name: 'Friends',
    path: 'feeds/friends',
    icon: 'people',
    description: 'Direct connections',
  },
  2: {
    name: 'World',
    path: 'feeds/world',
    icon: 'globe',
    description: 'Friends of friends',
  },
  3: {
    name: 'Discover',
    path: 'feeds/discover',
    icon: 'compass',
    description: 'Recommendations',
  },
  4: {
    name: 'Noise',
    path: 'feeds/noise',
    icon: 'volume-mute',
    description: 'Filtered content',
  },
} as const;

/** Valid degree IDs */
export type DegreeId = 0 | 1 | 2 | 3 | 4;

/** Get degree config by ID */
export function getDegree(id: DegreeId): DegreeConfig {
  return degrees[id];
}

/** Get feed path for degree */
export function getPath(id: DegreeId): string {
  return degrees[id].path;
}

/** Get degree name */
export function getName(id: DegreeId): string {
  return degrees[id].name;
}

/** Get all degrees as array */
export function list(): Array<DegreeConfig & { id: DegreeId }> {
  return Object.entries(degrees).map(([id, config]) => ({
    id: Number(id) as DegreeId,
    ...config,
  }));
}
