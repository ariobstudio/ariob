import * as React from '@lynx-js/react';
import { type ViewProps } from '@lynx-js/types';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import type { LynxReactNode } from '../../types/react';

interface EmptyProps extends ViewProps {
  children?: LynxReactNode;
}

/**
 * Empty - Container for empty state UI
 *
 * @example
 * ```tsx
 * <Empty>
 *   <EmptyHeader>
 *     <EmptyMedia variant="icon">
 *       <Icon name="inbox" />
 *     </EmptyMedia>
 *     <EmptyTitle>No messages</EmptyTitle>
 *     <EmptyDescription>
 *       You don't have any messages yet.
 *     </EmptyDescription>
 *   </EmptyHeader>
 *   <EmptyContent>
 *     <Button>Create Message</Button>
 *   </EmptyContent>
 * </Empty>
 * ```
 */
function Empty({ className, children, ...props }: EmptyProps) {
  return (
    <view
      data-slot="empty"
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance',
        className
      )}
      {...props}
    >
      {children}
    </view>
  );
}

function EmptyHeader({ className, children, ...props }: EmptyProps) {
  return (
    <view
      data-slot="empty-header"
      className={cn(
        'flex max-w-sm flex-col items-center gap-2 text-center',
        className
      )}
      {...props}
    >
      {children}
    </view>
  );
}

const emptyMediaVariants = cva(
  'flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: 'bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*=\'size-\'])]:size-6',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface EmptyMediaProps extends EmptyProps, VariantProps<typeof emptyMediaVariants> {}

function EmptyMedia({
  className,
  variant = 'default',
  children,
  ...props
}: EmptyMediaProps) {
  return (
    <view
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant }), className)}
      {...props}
    >
      {children}
    </view>
  );
}

function EmptyTitle({ className, children, ...props }: EmptyProps) {
  return (
    <view
      data-slot="empty-title"
      className={cn('text-lg font-medium tracking-tight', className)}
      {...props}
    >
      {typeof children === 'string' ? <text>{children}</text> : children}
    </view>
  );
}

function EmptyDescription({ className, children, ...props }: EmptyProps) {
  return (
    <view
      data-slot="empty-description"
      className={cn(
        'text-muted-foreground text-sm',
        className
      )}
      {...props}
    >
      {typeof children === 'string' ? <text>{children}</text> : children}
    </view>
  );
}

function EmptyContent({ className, children, ...props }: EmptyProps) {
  return (
    <view
      data-slot="empty-content"
      className={cn(
        'flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance',
        className
      )}
      {...props}
    >
      {children}
    </view>
  );
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  emptyMediaVariants,
};
export type { EmptyProps, EmptyMediaProps };
