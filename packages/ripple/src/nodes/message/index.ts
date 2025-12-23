/**
 * Message Node
 *
 * Self-contained module for direct message nodes.
 * Importing this module auto-registers message actions.
 */

// Auto-register actions on import
import './message.actions';

// Component
export { Message, type MessageData } from './Message';

// Schema
export {
  MessageSchema,
  type Message as MessageNode,
  isMessage,
  createMessage,
  MESSAGE_ACTIONS,
  ThreadMetadataSchema,
  type ThreadMetadata,
  isThread,
  createThreadId,
} from './message.schema';

// Actions
export { messageActions } from './message.actions';

// Styles
export { messageStyles } from './message.styles';
