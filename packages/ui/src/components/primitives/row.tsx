import { type VariantProps, cva } from 'class-variance-authority';
import type { ViewProps } from '@lynx-js/types';
import type * as React from '@lynx-js/react';

import { cn } from '../../lib/utils';
import type { LynxReactNode } from '../../types/react';

const rowVariants = cva('flex flex-row', {
  variants: {
    spacing: {
      none: '',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      wrap: 'flex-wrap',
      nowrap: 'flex-nowrap',
      reverse: 'flex-wrap-reverse',
    },
    width: {
      auto: 'w-auto',
      full: 'w-full',
      fit: 'w-fit',
      screen: 'w-screen',
    },
    height: {
      auto: 'h-auto',
      full: 'h-full',
      fit: 'h-fit',
      screen: 'h-screen',
    },
  },
  defaultVariants: {
    spacing: 'md',
    align: 'center',
    justify: 'start',
    wrap: 'nowrap',
    width: 'auto',
    height: 'auto',
  },
});

interface RowProps
  extends ViewProps,
    VariantProps<typeof rowVariants> {
  children?: LynxReactNode;
}

function Row({
  className,
  spacing,
  align,
  justify,
  wrap,
  width,
  height,
  children,
  ...props
}: RowProps) {
  return (
    <view
      data-slot="row"
      className={cn(
        rowVariants({
          spacing,
          align,
          justify,
          wrap,
          width,
          height,
          className,
        }),
      )}
      {...props}
    >
      {children}
    </view>
  );
}

export { Row, rowVariants };
