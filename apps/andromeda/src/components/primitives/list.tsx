import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const listVariants = cva('', {
  variants: {
    direction: {
      vertical: 'flex flex-col',
      horizontal: 'flex flex-row',
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
    variant: {
      default: '',
      bordered: 'border border-border rounded-lg',
      elevated: 'bg-card shadow-md rounded-lg',
      inset: 'bg-muted/50 rounded-lg',
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
    variant: 'default',
    showScrollbar: 'auto',
  },
});

interface ListProps<T = any>
  extends Omit<React.ComponentProps<'list'>, 'data'>,
    VariantProps<typeof listVariants> {
  data?: T[];
  renderItem?: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onScroll?: () => void;
  onItemPress?: (item: T, index: number) => void;
  emptyComponent?: React.ReactNode;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
}

function List<T = any>({
  className,
  direction,
  gap,
  padding,
  width,
  height,
  variant,
  showScrollbar,
  data = [],
  renderItem,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold,
  onScroll,
  onItemPress,
  emptyComponent,
  headerComponent,
  footerComponent,
  children,
  ...props
}: ListProps<T>) {
  // If renderItem is provided, use data-driven rendering
  if (renderItem && data.length > 0) {
    return (
      <list
        data-slot="list"
        className={cn(
          listVariants({
            direction,
            gap,
            padding,
            width,
            height,
            variant,
            showScrollbar,
            className,
          }),
        )}
        bindscroll={onScroll}
        {...props}
      >
        {headerComponent}
        {data.map((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : index;
          return (
            <view
              key={key}
              data-slot="list-item-wrapper"
              bindtap={() => onItemPress?.(item, index)}
            >
              {renderItem(item, index)}
            </view>
          );
        })}
        {footerComponent}
      </list>
    );
  }

  // If no data but children provided, render children
  if (children) {
    return (
      <list
        data-slot="list"
        className={cn(
          listVariants({
            direction,
            gap,
            padding,
            width,
            height,
            variant,
            showScrollbar,
            className,
          }),
        )}
        bindscroll={onScroll}
        {...props}
      >
        {headerComponent}
        {children}
        {footerComponent}
      </list>
    );
  }

  // Empty state
  return (
    <list
      data-slot="list"
      className={cn(
        listVariants({
          direction,
          gap,
          padding,
          width,
          height,
          variant,
          showScrollbar,
          className,
        }),
      )}
      {...props}
    >
      {emptyComponent || (
        <view className="flex-1 flex items-center justify-center p-8">
          <text className="text-muted-foreground text-sm">No items</text>
        </view>
      )}
    </list>
  );
}

export { List, listVariants }; 