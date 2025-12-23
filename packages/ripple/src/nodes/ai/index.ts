/**
 * AI Node
 *
 * Self-contained module for AI assistant nodes.
 * Importing this module auto-registers AI actions.
 *
 * @example
 * ```ts
 * import '@ariob/ripple/nodes/ai'; // Auto-registers actions
 *
 * // Or import specific parts
 * import { AI, AINodeSchema, aiActions } from '@ariob/ripple/nodes/ai';
 * ```
 */

// Auto-register actions on import
import './ai.actions';

// Component
export { AI, AIModel, type AIModelData, type ModelOption } from './AI';

// Schema
export {
  AINodeSchema,
  type AINode,
  isAINode,
  AI_ACTIONS,
  TopicSchema,
  type Topic,
  AIThreadSchema,
  type AIThread,
} from './ai.schema';

// Actions (already registered, export for reference)
export { aiActions } from './ai.actions';

// Styles
export { aiStyles } from './ai.styles';
