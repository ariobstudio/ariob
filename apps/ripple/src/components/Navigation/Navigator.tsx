/**
 * Navigator Component
 *
 * Manages feature navigation using conditional rendering.
 * Each feature is a separate bundle loaded based on navigation state.
 */

import { cn } from '@ariob/ui';
import type { IGunChainReference } from '@ariob/core';
import type { Navigator as NavigatorType } from './useNavigator';

// Import feature bundles (each has its own entry point)
import { AuthFeature } from '../../auth';
import { FeedFeature } from '../../feed';
import { ThreadFeature } from '../../thread';
import { ComposerFeature } from '../../composer';
import { ProfileFeature } from '../../profile';
import { SettingsFeature } from '../../settings';

export interface NavigatorProps {
  /** Navigator instance from useNavigator hook */
  navigator: NavigatorType;
  /** Gun graph instance to pass to features */
  graph: IGunChainReference;
  /** Transition duration in ms */
  transitionDuration?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Navigator renders the active feature with transitions.
 * Uses conditional rendering to show the appropriate feature component.
 * Supports event-based navigation with smooth transitions.
 * Passes graph instance to all features for consistent Gun access.
 */
export function Navigator({
  navigator,
  graph,
  transitionDuration = 300,
  className,
}: NavigatorProps) {
  const { current, isTransitioning } = navigator;

  // Render the active feature component with graph instance
  const renderFeature = () => {
    switch (current.feature) {
      case 'auth':
        return <AuthFeature data={current.data} navigator={navigator} graph={graph} />;
      case 'feed':
        return <FeedFeature data={current.data} navigator={navigator} graph={graph} />;
      case 'thread':
        return <ThreadFeature data={current.data} navigator={navigator} graph={graph} />;
      case 'composer':
        return <ComposerFeature data={current.data} navigator={navigator} graph={graph} />;
      case 'profile':
        return <ProfileFeature data={current.data} navigator={navigator} graph={graph} />;
      case 'settings':
        return <SettingsFeature data={current.data} navigator={navigator} graph={graph} />;
      default:
        return null;
    }
  };

  return (
    <view
      key={current.id}
      className={cn(
        'w-full h-full',
        className
      )}
      style={{
        animation: isTransitioning
          ? `slideIn ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
          : 'none',
        opacity: isTransitioning ? 0.95 : 1,
        transitionProperty: 'opacity',
        transitionDuration: `${transitionDuration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {renderFeature()}
    </view>
  );
}
