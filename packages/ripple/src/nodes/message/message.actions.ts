/**
 * Message Actions
 *
 * Actions available on Message nodes.
 * Auto-registered with the ActionRegistry on import.
 */

import { action, success, pending } from '../_shared';

/**
 * Reply
 *
 * Reply to a message in thread.
 */
export const reply = action(
  {
    verb: 'reply',
    label: 'Reply',
    icon: 'arrow-undo',
    category: 'primary',
    variant: 'ghost',
  },
  async (ctx) => {
    const payload = ctx.payload as Record<string, unknown> | undefined;
    const threadId = payload?.threadId as string | undefined;
    return success(null, `/message/${threadId || ctx.nodeId}`);
  }
);

/**
 * Forward
 *
 * Forward message to another user.
 */
export const forward = action(
  {
    verb: 'forward',
    label: 'Forward',
    icon: 'arrow-redo',
    category: 'secondary',
    variant: 'ghost',
  },
  async (ctx) => {
    // TODO: Implement forward
    return pending('Forwarding...');
  }
);

/**
 * Delete
 *
 * Delete message (owner only).
 */
export const deleteMessage = action(
  {
    verb: 'delete',
    label: 'Delete',
    icon: 'trash-outline',
    category: 'destructive',
    variant: 'ghost',
    ownerOnly: true,
    confirm: true,
  },
  async (ctx) => {
    // TODO: Implement delete
    return pending('Deleting...');
  }
);

/**
 * All message actions
 */
export const messageActions = { reply, forward, delete: deleteMessage };
