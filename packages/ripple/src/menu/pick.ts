/** Action pickers - determine which actions to show */

import { useMemo } from 'react';
import type { View, Acts, Pick, Act } from './types';
import { get } from './acts';
import { getDetailAction, getOptsActions } from './nodes';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Build options menu with node-specific actions */
function buildOpts(type: string): Act {
  const actions = getOptsActions(type);
  return {
    name: 'opts',
    icon: 'ellipsis-horizontal',
    label: 'Options',
    sub: actions.map((name) => get(name)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pickers (ordered by priority - first match wins)
// ─────────────────────────────────────────────────────────────────────────────

/** Focused node - show close only */
const focus: Pick = {
  name: 'focus',
  match: (v) => !!v.node,
  acts: () => ({
    left: null,
    main: get('close'),
    right: null,
  }),
};

/** Full view - show back, context action, options (node-specific) */
const detail: Pick = {
  name: 'detail',
  match: (v) => !!v.full,
  acts: (v) => {
    const type = v.full?.type || 'post';

    // Get main action from node config
    let main = get(getDetailAction(type));

    // Profile special case: edit if own, link if other
    if (type === 'profile' && v.full?.isMe) {
      main = get('edit');
    }

    return {
      left: get('back'),
      main,
      right: buildOpts(type), // Node-specific options
    };
  },
};

/** Degree 4 (Noise) - filter and moderation */
const noise: Pick = {
  name: 'noise',
  match: (v) => v.degree === 4,
  acts: () => ({
    left: get('mute'),
    main: get('post'),
    right: get('report'),
  }),
};

/** Degree 3 (Discover) - filter and trending */
const discover: Pick = {
  name: 'discover',
  match: (v) => v.degree === 3,
  acts: () => ({
    left: get('filter'),
    main: get('post'),
    right: get('trend'),
  }),
};

/**
 * Feed action configuration by degree
 * Customize the actions shown at each degree level
 */
export interface FeedConfig {
  /** Main center action (authenticated) */
  main: string;
  /** Main center action (unauthenticated) - defaults to 'create' */
  mainUnauthenticated?: string;
  /** Left action */
  left?: string | null;
  /** Right action */
  right?: string | null;
}

/** Default feed configurations by degree */
const defaultFeedConfig: Record<number, FeedConfig> = {
  0: {
    main: 'post',
    mainUnauthenticated: 'create',
    left: 'config',  // When authenticated
    right: 'more',   // When authenticated, 'auth' when not
  },
  1: {
    main: 'post',
    right: 'find',
  },
  2: {
    main: 'post',
    left: 'trend',
    right: 'search',
  },
  3: {
    main: 'post',
    left: 'filter',
    right: 'trend',
  },
  4: {
    main: 'post',
    left: 'mute',
    right: 'report',
  },
};

/** Get feed config for a degree (can be customized) */
export function getFeedConfig(degree: number): FeedConfig {
  return defaultFeedConfig[degree] || defaultFeedConfig[0];
}

/** Default feed view - varies by degree */
const feed: Pick = {
  name: 'feed',
  match: () => true,
  acts: (v) => {
    const config = getFeedConfig(v.degree);

    // Determine main action based on auth state
    const mainAction = v.profile
      ? config.main
      : (config.mainUnauthenticated || config.main);

    let left: Act | null = null;
    let right: Act | null = null;

    // Degree 0 has special handling for auth state
    if (v.degree === 0) {
      if (v.profile) {
        left = config.left ? get(config.left) : null;
        right = config.right ? get(config.right) : null;
      }
      // When not authenticated, no actions on sides - just the main create action
    } else {
      left = config.left ? get(config.left) : null;
      right = config.right ? get(config.right) : null;
    }

    return { left, main: get(mainAction), right };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Resolver
// ─────────────────────────────────────────────────────────────────────────────

/** All pickers in priority order */
const picks: Pick[] = [focus, detail, noise, discover, feed];

/** Resolve actions for current view */
export function resolve(view: View): Acts {
  const picker = picks.find((p) => p.match(view)) || feed;
  return picker.acts(view, get);
}

/** Hook for resolving menu actions */
export function useActs(
  degree: number,
  profile: boolean,
  full: View['full'] | null,
  node: string | null = null,
): Acts {
  return useMemo(
    () => resolve({ degree, profile, full: full || undefined, node: node || undefined }),
    [degree, profile, full, node],
  );
}
