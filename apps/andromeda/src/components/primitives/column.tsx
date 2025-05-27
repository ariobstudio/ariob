import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const columnVariants = cva('flex flex-col', {
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
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
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
    gap: 'md',
    align: 'stretch',
    justify: 'start',
    width: 'auto',
    height: 'auto',
  },
});

interface ColumnProps
  extends React.ComponentProps<'view'>,
    VariantProps<typeof columnVariants> {}

function Column({
  className,
  spacing,
  align,
  justify,
  width,
  height,
  ...props
}: ColumnProps) {
  return (
    <view
      data-slot="column"
      className={cn(
        columnVariants({ spacing, align, justify, width, height, className }),
      )}
    >
      {props.children}
    </view>
  );
}

export { Column, columnVariants };
