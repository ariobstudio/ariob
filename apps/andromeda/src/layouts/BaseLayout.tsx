import { Column, Row } from '@/components/primitives';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import React from 'react';

interface BaseLayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showBottomNav?: boolean;
  header?: React.ReactNode;
  bottomNav?: React.ReactNode;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  className,
  showHeader = true,
  showBottomNav = false,
  header,
  bottomNav,
}) => {
  const { withTheme } = useTheme();

  return (
    <page
      className={withTheme(
        'bg-background text-foreground',
        'dark bg-background text-foreground',
      )}
    >
      <view
        className={cn(
          'flex flex-col h-full',
          'pt-safe-top pb-safe-bottom px-4', // Lynx safe area support
          className,
        )}
      >
        {/* Header */}
        {showHeader && header && (
          <Row width='full' className="flex-shrink-0 z-50">{header}</Row>
        )}

        {/* Main Content */}
        <view
          className={cn(
            'flex flex-col',
            showBottomNav && 'pb-16', // Add bottom padding when bottom nav is shown
          )}
        >
          <Column className="h-full">{children}</Column>
        </view>

        {/* Bottom Navigation */}
        {showBottomNav && bottomNav && (
          <view className="fixed bottom-0 left-0 right-0 z-50 pb-safe-bottom">
            {bottomNav}
          </view>
        )}
      </view>
    </page>
  );
};
