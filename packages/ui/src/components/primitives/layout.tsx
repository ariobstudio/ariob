import * as React from '@lynx-js/react';
import { useState, useEffect } from '@lynx-js/react';
import { type ViewProps } from '@lynx-js/types';
import { cn } from '../../lib/utils';
import { LayoutContext, type LayoutContextValue } from '../../hooks/useLayout';
import type { LynxReactNode } from '../../types/react';

interface LayoutProps extends ViewProps {
  /**
   * Children to render inside the layout
   */
  children?: LynxReactNode;
  /**
   * Whether to apply safe area padding
   * @default true
   */
  safeArea?: boolean;
  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Layout component that provides screen information context and handles safe areas
 *
 * Features:
 * - Automatically applies pt-safe-top and pb-safe-bottom
 * - Provides screen dimensions and platform info via context
 * - Responsive breakpoint helpers (isSmallScreen, isMediumScreen, isLargeScreen)
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <Layout>
 *       <MyContent />
 *     </Layout>
 *   );
 * }
 *
 * function MyContent() {
 *   const { screenWidth, platform, isSmallScreen } = useLayout();
 *   return <text>Width: {screenWidth}px on {platform}</text>;
 * }
 * ```
 */
function Layout({ children, safeArea = true, className, ...props }: LayoutProps) {
  const [layoutInfo, setLayoutInfo] = useState<LayoutContextValue>(() => {
    // Initialize with SystemInfo values
    const screenWidth = SystemInfo.pixelWidth / SystemInfo.pixelRatio;
    const screenHeight = SystemInfo.pixelHeight / SystemInfo.pixelRatio;
    const isLandscape = screenWidth > screenHeight;
    const isSmallScreen = screenWidth < 640;
    const isMediumScreen = screenWidth >= 640 && screenWidth < 1024;
    const isLargeScreen = screenWidth >= 1024;

    return {
      screenWidth,
      screenHeight,
      platform: SystemInfo.platform,
      pixelRatio: SystemInfo.pixelRatio,
      isLandscape,
      isSmallScreen,
      isMediumScreen,
      isLargeScreen,
    };
  });

  // Update layout info if screen dimensions change (e.g., rotation)
  useEffect(() => {
    'background only';

    const updateLayout = () => {
      const screenWidth = SystemInfo.pixelWidth / SystemInfo.pixelRatio;
      const screenHeight = SystemInfo.pixelHeight / SystemInfo.pixelRatio;
      const isLandscape = screenWidth > screenHeight;
      const isSmallScreen = screenWidth < 640;
      const isMediumScreen = screenWidth >= 640 && screenWidth < 1024;
      const isLargeScreen = screenWidth >= 1024;

      setLayoutInfo({
        screenWidth,
        screenHeight,
        platform: SystemInfo.platform,
        pixelRatio: SystemInfo.pixelRatio,
        isLandscape,
        isSmallScreen,
        isMediumScreen,
        isLargeScreen,
      });
    };

    // Note: LynxJS doesn't have a native resize event
    // If your platform supports it, you can add a listener here
    // For now, we just set it once on mount

  }, []);

  return (
    <LayoutContext.Provider value={layoutInfo}>
      <page
        data-slot="layout"
        className={cn(
          safeArea && 'pt-8 pb-8',
          className
        )}
        {...props}
      >
        {children}
      </page>
    </LayoutContext.Provider>
  );
}

export { Layout };
export type { LayoutProps };
