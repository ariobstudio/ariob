/**
 * TypeBadge
 *
 * Visual glyph/icon in top-left corner indicating content type.
 * Part of the media signature system.
 */

import { Icon, type IconProps } from '@ariob/ui';

export interface TypeBadgeProps {
  /** Content type */
  type: 'post' | 'message' | 'notification' | 'game';
  /** Icon size */
  size?: IconProps['size'];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Type-to-icon mapping
 */
const TYPE_ICONS: Record<TypeBadgeProps['type'], IconProps['name']> = {
  post: 'file-text',
  message: 'lock',
  notification: 'bell',
  game: 'gamepad-2',
};

/**
 * TypeBadge renders a small icon indicating the content type.
 * Positioned in the top-left of preview cards.
 */
export function TypeBadge({ type, size = 'sm', className }: TypeBadgeProps) {
  return (
    <Icon
      name={TYPE_ICONS[type]}
      size={size}
      className={className}
    />
  );
}
