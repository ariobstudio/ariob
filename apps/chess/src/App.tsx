/**
 * Senterej App Shell
 *
 * Single bundle app with state-based navigation.
 * Auto-authentication with anonymous accounts.
 */

import { useState, useMemo, useEffect } from '@lynx-js/react';
import { graph, useAuth, graphStore } from '@ariob/core';
import { useTheme, cn, Spinner } from '@ariob/ui';
import { NavigatorContainer, useNavigator } from './components/Navigation';
import { initializeTheme, useSettings } from './store/settings';
import './styles/chess.css';

export function App() {
  // Create graph instance once
  const g = useMemo(() => graph(), []);
  const { isLoggedIn, create, keys } = useAuth(g);
  const { withTheme } = useTheme();

  // Track auth initialization
  const [authChecked, setAuthChecked] = useState(false);

  // Log Gun configuration on mount
  useEffect(() => {
    'background only';
    const { peers } = graphStore.getState();
    console.log('[Senterej] Gun peers:', peers?.length || 0);

    // Initialize board theme from settings
    initializeTheme();
  }, []);

  // Auto-create anonymous account on first launch
  useEffect(() => {
    'background only';

    if (authChecked) return;

    if (!keys) {
      // No keys - create anonymous account
      const randomAlias = `player_${Date.now().toString(36)}`;
      console.log('[Senterej] Creating anonymous account:', randomAlias);

      create(randomAlias)
        .then((result) => {
          'background only';
          if (result.ok) {
            console.log('[Senterej] ✓ Account created successfully');
            setAuthChecked(true);
          } else {
            console.error('[Senterej] Account creation failed:', result.error);
            // Still mark as checked to avoid infinite loop, but won't be logged in
            setAuthChecked(true);
          }
        })
        .catch((err) => {
          'background only';
          console.error('[Senterej] Account creation error:', err);
          setAuthChecked(true);
        });
    } else {
      // Have keys - mark as checked
      setAuthChecked(true);
    }
  }, [keys, authChecked, create]);

  // Get onboarding status
  const hasCompletedOnboarding = useSettings((state) => state.hasCompletedOnboarding);

  // Create navigator (starts at welcome or lobby)
  const navigator = useNavigator(hasCompletedOnboarding ? 'lobby' : 'welcome');

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <page className={cn(withTheme('', 'dark'), 'pt-safe-top pb-safe-bottom bg-background w-full h-full')}>
        <view className="flex items-center justify-center w-full h-full">
          <Spinner size="xl" color="default" />
        </view>
      </page>
    );
  }

  // Log auth state for debugging
  console.log('[Senterej] Rendering app - isLoggedIn:', isLoggedIn, 'keys:', !!keys);

  // Render navigator with all features
  return <NavigatorContainer navigator={navigator} graph={g} />;
}
