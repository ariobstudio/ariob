/**
 * PageLayout Component
 *
 * Reusable full-page layout wrapper with:
 * - Platform detection (mobile vs desktop)
 * - Consistent theming and safe area handling
 * - Customizable className and children
 */

import { useTheme, cn } from '@ariob/ui';
import type { ReactNode } from '@lynx-js/react';

interface PageLayoutProps {
  /** Child elements to render inside the page */
  children: ReactNode;
  /** Additional className to merge with defaults */
  className?: string;
}

/**
 * Get platform-specific classes based on SystemInfo.platform
 */
function getPlatformClasses(): string {
  const platform = (globalThis as any).SystemInfo?.platform;

  // Desktop platforms typically have more screen space
  if (platform === 'macos' || platform === 'windows' || platform === 'linux') {
    return 'max-w-screen-lg mx-auto'; // Future: can add desktop-specific styling
  }

  // Mobile platforms (ios, android) stay full width
  return '';
}

/**
 * PageLayout wraps screens with consistent styling and platform detection
 *
 * @example
 * ```tsx
 * <PageLayout>
 *   <Column className="p-4">
 *     <Text>My Screen Content</Text>
 *   </Column>
 * </PageLayout>
 * ```
 */
export function PageLayout({ children, className }: PageLayoutProps) {
  const { withTheme } = useTheme();
  const platformClasses = getPlatformClasses();

  return (
    <page
      className={cn(
        withTheme('', 'dark'),
        'bg-background w-full h-full pb-safe-bottom pt-safe-top',
        platformClasses,
        className
      )}
    >
      {children}
    </page>
  );
}
