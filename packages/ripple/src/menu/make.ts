/**
 * Action Factory - Simple make helper
 *
 * UNIX-style factory for creating action definitions.
 * App uses this to build action records.
 *
 * @example
 * ```ts
 * import { make } from '@ariob/ripple';
 *
 * const actions = {
 *   post: make('post', { icon: 'add', label: 'Post' }),
 *   reply: make('reply', { icon: 'arrow-undo', label: 'Reply' }),
 *   config: make('config', {
 *     icon: 'settings',
 *     label: 'Settings',
 *     sub: [
 *       { name: 'profile', icon: 'person', label: 'Profile' },
 *       { name: 'theme', icon: 'color-palette', label: 'Theme' },
 *     ],
 *   }),
 * };
 * ```
 */

import type { Act } from './types';

/**
 * Action definition without the name
 */
export interface Def {
  icon: string;
  label: string;
  sub?: Act[];
}

/**
 * Create an action from a name and definition.
 * Simple factory - app composes the rest.
 */
export function make(name: string, def: Def): Act {
  return { name, ...def };
}
