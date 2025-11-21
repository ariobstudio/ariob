/**
 * NavigatorContainer Component
 *
 * Wrapper for Navigator that provides theming and page container.
 */

import { cn, useTheme } from '@ariob/ui';
import type { IGunChainReference } from '@ariob/core';
import type { NavigatorInstance } from './useNavigator';
import { Navigator as NavigatorComponent } from './Navigator';
import { useSettings } from '../../store/settings';

export interface NavigatorContainerProps {
  /** Navigator instance from useNavigator hook */
  navigator: NavigatorInstance;
  /** Gun graph instance to pass to features */
  graph: IGunChainReference;
}

/**
 * NavigatorContainer wraps the Navigator with theming and page structure.
 */
export function NavigatorContainer({
  navigator,
  graph,
}: NavigatorContainerProps) {
  const { withTheme } = useTheme();
  const boardTheme = useSettings((state) => state.boardTheme);

  return (
    <page
      className={cn(
        withTheme('', 'dark'),
        `theme-${boardTheme}`,
        'bg-background w-full h-full pb-safe-bottom pt-safe-top'
      )}
    >
      <NavigatorComponent
        navigator={navigator}
        graph={graph}
      />
    </page>
  );
}
