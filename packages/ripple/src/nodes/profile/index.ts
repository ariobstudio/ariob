/**
 * Profile Node
 *
 * Self-contained module for user identity nodes.
 * Importing this module auto-registers profile actions.
 *
 * @example
 * ```ts
 * import '@ariob/ripple/nodes/profile'; // Auto-registers actions
 *
 * // Or import specific parts
 * import { Profile, ProfileNodeSchema, profileActions } from '@ariob/ripple/nodes/profile';
 * ```
 */

// Auto-register actions on import
import './profile.actions';

// Component
export { Profile, type ProfileData } from './Profile';

// Schema
export {
  ProfileNodeSchema,
  type ProfileNode,
  isProfileNode,
  PROFILE_ACTIONS,
} from './profile.schema';

// Actions (already registered, export for reference)
export { profileActions } from './profile.actions';

// Styles
export { profileStyles } from './profile.styles';
