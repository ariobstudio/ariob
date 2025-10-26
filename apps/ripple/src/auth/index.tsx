/**
 * Auth Feature Bundle
 *
 * Handles user authentication flow: Welcome → Create Account / Login
 * This is a separate bundle loaded by the Navigator.
 */

import { root, useState } from '@lynx-js/react';
import type { IGunChainReference } from '@ariob/core';
import { graph } from '@ariob/core';
import type { Navigator } from '../components';
import { createNavigator } from '../components';

// Import auth screens
import { Welcome } from '../screens/Welcome';
import { CreateAccount } from '../screens/CreateAccount';
import { Login } from '../screens/Login';

export interface AuthFeatureProps {
  /** Navigation data passed from navigator */
  data?: any;
  /** Navigator instance for navigation */
  navigator: Navigator;
  /** Gun graph instance */
  graph: IGunChainReference;
}

type AuthScreen = 'welcome' | 'create-account' | 'login';

/**
 * AuthFeature manages the authentication flow
 * Handles screen transitions within the auth bundle
 */
export function AuthFeature({ data, navigator, graph }: AuthFeatureProps) {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('welcome');

  const handleAuthSuccess = () => {
    'background only';
    // Navigate to feed after successful authentication
    console.log('[Auth] Authentication successful, navigating to feed');
    navigator.navigate('feed');
  };

  const handleBack = () => {
    'background only';
    setCurrentScreen('welcome');
  };

  // Render the appropriate auth screen with graph instance
  switch (currentScreen) {
    case 'create-account':
      return (
        <CreateAccount
          graph={graph}
          onBack={handleBack}
          onSuccess={handleAuthSuccess}
        />
      );

    case 'login':
      return (
        <Login
          graph={graph}
          onBack={handleBack}
          onSuccess={handleAuthSuccess}
        />
      );

    default:
      return (
        <Welcome
          onCreateAccount={() => {
            'background only';
            setCurrentScreen('create-account');
          }}
          onLogin={() => {
            'background only';
            setCurrentScreen('login');
          }}
        />
      );
  }
}

// Default export for direct rendering (standalone mode)
export default function AuthFeatureRoot() {
  const g = graph();
  const navigator = createNavigator('auth');
  return <AuthFeature navigator={navigator} graph={g} />;
}
