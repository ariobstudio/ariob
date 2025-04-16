import React from 'react';
import { useTheme } from './ThemeProvider';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Container component for layout structure with responsive width
 */
export function Container({
  children,
  className = ''
}: ContainerProps) {
  const { withTheme } = useTheme();
  
  return (
    <view 
      className={withTheme(
        "container px-4 flex flex-col bg-white",
        "container px-4 flex flex-col bg-gray-900"
      ) + ` ${className}`}
      style={{
        width: '100%',
        height: '100%',
        flex: 1
      }}
    >
      {children}
    </view>
  );
}