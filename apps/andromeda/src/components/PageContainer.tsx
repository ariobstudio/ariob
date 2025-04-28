import { ReactNode } from 'react';
import { useTheme } from './ThemeProvider';
import { ScrollableContent } from './ScrollableContent';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
  safeAreaTop?: boolean;
}

/**
 * PageContainer provides a consistent container for all pages
 * with proper theming and layout
 */
export function PageContainer({
  children,
  className = '',
  scrollable = true,
  safeAreaTop = true
}: PageContainerProps) {
  const { withTheme } = useTheme();
  
  const containerContent = (
    <view 
      className={withTheme(
        "p-4 bg-white",
        "p-4 bg-gray-900"
      ) + `w-full h-full flex flex-col pt-safe-top ${className}`} 
    >
      <view style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
        {children}
      </view>
    </view>
  );
  
  return scrollable ? (
    <ScrollableContent>
      {containerContent}
    </ScrollableContent>
  ) : containerContent;
} 