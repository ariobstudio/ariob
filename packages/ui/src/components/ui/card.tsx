import * as React from '@lynx-js/react';
import { type ViewProps } from '@lynx-js/types';

import { cn } from '../../lib/utils';

function Card({ className, ...props }: ViewProps) {
  const { children, ...rest } = props;
  return (
    <view
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border py-6',
        className,
      )}
      {...rest}
    >
      {children}
    </view>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'view'>) {
  return (
    <view
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
    >
      {props.children}
    </view>
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'view'>) {
  return (
    <text
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
    >
      {props.children}
    </text>
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<'view'>) {
  return (
    <text
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
    >
      {props.children}
    </text>
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'view'>) {
  return (
    <view
      data-slot="card-action"
      className={cn('col-start-2 self-start justify-self-end', className)}
    >
      {props.children}
    </view>
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'view'>) {
  return (
    <view data-slot="card-content" className={cn('px-6', className)}>
      {props.children}
    </view>
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'view'>) {
  return (
    <view
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
    >
      {props.children}
    </view>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
