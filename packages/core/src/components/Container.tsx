import React from 'react';

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
  return (
    <view 
      className={`container px-4 flex flex-col ${className}`}
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