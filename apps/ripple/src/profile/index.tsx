/**
 * Profile Feature Bundle
 *
 * User profile, settings, and logout.
 */

import { root } from '@lynx-js/react';
import type { IGunChainReference } from '@ariob/core';
import { graph } from '@ariob/core';
import type { Navigator } from '../components';
import { createNavigator } from '../components';

// Import profile screen
import { Profile } from '../screens/Profile';

export interface ProfileFeatureProps {
  data?: any;
  navigator: Navigator;
  graph: IGunChainReference;
}

/**
 * ProfileFeature displays user profile and settings
 */
export function ProfileFeature({ data, navigator, graph }: ProfileFeatureProps) {
  const handleLogout = () => {
    'background only';
    console.log('[Profile] User logged out, navigating to auth');
    navigator.reset('auth');
  };

  const handleBack = () => {
    'background only';
    console.log('[Profile] Going back');
    navigator.goBack();
  };

  return (
    <Profile
      graph={graph}
      onLogout={handleLogout}
      onBack={navigator.canGoBack ? handleBack : undefined}
    />
  );
}

export default function ProfileFeatureRoot() {
  const g = graph();
  const navigator = createNavigator('profile');
  return <ProfileFeature navigator={navigator} graph={g} />;
}
