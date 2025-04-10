import React from 'react';
import logo from '@/src/assets/ariob.png';

type HeaderProps = {
  title?: string;
  rightContent?: React.ReactNode;
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
  className = '',
  onTitleClick,
  showLogo = true
}: HeaderProps) {
  const handleTitleClick = (e: any) => {
    if (onTitleClick) {
      onTitleClick();
    }
  };
  
  return (
    <view 
      className={`header flex items-center border-b border-outline justify-between ${className}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      <view className="flex items-center gap-2" bindtap={handleTitleClick}>
        {showLogo && (
          <image 
            src={logo} 
            clip-radius="true" 
            className="rounded-lg"
            style={{width: '32px', height: '32px', backgroundColor: 'transparent'}} 
          />
        )}
        <text className="title text-xl font-semibold text-on-surface-variant">{title}</text>
      </view>
      
      {rightContent && (
        <view>
          {rightContent}
        </view>
      )}
    </view>
  );
}