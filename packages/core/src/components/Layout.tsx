import React from 'react';

type LayoutProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
};

/**
 * Main layout component for app structure
 */
export function Layout({
  children,
  header,
  className = ''
}: LayoutProps) {
  return (
    <view 
      className={`flex flex-col safe-area-top bg-background ${className}`} 
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
      }}
    >
      <view className="bg-background">
        {header}
      </view>
      
      <view 
        style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </view>
    </view>
  );
}