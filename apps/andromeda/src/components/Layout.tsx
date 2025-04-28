import React from 'react';
import { useTheme } from './ThemeProvider';

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
  const { withTheme } = useTheme();
  
  return (
    <view 
      className={withTheme(
        "flex flex-col pt-safe-top bg-white",
        "flex flex-col pt-safe-top bg-gray-900"
      ) + ` ${className}`} 
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
      }}
    >
      <view className={withTheme("bg-white", "bg-gray-900")}>
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