/**
 * Action Configuration
 *
 * Defines all actions, feed configs, and node menus for the Ripple app.
 * This is the single source of truth for action definitions.
 *
 * Uses the `make` helper from @ariob/ripple for UNIX-style action creation.
 */

import { make, createActions, createNodeMenus, createFeedConfigs } from '@ariob/ripple';
import type { ActionFeedConfig, ActionNodeMenu, Act } from '@ariob/ripple';

// ─────────────────────────────────────────────────────────────────────────────
// Action Definitions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All actions defined using the make helper.
 * Pattern: make(name, { icon, label, sub? })
 */
export const actions: Record<string, Act> = {
  // ─── Main Actions ──────────────────────────────────────────────────────────
  create: make('create', { icon: 'person-add', label: 'Anchor' }),
  post: make('post', { icon: 'add', label: 'Post' }),
  reply: make('reply', { icon: 'arrow-undo', label: 'Reply' }),
  edit: make('edit', { icon: 'pencil', label: 'Edit' }),
  link: make('link', { icon: 'link', label: 'Connect' }),

  // ─── Navigation ────────────────────────────────────────────────────────────
  back: make('back', { icon: 'arrow-back', label: 'Back' }),
  close: make('close', { icon: 'close', label: 'Close' }),

  // ─── Menus with Children ───────────────────────────────────────────────────
  config: make('config', {
    icon: 'settings',
    label: 'Settings',
    sub: [
      { name: 'profile', icon: 'person', label: 'Profile' },
      { name: 'theme', icon: 'color-palette', label: 'Theme' },
      { name: 'qr', icon: 'qr-code', label: 'QR' },
      { name: 'exit', icon: 'log-out', label: 'Exit' },
    ],
  }),
  more: make('more', {
    icon: 'ellipsis-horizontal',
    label: 'More',
    sub: [
      { name: 'find', icon: 'search', label: 'Find' },
      { name: 'saved', icon: 'bookmark', label: 'Saved' },
      { name: 'trend', icon: 'trending-up', label: 'Trending' },
      { name: 'search', icon: 'globe', label: 'Search' },
    ],
  }),
  opts: make('opts', { icon: 'ellipsis-horizontal', label: 'Options' }),

  // ─── Auth ──────────────────────────────────────────────────────────────────
  auth: make('auth', { icon: 'key', label: 'Auth' }),

  // ─── Discovery ─────────────────────────────────────────────────────────────
  find: make('find', { icon: 'search', label: 'Find' }),
  trend: make('trend', { icon: 'trending-up', label: 'Trend' }),
  search: make('search', { icon: 'globe', label: 'Search' }),

  // ─── Profile Submenu ───────────────────────────────────────────────────────
  profile: make('profile', { icon: 'person', label: 'Profile' }),
  theme: make('theme', { icon: 'color-palette', label: 'Theme' }),
  qr: make('qr', { icon: 'qr-code', label: 'QR' }),
  saved: make('saved', { icon: 'bookmark', label: 'Saved' }),
  exit: make('exit', { icon: 'log-out', label: 'Exit' }),

  // ─── Degree 3 & 4 Actions ──────────────────────────────────────────────────
  filter: make('filter', { icon: 'options', label: 'Filter' }),
  mute: make('mute', { icon: 'volume-mute', label: 'Mute' }),
  report: make('report', { icon: 'flag', label: 'Report' }),

  // ─── Content Actions ───────────────────────────────────────────────────────
  save: make('save', { icon: 'bookmark-outline', label: 'Save' }),
  share: make('share', { icon: 'share-outline', label: 'Share' }),
  forward: make('forward', { icon: 'arrow-redo', label: 'Forward' }),
  delete: make('delete', { icon: 'trash-outline', label: 'Delete' }),
  archive: make('archive', { icon: 'archive-outline', label: 'Archive' }),
  block: make('block', { icon: 'ban', label: 'Block' }),
  message: make('message', { icon: 'chatbubble-outline', label: 'Message' }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Feed Config per Degree
// ─────────────────────────────────────────────────────────────────────────────

export const feedConfig = createFeedConfigs({
  0: {
    main: 'post',
    mainUnauthenticated: 'create',
    left: 'config',
    right: 'more',
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
});

// ─────────────────────────────────────────────────────────────────────────────
// Node Menus per Type
// ─────────────────────────────────────────────────────────────────────────────

export const nodeMenus = createNodeMenus({
  post: {
    quick: ['reply', 'save', 'share'],
    detail: ['reply'],
    opts: ['save', 'share', 'report'],
  },
  message: {
    quick: ['reply', 'forward', 'delete'],
    detail: ['reply'],
    opts: ['forward', 'delete', 'report'],
  },
  profile: {
    quick: ['link', 'message', 'block'],
    detail: ['link'],
    opts: ['message', 'share', 'block', 'report'],
  },
  thread: {
    quick: ['reply', 'mute', 'archive'],
    detail: ['reply'],
    opts: ['mute', 'archive', 'delete'],
  },
  default: {
    quick: ['reply'],
    detail: ['reply'],
    opts: ['report'],
  },
});
