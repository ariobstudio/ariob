/**
 * AI Actions
 *
 * Actions available on AINode.
 * Auto-registered with the ActionRegistry on import.
 */

import { action, success } from '../_shared';

/**
 * Expand
 *
 * Navigate to full chat view.
 * This is the "More →" ghost button.
 * Only available in preview and card variants.
 */
export const expand = action(
  {
    verb: 'expand',
    label: 'More',
    icon: 'chevron-forward',
    category: 'navigation',
    variant: 'ghost',
    variants: ['preview', 'card'],
  },
  async (ctx) => {
    return success(null, '/message/ai', { nodeId: ctx.nodeId });
  }
);

/**
 * Chat
 *
 * Continue or start conversation.
 * Primary action - solid button.
 */
export const chat = action(
  {
    verb: 'chat',
    label: 'Chat',
    icon: 'chatbubble-ellipses',
    category: 'primary',
    variant: 'solid',
  },
  async (ctx) => {
    const payload = ctx.payload as Record<string, unknown> | undefined;
    const threadId = payload?.threadId as string | undefined;
    return success(null, '/message/ai', { nodeId: ctx.nodeId, threadId });
  }
);

/**
 * New Topic
 *
 * Start a new conversation topic.
 * Ghost button alongside Chat.
 */
export const newTopic = action(
  {
    verb: 'new-topic',
    label: 'New Topic',
    icon: 'add-circle-outline',
    category: 'primary',
    variant: 'ghost',
  },
  async (ctx) => {
    return success(null, '/message/ai', { nodeId: ctx.nodeId, newTopic: true });
  }
);

/**
 * Topics
 *
 * View all conversation topics.
 * Only available in full variant (after expand).
 */
export const topics = action(
  {
    verb: 'topics',
    label: 'Topics',
    icon: 'list',
    category: 'secondary',
    variant: 'ghost',
    variants: ['full'],
  },
  async (ctx) => {
    return success(null, '/message/ai/topics', { nodeId: ctx.nodeId });
  }
);

/**
 * All AI actions - exported for reference
 */
export const aiActions = { expand, chat, newTopic, topics };
