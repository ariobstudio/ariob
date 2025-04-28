import React from 'react';
import { useTheme } from './ThemeProvider';

type HeaderProps = {
  title?: string;
  logo?: React.ReactNode;
  rightContent?: React.ReactNode;
  leftContent?: React.ReactNode;
  className?: string;
  onTitleClick?: () => void;
  showLogo?: boolean;
};

/**
 * Header component for app navigation with customizable content sections
 */
export function Header({
  title = 'Ariob',
  logo, 
  rightContent,
  leftContent,
  className = '',
  onTitleClick,
  showLogo = true
}: HeaderProps) {
  const { withTheme } = useTheme();
  
  const handleTitleClick = (e: any) => {
    if (onTitleClick) {
      onTitleClick();
    }
  };
  
  return (
    <view 
      className={withTheme(
        "header flex items-center border-b border-gray-200 justify-between bg-white",
        "header flex items-center border-b border-gray-700 justify-between bg-gray-800"
      ) + ` ${className}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      <view className="flex items-center gap-2">
        {leftContent ? (
          leftContent
        ) : (
          <view bindtap={handleTitleClick} className="flex items-center gap-2">
            {showLogo && logo}
            <text className={withTheme(
              "title text-xl font-semibold text-gray-900",
              "title text-xl font-semibold text-white"
            )}>{title}</text>
          </view>
        )}
      </view>
      
      {rightContent && (
        <view>
          {rightContent}
        </view>
      )}
    </view>
  );
}