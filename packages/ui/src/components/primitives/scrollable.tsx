import { type VariantProps, cva } from 'class-variance-authority';
import * as React from '@lynx-js/react';
import type { BaseEvent, StandardProps } from '@lynx-js/types';
import { cn } from '../../lib/utils';
import type { LynxReactNode } from '../../types/react';

const scrollableVariants = cva('', {
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
  },
  defaultVariants: {
    direction: 'vertical',
    gap: 'none',
    padding: 'none',
    width: 'full',
    height: 'full',
  },
});

interface ScrollableProps
  extends Omit<StandardProps, 'children'>,
    VariantProps<typeof scrollableVariants> {
  /**
   * Scroll direction
   */
  direction?: 'vertical' | 'horizontal';
  /**
   * Shorthand for vertical scrolling (overrides direction)
   * @default false
   */
  scrollY?: boolean;
  /**
   * Shorthand for horizontal scrolling (overrides direction)
   * @default false
   */
  scrollX?: boolean;
  /**
   * Enable user scrolling
   * @default true
   */
  enableScroll?: boolean;
  /**
   * Show scroll bar
   * @default false
   */
  showScrollbar?: boolean;
  /**
   * Enable bounce effect at edges
   * @default true
   */
  bounces?: boolean;
  /**
   * Initial scroll offset in pixels
   */
  initialScrollOffset?: number;
  /**
   * Initial scroll to child index
   */
  initialScrollToIndex?: number;
  /**
   * Element ID to scroll into view
   */
  scrollIntoView?: string;
  /**
   * Upper threshold distance for scrolltoupper event
   */
  upperThreshold?: number;
  /**
   * Lower threshold distance for scrolltolower event
   */
  lowerThreshold?: number;
  /**
   * Callback during scrolling
   */
  onScroll?: (e: BaseEvent) => void;
  /**
   * Callback when scroll ends
   */
  onScrollEnd?: (e: BaseEvent) => void;
  /**
   * Callback when reaching upper threshold
   */
  onScrollToUpper?: (e: BaseEvent) => void;
  /**
   * Callback when reaching lower threshold
   */
  onScrollToLower?: (e: BaseEvent) => void;
  /**
   * Callback when content size changes
   */
  onContentSizeChanged?: (e: BaseEvent) => void;
  /**
   * Children to render
   */
  children?: LynxReactNode;
}

/**
 * Scrollable - High-performance scrollable container using native scroll-view
 *
 * Based on Lynx scroll-view element with proper API
 *
 * @see https://lynxjs.org/api/elements/built-in/scroll-view
 *
 * @example
 * ```tsx
 * <Scrollable direction="vertical" showScrollbar onScrollEnd={handleEnd}>
 *   <Column spacing="md">
 *     {items.map(item => <Card key={item.id}>{item.content}</Card>)}
 *   </Column>
 * </Scrollable>
 * ```
 */
function Scrollable({
  className,
  direction = 'vertical',
  scrollY,
  scrollX,
  gap,
  padding,
  width,
  height,
  enableScroll = true,
  showScrollbar = false,
  bounces = true,
  initialScrollOffset,
  initialScrollToIndex,
  scrollIntoView,
  upperThreshold,
  lowerThreshold,
  onScroll,
  onScrollEnd,
  onScrollToUpper,
  onScrollToLower,
  onContentSizeChanged,
  children,
  ...props
}: ScrollableProps) {
  // Determine actual direction from shorthand props or direction prop
  const actualDirection = scrollY ? 'vertical' : scrollX ? 'horizontal' : direction;

  // Build scroll-view props
  const scrollViewProps: any = {
    'data-slot': 'scrollable',
    'enable-scroll': enableScroll,
    'scroll-bar-enable': showScrollbar,
    bounces,
    'initial-scroll-offset': initialScrollOffset,
    'initial-scroll-to-index': initialScrollToIndex,
    'upper-threshold': upperThreshold,
    'lower-threshold': lowerThreshold,
    bindscroll: onScroll,
    bindscrollend: onScrollEnd,
    bindscrolltoupper: onScrollToUpper,
    bindscrolltolower: onScrollToLower,
    bindcontentsizechanged: onContentSizeChanged,
  };

  // Add scroll-orientation unless using shorthand
  if (!scrollY && !scrollX) {
    scrollViewProps['scroll-orientation'] = actualDirection;
  }

  // Add scroll-y or scroll-x shorthand if used
  if (scrollY) {
    scrollViewProps['scroll-y'] = true;
  } else if (scrollX) {
    scrollViewProps['scroll-x'] = true;
  }

  // Add scroll-into-view if provided
  if (scrollIntoView) {
    scrollViewProps['scroll-into-view'] = scrollIntoView;
  }

  return (
    <scroll-view
      className={cn(
        scrollableVariants({
          direction: actualDirection,
          gap,
          padding,
          width,
          height,
        }),
        className
      )}
      {...scrollViewProps}
      {...props}
    >
      {children}
    </scroll-view>
  );
}

export { Scrollable, scrollableVariants };
export type { ScrollableProps };
