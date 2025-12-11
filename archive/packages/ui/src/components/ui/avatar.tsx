import { type VariantProps, cva } from 'class-variance-authority';
import type { ViewProps } from '@lynx-js/types';
import * as React from '@lynx-js/react';

import { cn } from '../../lib/utils';
import { Text } from '../primitives/text';
import type { LynxReactNode } from '../../types/react';

const avatarVariants = cva(
  'relative flex items-center justify-center shrink-0',
  {
    variants: {
      size: {
        xs: 'h-8 w-8 min-w-8',
        sm: 'h-12 w-12 min-w-12',
        default: 'h-16 w-16 min-w-16',
        lg: 'h-20 w-20 min-w-20',
        xl: 'h-24 w-24 min-w-24',
        '2xl': 'h-28 w-28 min-w-28',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

const textSizeMap = {
  xs: 'xs' as const,
  sm: 'xs' as const,
  default: 'sm' as const,
  lg: 'base' as const,
  xl: 'lg' as const,
  '2xl': 'xl' as const,
};

interface AvatarProps extends ViewProps, VariantProps<typeof avatarVariants> {
  /**
   * URL of the avatar image
   */
  src?: string;
  /**
   * Alt text for the avatar
   */
  alt?: string;
  /**
   * Name to generate initials from if no image is provided
   */
  name?: string;
  /**
   * Show online status indicator
   */
  online?: boolean;
  /**
   * Custom fallback content
   */
  fallback?: LynxReactNode;
}

/**
 * Get initials from a name (max 2 characters)
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function Avatar({
  className,
  size,
  src,
  alt,
  name,
  online,
  fallback,
  ...props
}: AvatarProps) {
  const textSize = textSizeMap[size || 'default'];
  const initials = name ? getInitials(name) : '';

  return (
    <view
      data-slot="avatar"
      className={cn(
        avatarVariants({ size }),
        'rounded-full bg-muted',
        // Ensure content is properly constrained within circular boundary
        className
      )}
      {...props}
    >
      {src ? (
        <image
          src={src}
          className="h-full w-full rounded-full object-cover"
          mode="aspectFill"
        />
      ) : fallback ? (
        fallback
      ) : (
        <Text
          size={textSize}
          weight="medium"
          variant="muted"
          className="select-none"
        >
          {initials || '?'}
        </Text>
      )}

      {/* Online status indicator - positioned outside the circular boundary */}
      {online && (
        <view className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-background bg-green-500" />
      )}
    </view>
  );
}

export { Avatar, avatarVariants };
export type { AvatarProps };
