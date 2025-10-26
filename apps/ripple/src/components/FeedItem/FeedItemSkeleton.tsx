/**
 * FeedItemSkeleton
 *
 * Skeleton loader for feed items during loading state.
 */

import { cn } from '@ariob/ui';

export interface FeedItemSkeletonProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * FeedItemSkeleton displays an animated placeholder for loading feed items.
 */
export function FeedItemSkeleton({ className }: FeedItemSkeletonProps) {
  return (
    <view
      className={cn(
        'w-full p-4 bg-card rounded-lg border border-border mb-3',
        className
      )}
    >
      {/* Header skeleton */}
      <view className="flex flex-row items-center gap-3 mb-3">
        <view className="w-10 h-10 rounded-full bg-muted animate-pulse" />
        <view className="flex-1">
          <view className="w-24 h-4 bg-muted rounded animate-pulse mb-2" />
          <view className="w-16 h-3 bg-muted rounded animate-pulse" />
        </view>
      </view>

      {/* Content skeleton */}
      <view className="space-y-2">
        <view className="w-full h-3 bg-muted rounded animate-pulse" />
        <view className="w-5/6 h-3 bg-muted rounded animate-pulse" />
        <view className="w-4/6 h-3 bg-muted rounded animate-pulse" />
      </view>

      {/* Footer skeleton */}
      <view className="flex flex-row items-center gap-4 mt-4">
        <view className="w-16 h-3 bg-muted rounded animate-pulse" />
        <view className="w-16 h-3 bg-muted rounded animate-pulse" />
      </view>
    </view>
  );
}
