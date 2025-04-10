import React from 'react';

type ScrollableContentProps = {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
};

/**
 * ScrollableContent component provides a scrollable container using Lynx's scroll-view
 * This wraps content to make it scrollable and can be reused across screens
 */
export function ScrollableContent({ 
  children, 
  className = '',
  padded = true
}: ScrollableContentProps) {
  return (
    <scroll-view 
      scroll-orientation="vertical"
      style={{
        width: '100%',
        height: '100%',
        flex: 1,
      }}
      className={`scroll-container ${className}`}
      bindscroll={(e) => {
        // Optional scroll event handling
        // console.log('Scrolling', e.detail);
      }}
      bindscrolltoupper={(e) => {
        // Optional top reached event
        // console.log('Reached top', e.detail);
      }}
      bindscrolltolower={(e) => {
        // Optional bottom reached event
        // console.log('Reached bottom', e.detail);
      }}
    >
      <view className={padded ? 'p-lg' : ''} style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {children}
      </view>
    </scroll-view>
  );
}