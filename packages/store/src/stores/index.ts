/**
 * @ariob/store - Pre-built stores
 *
 * Ready-to-use Zustand stores for common app state management.
 *
 * @example
 * ```tsx
 * import { useAIStore, useBarStore, useConversationStore } from '@ariob/store/stores';
 *
 * function App() {
 *   const { modelId } = useAIStore();
 *   const { mode, dispatch } = useBarStore();
 *   const { messages } = useConversationStore();
 *   // ...
 * }
 * ```
 */

export {
  useAIStore,
  AI_MODELS,
  type AIState,
  type AIModelId,
} from './ai';

export {
  useBarStore,
  type BarState,
  type BarMode,
  type BarAction,
  type SheetType,
} from './bar';

export {
  useConversationStore,
  type ConversationState,
  type Message,
  type MessageRole,
  type MessageStatus,
} from './conversation';
