/**
 * Node Menu Definitions
 *
 * Actions available for each node type.
 * - quick: Long-press context menu actions
 * - detail: Main action when viewing node in detail
 * - opts: Options submenu actions
 */

import type { ActName } from './acts';

/** Node menu configuration */
export interface NodeMenu {
  quick: ActName[];
  detail: ActName[];
  opts: ActName[];
}

/** Menu configurations per node type */
export const nodeMenus: Record<string, NodeMenu> = {
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
  // Fallback for unknown types
  default: {
    quick: ['reply'],
    detail: ['reply'],
    opts: ['report'],
  },
} as const;

/** Get menu config for node type */
export function getNodeMenu(type: string): NodeMenu {
  return nodeMenus[type] || nodeMenus.default;
}

/** Get quick actions for node type */
export function getQuickActions(type: string): ActName[] {
  return getNodeMenu(type).quick;
}

/** Get detail action for node type */
export function getDetailAction(type: string): ActName {
  return getNodeMenu(type).detail[0];
}

/** Get options actions for node type */
export function getOptsActions(type: string): ActName[] {
  return getNodeMenu(type).opts;
}
