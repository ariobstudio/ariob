/**
 * Action Handler
 *
 * Handles action routing and side effects at the application level.
 * This is where business logic for each action is defined.
 */

import { router } from 'expo-router';
import { toast } from '@ariob/andromeda';
import type { ActionContext } from '@ariob/ripple';

// Store references (to be set by the app)
let closeFocusedNodeFn: (() => void) | null = null;
let setBarInputModeFn: (() => void) | null = null;
let openAccountSheetFn: (() => void) | null = null;

/**
 * Register the closeFocusedNode function from the app
 */
export function setCloseFocusedNode(fn: () => void) {
  closeFocusedNodeFn = fn;
}

/**
 * Register the setBarInputMode function from the app
 * This enables inline post creation via the Bar
 */
export function setBarInputMode(fn: () => void) {
  setBarInputModeFn = fn;
}

/**
 * Register the openAccountSheet function from the app
 * This opens the account creation/import sheet
 */
export function setOpenAccountSheet(fn: () => void) {
  openAccountSheetFn = fn;
}

/**
 * Main action handler - routes actions to appropriate destinations
 */
export function handleAction(action: string, ctx: ActionContext) {
  const { view, node } = ctx;
  const isAuthenticated = !!view.profile;

  switch (action) {
    // ─── Auth Flow ───────────────────────────────────────────────────────────
    case 'create':
      if (!isAuthenticated) {
        // Open account sheet for identity creation
        openAccountSheetFn?.();
      } else {
        // For authenticated users, open the Bar's input mode
        setBarInputModeFn?.();
      }
      break;
    
    // ─── Content Creation ────────────────────────────────────────────────────
    case 'post':
      if (isAuthenticated) {
        // Open Bar's input mode for inline post creation
        setBarInputModeFn?.();
      } else {
        toast.info('Create an identity to start posting', {
          duration: 2000,
        });
      }
      break;

    case 'reply':
      if (node) {
        router.push(`/thread/${node.id}`);
      }
      break;

    // ─── Navigation ──────────────────────────────────────────────────────────
    case 'back':
      router.back();
      break;

    case 'close':
      closeFocusedNodeFn?.();
      break;

    // ─── Settings ────────────────────────────────────────────────────────────
    case 'profile':
      router.push('/user/me');
      break;

    case 'theme':
      router.push('/settings');
      break;

    case 'qr':
      // TODO: Implement QR code screen
      toast.info('QR coming soon');
      break;

    case 'exit':
      // TODO: Implement logout
      toast.info('Logout coming soon');
      break;

    // ─── Discovery ───────────────────────────────────────────────────────────
    case 'find':
      // TODO: Implement discover
      toast.info('Discover coming soon');
      break;

    case 'trend':
      // TODO: Implement trending
      toast.info('Trending coming soon');
      break;

    case 'search':
      // TODO: Implement global search
      toast.info('Search coming soon');
      break;

    case 'saved':
      // TODO: Implement saved items
      toast.info('Saved items coming soon');
      break;

    // ─── Content Actions ─────────────────────────────────────────────────────
    case 'save':
      // TODO: Implement save to bookmarks
      toast.success('Saved!');
      break;

    case 'share':
      // TODO: Implement share sheet
      toast.info('Share coming soon');
      break;

    case 'forward':
      // TODO: Implement forward
      toast.info('Forward coming soon');
      break;

    case 'delete':
      // TODO: Implement delete confirmation
      toast.info('Delete coming soon');
      break;

    case 'archive':
      // TODO: Implement archive
      toast.info('Archive coming soon');
      break;

    case 'edit':
      // Edit functionality - inline editing coming soon
      toast.info('Edit coming soon');
      break;

    // ─── Moderation ──────────────────────────────────────────────────────────
    case 'mute':
      toast.info('Muted');
      break;

    case 'block':
      toast.info('Blocked');
      break;

    case 'report':
      toast.info('Report coming soon');
      break;

    case 'filter':
      // TODO: Implement filter sheet
      toast.info('Filter coming soon');
      break;

    // ─── Link/Connect ────────────────────────────────────────────────────────
    case 'link':
      if (isAuthenticated && node) {
        // TODO: Implement connection request
        toast.success('Connection request sent!');
      } else if (!isAuthenticated) {
        toast.info('Create an identity to connect');
      }
      break;

    case 'message':
      if (node) {
        const target = node.author || node.id;
        router.push(`/message/${target}`);
      }
      break;

    default:
      if (__DEV__) {
        console.warn(`[actionHandler] Unhandled action: ${action}`);
      }
  }
}
