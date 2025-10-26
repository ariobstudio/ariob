/**
 * Settings Feature Bundle
 *
 * User settings and configuration screen.
 */

import { root } from '@lynx-js/react';
import { Settings } from '../screens/Settings';
import type { Navigator } from '../components';
import { createNavigator } from '../components';
import type { IGunChainReference } from '@ariob/core';
import { graph, logout as logoutFn } from '@ariob/core';

export interface SettingsFeatureProps {
  data?: any;
  navigator: Navigator;
  graph: IGunChainReference;
}

/**
 * SettingsFeature - Wrapper for Settings screen with navigation
 */
export function SettingsFeature({ navigator, graph }: SettingsFeatureProps) {
  const handleBack = () => {
    'background only';
    navigator.goBack();
  };

  const handleLogout = () => {
    'background only';
    console.log('[Settings] User logged out, navigating to auth');

    // Call logout function
    logoutFn(graph);

    // Navigate to auth
    navigator.navigate('auth');
  };

  return <Settings graph={graph} onBack={handleBack} onLogout={handleLogout} />;
}

// Default export for direct rendering (standalone mode)
export default function SettingsFeatureRoot() {
  const g = graph();
  const navigator = createNavigator('settings');
  return <SettingsFeature navigator={navigator} graph={g} />;
}
