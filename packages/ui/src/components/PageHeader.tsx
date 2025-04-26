import React from 'react';
import { useTheme } from './ThemeProvider';

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

/**
 * PageHeader component for consistent page titles with optional description and actions
 */
export function PageHeader({
  title,
  description,
  actions,
  className = '',
}: PageHeaderProps) {
  const { withTheme } = useTheme();
  
  return (
    <view className={withTheme(
      "w-full mb-6 p-4 border-b border-gray-200",
      "w-full mb-6 p-4 border-b border-gray-700"
    ) + ` ${className}`}>
      <view className="flex items-center justify-between">
        <view>
          <text className={withTheme(
            "text-xxl font-bold text-gray-900",
            "text-xxl font-bold text-white"
          )}>
            {title}
          </text>
          
          {description && (
            <text className={withTheme(
              "mt-2 text-sm text-gray-600",
              "mt-2 text-sm text-gray-400"
            )}>
              {description}
            </text>
          )}
        </view>
        
        {actions && (
          <view className="flex items-center gap-2">
            {actions}
          </view>
        )}
      </view>
    </view>
  );
} 