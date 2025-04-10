import React from 'react';

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
  return (
    <view className={`w-full mb-6 p-4 border-b border-outline ${className}`}>
      <view className="flex items-center justify-between">
        <view>
          <text className="text-xxl font-bold text-on-background">
            {title}
          </text>
          
          {description && (
            <text className="mt-2 text-sm text-on-surface-variant">
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