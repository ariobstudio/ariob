/**
 * Carousel Component
 *
 * Native pager component for horizontal page-based navigation with proper
 * gesture conflict resolution between vertical scrolling and horizontal paging.
 *
 * Features:
 * - Native iOS paging with smooth momentum
 * - Automatic vertical/horizontal scroll conflict resolution
 * - Controlled and uncontrolled modes
 * - Page change callbacks
 *
 * Usage:
 * ```tsx
 * <Carousel currentPage={page} onPageChange={setPage}>
 *   <view>Page 1</view>
 *   <view>Page 2</view>
 *   <view>Page 3</view>
 * </Carousel>
 * ```
 *
 * Native element: <pager> (registered as 'pager' in LynxCarousel.m)
 */

import * as React from '@lynx-js/react';
import { type ViewProps } from '@lynx-js/types';
import { cn } from '../../lib/utils';
import type { LynxReactNode } from '../../types/react';

export interface CarouselProps extends Omit<ViewProps, 'children'> {
  /** Current page index (0-based). Omit for uncontrolled mode. */
  currentPage?: number;
  /** Default page index for uncontrolled mode */
  defaultPage?: number;
  /** Callback fired when page changes */
  onPageChange?: (page: number) => void;
  /** Whether paging is enabled (default: true) */
  pagingEnabled?: boolean;
  /** Child pages to render */
  children: LynxReactNode;
}

/**
 * Carousel - Native horizontal pager with gesture conflict resolution
 *
 * Supports both controlled and uncontrolled modes:
 * - Controlled: Pass `currentPage` and `onPageChange` props
 * - Uncontrolled: Use `defaultPage` and optional `onPageChange`
 */
export function Carousel({
  currentPage: controlledPage,
  defaultPage = 0,
  onPageChange,
  pagingEnabled = true,
  className,
  children,
  ...props
}: CarouselProps) {
  // Internal state for uncontrolled mode
  const [internalPage, setInternalPage] = React.useState(defaultPage);

  // Determine if controlled or uncontrolled
  const isControlled = controlledPage !== undefined;
  const currentPage = isControlled ? controlledPage : internalPage;

  // Handle page change events from native component
  const handlePageChange = (e: any) => {
    'background only';
    const newPage = e.detail?.position ?? 0;

    // Update internal state if uncontrolled
    if (!isControlled) {
      setInternalPage(newPage);
    }

    // Call callback if provided
    onPageChange?.(newPage);
  };

  // Convert children to array for consistent handling
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    // @ts-ignore
    <carousel
      data-slot="carousel"
      className={cn('w-full h-full', className)}
      current-page={currentPage}
      paging-enabled={pagingEnabled}
      bindpagechange={handlePageChange}
      {...props}
    >
      {childrenArray.map((child, index) => (
        <view
          key={index}
          data-page={index}
          className="w-full h-full"
        >
          {child}
        </view>
      ))}
      {/* @ts-ignore */}
    </carousel>
  );
}
