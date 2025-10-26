/**
 * Ripple App Shell
 *
 * Main application shell with frame-based navigation.
 * Loads feature bundles dynamically based on navigation state.
 */

import { useState, useCallback, useMemo, useEffect } from '@lynx-js/react';
import { graph, useAuth, graphStore } from '@ariob/core';
import { useTheme, cn } from '@ariob/ui';
import { NavigatorContainer, useNavigator, type FeatureName } from './components';

export function App() {
  // Memoize graph instance - create once, reuse across renders
  const g = useMemo(() => graph(), []);
  const { isLoggedIn, login, keys } = useAuth(g);

  // Log Gun configuration once on mount
  useEffect(() => {
    'background only';
    const graphState = graphStore.getState();
    console.log('[Ripple] Gun initialized with peers:', JSON.stringify(graphState.peers));
    if (!graphState.peers || graphState.peers.length === 0) {
      console.warn('[Ripple] ⚠ No Gun peers configured - data will only be stored locally');
    } else if (typeof graphState.peers[0] !== 'string') {
      console.error('[Ripple] ✗ Peers array corrupted! Expected strings, got:', typeof graphState.peers[0]);
    }
  }, []);

  // Determine initial feature based on current auth state
  const initialFeature: FeatureName = isLoggedIn ? 'feed' : 'auth';
  const navigator = useNavigator(initialFeature);

  // Track auth check state
  const [authChecked, setAuthChecked] = useState(false);

  // Memoized auth check function
  const checkAuth = useCallback(() => {
    'background only';

    if (authChecked) return; // Only run once

    console.log('[Ripple] Checking for stored credentials...');

    // If we have stored keys, login directly
    if (keys) {
      console.log('[Ripple] Found stored keys, logging in...');

      login(keys).then((result) => {
        'background only';

        if (result.ok) {
          console.log('[Ripple] ✓ Auto-login successful');
          navigator.navigate('feed');
        } else {
          console.log('[Ripple] Auto-login failed, showing auth');
        }

        setAuthChecked(true);
      }).catch((err) => {
        'background only';
        console.error('[Ripple] Auto-login error:', err);
        setAuthChecked(true);
      });
    } else {
      console.log('[Ripple] No stored credentials, showing auth');
      setAuthChecked(true);
    }
  }, [authChecked, login, keys, navigator]);

  // Initialize auth check on first render
  if (!authChecked) {
    checkAuth();

    // Return early with loading state
    const { withTheme } = useTheme();
    return (
      <page className={cn(withTheme('', 'dark'), "bg-background w-full h-full pb-safe-bottom pt-safe-top")} style={{paddingTop: '16px'}}>
        <view className="w-full h-full flex items-center justify-center">
          <text className="text-muted-foreground text-sm">Loading Ripple...</text>
        </view>
      </page>
    );
  }

  // Render frame-based navigation shell
  // Note: NavigatorContainer renders feature bundles that each have their own <page>
  // Pass graph instance to navigator so features can use it
  return <NavigatorContainer navigator={navigator} graph={g} />;
}
