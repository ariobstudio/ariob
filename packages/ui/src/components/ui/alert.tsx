import * as React from '@lynx-js/react';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border border-border px-4 py-3 grid grid-cols-[0_1fr] items-start',
  {
    variants: {
      variant: {
        default: 'bg-card',
        destructive:
          'bg-card *:data-[slot=alert-description]:text-destructive/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const textVariants = cva('text-sm', {
  variants: {
    variant: {
      default: 'text-card-foreground',
      destructive: 'text-destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'view'> & VariantProps<typeof alertVariants>) {
  return (
    <view
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
    >
      <text className={cn(textVariants({ variant }), className)}>
        {props.children}
      </text>
    </view>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'view'>) {
  return (
    <view
      data-slot="alert-title"
      className={cn('col-start-2 line-clamp-1 min-h-4', className)}
    >
      <text className="font-medium tracking-tight">{props.children}</text>
    </view>
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'view'>) {
  return (
    <view
      data-slot="alert-description"
      className={cn(
        'col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className,
      )}
    >
      <text className="text-muted-foreground">{props.children}</text>
    </view>
  );
}

export { Alert, AlertTitle, AlertDescription };
