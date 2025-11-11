import { type VariantProps, cva } from 'class-variance-authority';
import type { BaseEvent, StandardProps } from '@lynx-js/types';
import * as React from '@lynx-js/react';
import { cn } from '../../lib/utils';
import type { LynxReactNode } from '../../types/react';

const listVariants = cva('', {
  variants: {
    type: {
      single: '',
      flow: '',
      waterfall: '',
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
  },
  defaultVariants: {
    type: 'single',
    gap: 'none',
    padding: 'none',
    width: 'full',
    height: 'full',
  },
});

interface ListProps<T = any>
  extends Omit<StandardProps, 'children'>,
    VariantProps<typeof listVariants> {
  /**
   * List layout type
   * - single: Single column/row
   * - flow: Multi-column/row flow
   * - waterfall: Waterfall/masonry layout
   * @default 'single'
   */
  type?: 'single' | 'flow' | 'waterfall';
  /**
   * Number of columns (flow/waterfall) or rows
   * @default 1
   */
  spanCount?: number;
  /**
   * Scroll direction
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal';
  /**
   * Enable user scrolling
   * @default true
   */
  enableScroll?: boolean;
  /**
   * Show scroll bar
   * @default true
   */
  showScrollbar?: boolean;
  /**
   * Enable bounce effect at edges
   * @default true
   */
  bounces?: boolean;
  /**
   * Main axis gap (between rows/columns)
   * @example '10px' | '20rpx'
   */
  mainAxisGap?: string;
  /**
   * Cross axis gap (between columns/rows)
   * @example '10px' | '20rpx'
   */
  crossAxisGap?: string;
  /**
   * Number of items to preload off-screen
   * @default 0
   */
  preloadBufferCount?: number;
  /**
   * Scroll event throttle in ms
   * @default 200
   */
  scrollEventThrottle?: number;
  /**
   * Initial scroll index
   */
  initialScrollIndex?: number;
  /**
   * Number of items from top before firing scrolltoupper
   */
  upperThresholdItemCount?: number;
  /**
   * Number of items from bottom before firing scrolltolower
   */
  lowerThresholdItemCount?: number;
  /**
   * Enable sticky positioning
   */
  sticky?: boolean;
  /**
   * Sticky offset distance
   */
  stickyOffset?: number;
  /**
   * Data array for rendering
   */
  data?: T[];
  /**
   * Render function for each item
   */
  renderItem?: (item: T, index: number) => LynxReactNode;
  /**
   * Extract unique key for each item
   */
  keyExtractor?: (item: T, index: number) => string;
  /**
   * Callback when reaching bottom threshold
   */
  onEndReached?: () => void;
  /**
   * Callback during scroll
   */
  onScroll?: (e: BaseEvent) => void;
  /**
   * Callback when reaching upper threshold
   */
  onScrollToUpper?: (e: BaseEvent) => void;
  /**
   * Callback when reaching lower threshold
   */
  onScrollToLower?: (e: BaseEvent) => void;
  /**
   * Callback on scroll state change
   */
  onScrollStateChange?: (e: BaseEvent) => void;
  /**
   * Callback after layout completes
   */
  onLayoutComplete?: (e: BaseEvent) => void;
  /**
   * Callback on item press
   */
  onItemPress?: (item: T, index: number) => void;
  /**
   * Component to show when data is empty
   */
  emptyComponent?: LynxReactNode;
  /**
   * Header component
   */
  headerComponent?: LynxReactNode;
  /**
   * Footer component
   */
  footerComponent?: LynxReactNode;
  /**
   * Direct children (alternative to data/renderItem)
   */
  children?: LynxReactNode;
}

/**
 * List - High-performance virtualized list using native list element
 *
 * Based on Lynx list element with proper recycling and virtualization
 *
 * @see https://lynxjs.org/api/elements/built-in/list
 *
 * @example
 * ```tsx
 * <List
 *   data={items}
 *   type="flow"
 *   spanCount={2}
 *   renderItem={(item) => <Card>{item.title}</Card>}
 *   keyExtractor={(item) => item.id}
 *   onEndReached={loadMore}
 * />
 * ```
 */
function List<T = any>({
  className,
  type = 'single',
  spanCount = 1,
  direction = 'vertical',
  gap,
  padding,
  width,
  height,
  enableScroll = true,
  showScrollbar = true,
  bounces = true,
  mainAxisGap,
  crossAxisGap,
  preloadBufferCount = 0,
  scrollEventThrottle = 200,
  initialScrollIndex,
  upperThresholdItemCount,
  lowerThresholdItemCount,
  sticky = false,
  stickyOffset = 0,
  data = [],
  renderItem,
  keyExtractor,
  onEndReached,
  onScroll,
  onScrollToUpper,
  onScrollToLower,
  onScrollStateChange,
  onLayoutComplete,
  onItemPress,
  emptyComponent,
  headerComponent,
  footerComponent,
  children,
  ...props
}: ListProps<T>) {
  // Handle onEndReached with onScrollToLower
  const handleScrollToLower = React.useCallback(
    (e: BaseEvent) => {
      onScrollToLower?.(e);
      onEndReached?.();
    },
    [onScrollToLower, onEndReached]
  );

  // If renderItem is provided, use data-driven rendering
  if (renderItem && data.length > 0) {
    return (
      <list
        data-slot="list"
        list-type={type}
        span-count={spanCount}
        scroll-orientation={direction}
        enable-scroll={enableScroll}
        scroll-bar-enable={showScrollbar}
        bounces={bounces}
        list-main-axis-gap={mainAxisGap}
        list-cross-axis-gap={crossAxisGap}
        preload-buffer-count={preloadBufferCount}
        scroll-event-throttle={scrollEventThrottle}
        initial-scroll-index={initialScrollIndex}
        upper-threshold-item-count={upperThresholdItemCount}
        lower-threshold-item-count={lowerThresholdItemCount}
        sticky={sticky}
        sticky-offset={stickyOffset}
        bindscroll={onScroll}
        bindscrolltoupper={onScrollToUpper}
        bindscrolltolower={handleScrollToLower}
        bindscrollstatechange={onScrollStateChange}
        bindlayoutcomplete={onLayoutComplete}
        className={cn(
          listVariants({
            type,
            gap,
            padding,
            width,
            height,
          }),
          className
        )}
        {...props}
      >
        {headerComponent}
        {data.map((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : String(index);
          return (
            <list-item
              key={key}
              item-key={key}
              recyclable={true}
              data-slot="list-item-wrapper"
              bindtap={() => onItemPress?.(item, index)}
            >
              {renderItem(item, index)}
            </list-item>
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
        list-type={type}
        span-count={spanCount}
        scroll-orientation={direction}
        enable-scroll={enableScroll}
        scroll-bar-enable={showScrollbar}
        bounces={bounces}
        list-main-axis-gap={mainAxisGap}
        list-cross-axis-gap={crossAxisGap}
        preload-buffer-count={preloadBufferCount}
        scroll-event-throttle={scrollEventThrottle}
        initial-scroll-index={initialScrollIndex}
        upper-threshold-item-count={upperThresholdItemCount}
        lower-threshold-item-count={lowerThresholdItemCount}
        sticky={sticky}
        sticky-offset={stickyOffset}
        bindscroll={onScroll}
        bindscrolltoupper={onScrollToUpper}
        bindscrolltolower={handleScrollToLower}
        bindscrollstatechange={onScrollStateChange}
        bindlayoutcomplete={onLayoutComplete}
        className={cn(
          listVariants({
            type,
            gap,
            padding,
            width,
            height,
          }),
          className
        )}
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
      list-type={type}
      span-count={spanCount}
      scroll-orientation={direction}
      enable-scroll={false}
      className={cn(
        listVariants({
          type,
          gap,
          padding,
          width,
          height,
        }),
        'flex items-center justify-center',
        className
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
export type { ListProps };
