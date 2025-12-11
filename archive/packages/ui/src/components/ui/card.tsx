import * as React from '@lynx-js/react';
import { type ViewProps } from '@lynx-js/types';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const cardVariants = cva(
  'bg-card text-card-foreground flex flex-col gap-6 border border-border py-6 shadow-sm',
  {
    variants: {
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      radius: 'md',
    },
  }
);

interface CardProps extends ViewProps, VariantProps<typeof cardVariants> {}

function Card({ className, radius, ...props }: CardProps) {
  const { children, ...rest } = props;
  return (
    <view
      data-slot="card"
      className={cn(cardVariants({ radius }), className)}
      {...rest}
    >
      {children}
    </view>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'view'>) {
  // Separate CardAction from other children
  const children = Array.isArray(props.children) ? props.children : [props.children];
  const actionChild = children.find(
    (child: any) => child?.props?.['data-slot'] === 'card-action'
  );
  const otherChildren = children.filter(
    (child: any) => child?.props?.['data-slot'] !== 'card-action'
  );

  const hasAction = !!actionChild;

  return (
    <view
      data-slot="card-header"
      className={cn(
        'px-6',
        hasAction ? 'flex flex-row items-start justify-between gap-4' : 'flex flex-col gap-2',
        className,
      )}
    >
      {hasAction ? (
        <>
          <view className="flex flex-col gap-2 flex-1 min-w-0">
            {otherChildren}
          </view>
          {actionChild}
        </>
      ) : (
        props.children
      )}
    </view>
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'view'>) {
  return (
    <text
      data-slot="card-title"
      className={cn('text-lg leading-none font-semibold', className)}
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
      className={cn(
        'shrink-0',
        className
      )}
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
