import { createContext, useContext } from '@lynx-js/react';

export interface LayoutContextValue {
  /**
   * Screen width in logical pixels (physical pixels / pixel ratio)
   */
  screenWidth: number;
  /**
   * Screen height in logical pixels (physical pixels / pixel ratio)
   */
  screenHeight: number;
  /**
   * Device platform: 'Android', 'iOS', 'macOS', 'windows', or 'headless'
   */
  platform: string;
  /**
   * Device pixel ratio
   */
  pixelRatio: number;
  /**
   * Whether the device is in landscape mode
   */
  isLandscape: boolean;
  /**
   * Whether the screen is considered small (< 640px)
   */
  isSmallScreen: boolean;
  /**
   * Whether the screen is considered medium (640px - 1024px)
   */
  isMediumScreen: boolean;
  /**
   * Whether the screen is considered large (>= 1024px)
   */
  isLargeScreen: boolean;
}

export const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export function useLayout(): LayoutContextValue {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a Layout component');
  }
  return context;
}
