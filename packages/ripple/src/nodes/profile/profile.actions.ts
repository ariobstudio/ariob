/**
 * Profile Actions
 *
 * Actions available on ProfileNode.
 * Auto-registered with the ActionRegistry on import.
 */

import { action, success, pending } from '../_shared';

/**
 * Edit Profile
 *
 * Owner-only action to edit profile settings.
 * Available in card and full variants (not preview).
 */
export const edit = action(
  {
    verb: 'edit',
    label: 'Edit',
    icon: 'pencil',
    category: 'primary',
    variant: 'ghost',
    ownerOnly: true,
    variants: ['card', 'full'],
  },
  async (ctx) => {
    // Navigate to profile edit screen
    return success(null, '/profile/edit', { id: ctx.nodeId });
  }
);

/**
 * Connect
 *
 * Request connection with another user.
 * Hidden when viewing own profile.
 */
export const connect = action(
  {
    verb: 'connect',
    label: 'Connect',
    icon: 'person-add',
    category: 'primary',
    variant: 'solid',
  },
  async (ctx) => {
    if (ctx.isOwner) {
      return { status: 'error', error: 'Cannot connect with yourself' };
    }

    // TODO: Implement connection request
    return pending('Connection request sent');
  }
);

/**
 * Message
 *
 * Open DM thread with user.
 */
export const message = action(
  {
    verb: 'message',
    label: 'Message',
    icon: 'chatbubble',
    category: 'primary',
    variant: 'ghost',
  },
  async (ctx) => {
    // Navigate to message thread
    return success(null, '/message', { userId: ctx.nodeId });
  }
);

/**
 * Share
 *
 * Share profile via native share sheet or copy link.
 */
export const share = action(
  {
    verb: 'share',
    label: 'Share',
    icon: 'share-outline',
    category: 'secondary',
    variant: 'ghost',
  },
  async (ctx) => {
    // TODO: Implement native share
    return success({ copied: true }, undefined, undefined);
  }
);

/**
 * Block
 *
 * Block user (requires confirmation).
 * Hidden when viewing own profile.
 */
export const block = action(
  {
    verb: 'block',
    label: 'Block',
    icon: 'ban',
    category: 'destructive',
    variant: 'ghost',
    confirm: true,
  },
  async (ctx) => {
    if (ctx.isOwner) {
      return { status: 'error', error: 'Cannot block yourself' };
    }

    // TODO: Implement block
    return success();
  }
);

/**
 * All profile actions - exported for reference
 */
export const profileActions = { edit, connect, message, share, block };
