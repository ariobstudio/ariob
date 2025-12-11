import * as React from '@lynx-js/react';
import { type ViewProps } from '@lynx-js/types';

import { cn } from '../../lib/utils';

interface SeparatorProps extends ViewProps {
  /**
   * Orientation of the separator
   * @default "horizontal"
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Whether to add decorative styling
   * @default true
   */
  decorative?: boolean;
}

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <view
      data-slot="separator"
      data-orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
export type { SeparatorProps };
