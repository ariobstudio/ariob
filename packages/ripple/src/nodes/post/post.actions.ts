/**
 * Post Actions
 *
 * Actions available on Post nodes.
 * Auto-registered with the ActionRegistry on import.
 */

import { action, success, pending } from '../_shared';

/**
 * Reply
 *
 * Navigate to thread view to reply.
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
    return success(null, `/thread/${ctx.nodeId}`);
  }
);

/**
 * Save
 *
 * Save post to bookmarks.
 */
export const save = action(
  {
    verb: 'save',
    label: 'Save',
    icon: 'bookmark-outline',
    category: 'secondary',
    variant: 'ghost',
  },
  async (ctx) => {
    // TODO: Implement save to bookmarks
    return success({ saved: true });
  }
);

/**
 * Share
 *
 * Share post via native share sheet.
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
    return success({ shared: true });
  }
);

/**
 * Delete
 *
 * Delete post (owner only, requires confirmation).
 */
export const deletePost = action(
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
    return pending('Deleting post...');
  }
);

/**
 * All post actions - exported for reference
 */
export const postActions = { reply, save, share, delete: deletePost };
