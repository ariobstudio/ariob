/**
 * FeedItemWrapper
 *
 * Container for feed items with focus lens effect.
 * Handles tap events, focus state, and visual elevation using CSS animations.
 */

import { type ReactNode } from '@lynx-js/react';
import { cn } from '@ariob/ui';

export interface FeedItemWrapperProps {
  /** Unique identifier for this item */
  id: string;
  /** LynxJS list item-key (required for list virtualization) */
  'item-key'?: string;
  /** Whether this item is currently focused (centered in viewport) */
  isFocused?: boolean;
  /** Child content (preview component) */
  children: ReactNode;
  /** Tap handler - promotes item to full-screen */
  onTap?: () => void;
  /** Long press handler - shows quick actions */
  onLongPress?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: any;
}

/**
 * FeedItemWrapper wraps preview components with focus lens behavior.
 * When centered in the viewport, the item scales up slightly using CSS transitions.
 */
export function FeedItemWrapper({
  id,
  'item-key': itemKey,
  isFocused = false,
  children,
  onTap,
  onLongPress,
  className,
  style,
}: FeedItemWrapperProps) {
  const handleTap = () => {
    'background only';
    if (onTap) {
      onTap();
    }
  };

  const handleLongPress = () => {
    'background only';
    if (onLongPress) {
      onLongPress();
    }
  };

  return (
    <view
      item-key={itemKey}
      data-feed-item-id={id}
      className={cn(
        // Base styles with CSS transitions
        'relative w-full',
        'transition-all duration-300 ease-out',
        // Focus lens effect - scale and shadow
        isFocused && 'scale-[1.02] shadow-lg z-10',
        !isFocused && 'scale-100 shadow-sm z-1',
        // Interactive feedback
        'cursor-pointer active:scale-[0.98]',
        className
      )}
      style={style}
      bindtap={handleTap}
      bindlongpress={handleLongPress}
    >
      {/* Content */}
      <view className="w-full">{children}</view>

      {/* Focus indicator ring */}
      {isFocused && (
        <view
          className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none rounded-lg"
          style={{
            border: '2px solid rgba(var(--primary-rgb, 59, 130, 246), 0.2)',
            animation: 'focusPulse 2s ease-in-out infinite',
          }}
        />
      )}
    </view>
  );
}
