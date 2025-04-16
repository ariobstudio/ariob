import React from 'react';
import logo from '@/src/assets/ariob.png';
import { useTheme } from './ThemeProvider';

type HeaderProps = {
  title?: string;
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
            {showLogo && (
              <image 
                src={logo} 
                clip-radius="true" 
                className="rounded-lg"
                style={{width: '32px', height: '32px', backgroundColor: 'transparent'}} 
              />
            )}
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