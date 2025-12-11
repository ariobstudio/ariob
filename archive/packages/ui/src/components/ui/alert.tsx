import * as React from '@lynx-js/react';
import type { ViewProps } from '@lynx-js/types';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import type { LynxReactNode } from '../../types/react';

const alertVariants = cva(
  'relative w-full rounded-md border px-4 py-3 flex flex-col items-start gap-3',
  {
    variants: {
      variant: {
        default: 'bg-background border-border text-foreground',
        destructive:
          'bg-destructive/10 border-destructive dark:border-destructive [&*text]:text-destructive [&*text]:opacity-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Alert({
  className,
  variant,
  children,
  ...props
}: ViewProps & VariantProps<typeof alertVariants>) {
  return (
    <view
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {children}
    </view>
  );
}

function AlertTitle({ className, icon, ...props }: ViewProps & { icon?: LynxReactNode }) {
  return (
    <view
      data-slot="alert-title"
      className={cn('mb-1 flex flex-row items-center gap-2 leading-none tracking-tight [&_text]:font-medium', className)}
      {...props}
    >
      {icon && (icon as LynxReactNode)}
      <text className="font-semibold">{props.children}</text>
    </view>
  );
}

function AlertDescription({
  className,
  ...props
}: ViewProps) {
  return (
    <view
      data-slot="alert-description"
      className={cn('text-sm [&_text]:leading-relaxed', className)}
      {...props}
    >
      {typeof props.children === 'string' ? (
        <text className="text-sm opacity-90">{props.children}</text>
      ) : (
        props.children
      )}
    </view>
  );
}

export { Alert, AlertTitle, AlertDescription };
