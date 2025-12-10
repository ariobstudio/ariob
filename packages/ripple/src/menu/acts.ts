/** Action definitions */

import type { Act } from './types';

/** Action names */
export type ActName =
  | 'post' | 'create' | 'config' | 'more' | 'auth'
  | 'find' | 'trend' | 'search'
  | 'back' | 'opts' | 'reply' | 'edit' | 'link'
  | 'profile' | 'theme' | 'qr' | 'saved' | 'exit' | 'close'
  | 'filter' | 'mute' | 'report'
  | 'save' | 'share' | 'forward' | 'delete' | 'archive' | 'block' | 'message';

/** Action configurations */
export const acts: Record<ActName, Omit<Act, 'name'>> = {
  // Main actions
  create: { icon: 'person-add', label: 'Anchor' },
  post: { icon: 'add', label: 'Post' },
  reply: { icon: 'arrow-undo', label: 'Reply' },
  edit: { icon: 'pencil', label: 'Edit' },
  link: { icon: 'link', label: 'Connect' },

  // Navigation
  back: { icon: 'arrow-back', label: 'Back' },
  close: { icon: 'close', label: 'Close' },

  // Menus with children
  config: {
    icon: 'settings',
    label: 'Settings',
    sub: [
      { name: 'profile', icon: 'person', label: 'Profile' },
      { name: 'theme', icon: 'color-palette', label: 'Theme' },
      { name: 'qr', icon: 'qr-code', label: 'QR' },
      { name: 'exit', icon: 'log-out', label: 'Exit' },
    ],
  },
  more: {
    icon: 'ellipsis-horizontal',
    label: 'More',
    sub: [
      { name: 'find', icon: 'search', label: 'Find' },
      { name: 'saved', icon: 'bookmark', label: 'Saved' },
      { name: 'trend', icon: 'trending-up', label: 'Trending' },
      { name: 'search', icon: 'globe', label: 'Search' },
    ],
  },
  opts: { icon: 'ellipsis-horizontal', label: 'Options' },

  // Auth
  auth: { icon: 'key', label: 'Auth' },

  // Discovery
  find: { icon: 'search', label: 'Find' },
  trend: { icon: 'trending-up', label: 'Trend' },
  search: { icon: 'globe', label: 'Search' },

  // Profile submenu
  profile: { icon: 'person', label: 'Profile' },
  theme: { icon: 'color-palette', label: 'Theme' },
  qr: { icon: 'qr-code', label: 'QR' },
  saved: { icon: 'bookmark', label: 'Saved' },
  exit: { icon: 'log-out', label: 'Exit' },

  // Degree 3 & 4 actions
  filter: { icon: 'options', label: 'Filter' },
  mute: { icon: 'volume-mute', label: 'Mute' },
  report: { icon: 'flag', label: 'Report' },

  // Node-specific actions
  save: { icon: 'bookmark-outline', label: 'Save' },
  share: { icon: 'share-outline', label: 'Share' },
  forward: { icon: 'arrow-redo', label: 'Forward' },
  delete: { icon: 'trash-outline', label: 'Delete' },
  archive: { icon: 'archive-outline', label: 'Archive' },
  block: { icon: 'ban', label: 'Block' },
  message: { icon: 'chatbubble-outline', label: 'Message' },
};

/** Get action by name */
export function get(name: string): Act {
  const config = acts[name as ActName];
  if (!config) {
    console.warn(`[menu] Unknown action: ${name}`);
    return { name, icon: 'help', label: name };
  }
  return { name, ...config };
}
