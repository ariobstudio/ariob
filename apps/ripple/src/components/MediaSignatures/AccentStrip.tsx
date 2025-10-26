/**
 * AccentStrip
 *
 * 2px colored strip on the left edge of feed items.
 * Provides accessibility-friendly visual distinction between content types.
 */

import { cn } from '@ariob/ui';

export interface AccentStripProps {
  /** Accent color */
  color: 'blue' | 'green' | 'orange' | 'purple';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Color-to-Tailwind mapping
 */
const ACCENT_COLORS: Record<AccentStripProps['color'], string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
};

/**
 * AccentStrip renders a 2px vertical strip on the left edge.
 * Provides color-coded visual distinction for content types.
 */
export function AccentStrip({ color, className }: AccentStripProps) {
  return (
    <view
      className={cn(
        'absolute left-0 top-0 h-full w-[2px]',
        ACCENT_COLORS[color],
        className
      )}
      aria-hidden="true"
    />
  );
}
