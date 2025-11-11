/**
 * Navigator Component
 *
 * Simple screen switcher using boolean flags (Lynx homepage pattern).
 * No switch statements, just conditional rendering.
 */

import { cn } from '@ariob/ui';
import type { IGunChainReference } from '@ariob/core';
import type { NavigatorInstance } from './useNavigator';

// Import feature components
import { WelcomeScreen } from '../../screens/Welcome';
import { LobbyFeature } from '../../lobby';
import { GameFeature } from '../../game';
import { SettingsScreen } from '../../screens/Settings';
import { VariantSelector } from '../../screens/VariantSelector';

export interface NavigatorProps {
  /** Navigator instance from useNavigator hook */
  navigator: NavigatorInstance;
  /** Gun graph instance to pass to features */
  graph: IGunChainReference;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Navigator renders the active feature using simple boolean flags.
 * Following the Lynx homepage pattern for simplicity.
 * Each feature is conditionally rendered based on current navigation state.
 */
export function Navigator({
  navigator,
  graph,
  className,
}: NavigatorProps) {
  const { current } = navigator;

  // Simple boolean flags for each feature (Lynx pattern)
  const showWelcome = current.feature === 'welcome';
  const showLobby = current.feature === 'lobby';
  const showGame = current.feature === 'game';
  const showSettings = current.feature === 'settings';
  const showVariantSelector = current.feature === 'variantSelector';

  return (
    <view className={cn('w-full h-full', className)}>
      {showWelcome && (
        <WelcomeScreen
          data={current.data}
          navigator={navigator}
          graph={graph}
        />
      )}

      {showLobby && (
        <LobbyFeature
          data={current.data}
          navigator={navigator}
          graph={graph}
        />
      )}

      {showGame && (
        <GameFeature
          data={current.data}
          navigator={navigator}
          graph={graph}
        />
      )}

      {showSettings && (
        <SettingsScreen
          data={current.data}
          navigator={navigator}
          graph={graph}
        />
      )}

      {showVariantSelector && (
        <VariantSelector
          data={current.data}
          navigator={navigator}
          graph={graph}
        />
      )}
    </view>
  );
}
