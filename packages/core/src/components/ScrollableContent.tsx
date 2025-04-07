import { PropsWithChildren } from '@lynx-js/react';

/**
 * ScrollableContent component provides a scrollable container using Lynx's scroll-view
 * This wraps content to make it scrollable and can be reused across screens
 */
export function ScrollableContent({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <scroll-view 
      className={`ScrollableContent ${className}`}
      scroll-orientation="vertical"
      enable-scroll={true}
      bounces={true}
      scroll-bar-enable={true}
    >
      <view className="ScrollableContentInner">
        {children}
      </view>
    </scroll-view>
  );
} 