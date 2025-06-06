import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const scrollableVariants = cva('', {
  variants: {
    direction: {
      vertical: 'flex flex-col',
      horizontal: 'flex flex-row',
      both: 'flex',
    },
    gap: {
      none: '',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
    padding: {
      none: '',
      xs: 'p-1',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
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
    showScrollbar: {
      auto: '',
      hidden: 'scrollbar-hide',
      visible: 'scrollbar-default',
    },
  },
  defaultVariants: {
    direction: 'vertical',
    gap: 'none',
    padding: 'none',
    width: 'full',
    height: 'auto',
    showScrollbar: 'auto',
  },
});

interface ScrollableProps
  extends Omit<React.ComponentProps<'scroll-view'>, 'scroll-x' | 'scroll-y'>,
    VariantProps<typeof scrollableVariants> {
  onScrollEnd?: () => void;
  onScrollStart?: () => void;
}

function Scrollable({
  className,
  direction,
  gap,
  padding,
  width,
  height,
  showScrollbar,
  onScrollEnd,
  onScrollStart,
  ...props
}: ScrollableProps) {
  // Determine scroll direction props based on direction variant
  const scrollProps = React.useMemo(() => {
    switch (direction) {
      case 'horizontal':
        return { 'scroll-x': true };
      case 'both':
        return { 'scroll-x': true, 'scroll-y': true };
      case 'vertical':
      default:
        return { 'scroll-y': true };
    }
  }, [direction]);

  return (
    <scroll-view
      data-slot="scrollable"
      className={cn(
        scrollableVariants({
          direction,
          gap,
          padding,
          width,
          height,
          showScrollbar,
          className,
        }),
      )}
      {...scrollProps}
      bindscroll={onScrollStart}
      bindscrollend={onScrollEnd}
      {...props}
    >
      {props.children}
    </scroll-view>
  );
}

export { Scrollable, scrollableVariants };
