import React from 'react';
import clsx from 'clsx';

export type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onPress?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

/**
 * Button component that follows our design system
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  className = ''
}: ButtonProps) {
  const baseClasses = 'rounded-md font-medium flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-primary text-on-primary border border-outline',
    secondary: 'bg-surface-variant text-on-background border border-outline'
  }[variant];
  
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2.5',
    lg: 'text-lg px-5 py-3'
  }[size];
  
  const buttonClass = clsx(baseClasses, variantClasses, sizeClasses, className);

  const handleTap = (e: any) => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <view className={buttonClass} bindtap={handleTap}>
      {typeof children === 'string' ? 
        <text className={clsx("text-on-surface", { 
          "text-sm": size === "sm", 
          "text-base": size === "md",
          "text-lg": size === "lg"
        })}>
          {children}
        </text> 
        : children}
    </view>
  );
} 