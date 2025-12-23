/**
 * @ariob/andromeda Molecules
 *
 * Simple combinations of atoms.
 * More complex than atoms but still focused on a single purpose.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types (Protocol Definitions)
// ─────────────────────────────────────────────────────────────────────────────

export type {
  AvatarProps,
  AvatarSize,
  AvatarTint,
  IconButtonProps,
  IconButtonSize,
  IconButtonTint,
  InputFieldProps,
  TagProps,
  TagTint,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Styles (Theme-aware)
// ─────────────────────────────────────────────────────────────────────────────

export * as styles from './styles';

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

export { Avatar } from './Avatar';
export { IconButton } from './IconButton';
export { InputField } from './InputField';
export { Tag } from './Tag';
export { Dropdown, type DropdownProps, type DropdownOption } from './Dropdown';
