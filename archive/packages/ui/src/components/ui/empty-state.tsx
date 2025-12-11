import { type VariantProps, cva } from 'class-variance-authority';
import type { ViewProps } from '@lynx-js/types';
import * as React from '@lynx-js/react';

import { cn } from '../../lib/utils';
import { Column } from '../primitives/column';
import { Text } from '../primitives/text';
import { Icon } from './icon';
import type { IconName } from './icon';
import type { LynxReactNode } from '../../types/react';

const emptyStateVariants = cva(
  'flex items-center justify-center w-full',
  {
    variants: {
      size: {
        sm: 'py-8',
        default: 'py-12',
        lg: 'py-16',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

interface EmptyStateProps extends ViewProps, VariantProps<typeof emptyStateVariants> {
  /**
   * Icon to display
   */
  icon?: IconName;
  /**
   * Custom icon component
   */
  customIcon?: LynxReactNode;
  /**
   * Title text
   */
  title: string;
  /**
   * Description text
   */
  description?: string;
  /**
   * Action button or element
   */
  action?: LynxReactNode;
  /**
   * Icon size
   */
  iconSize?: number;
}

function EmptyState({
  className,
  size,
  icon,
  customIcon,
  title,
  description,
  action,
  iconSize = 48,
  ...props
}: EmptyStateProps) {
  return (
    <view
      data-slot="empty-state"
      className={cn(emptyStateVariants({ size }), className)}
      {...props}
    >
      <Column spacing="md" className="items-center max-w-sm mx-auto px-4">
        {customIcon || (icon && (
          <view className="flex items-center justify-center rounded-full bg-muted p-4">
            <Icon name={icon} size="default" className="text-muted-foreground" />
          </view>
        ))}

        <Column spacing="xs" className="items-center text-center">
          <Text size="lg" weight="semibold">
            {title}
          </Text>

          {description && (
            <Text variant="muted" size="sm" className="max-w-xs">
              {description}
            </Text>
          )}
        </Column>

        {action && (
          <view className="mt-2">
            {action}
          </view>
        )}
      </Column>
    </view>
  );
}

export { EmptyState, emptyStateVariants };
export type { EmptyStateProps };
