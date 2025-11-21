/**
 * Screen Tracking Example
 * 
 * Demonstrates analytics tracking with useNavigationTracking and useRouteTimingTracker
 */

import { useState, useEffect } from '@lynx-js/react';
import { Column, Text, Button, Row, useTheme } from '@ariob/ui';
import { useNavigationTracking, useRouteTimingTracker, createScreenTracker } from '@ariob/ui';
import type { NavigationStackScreenProps } from '../../navigation/types';

export function TrackingExample({ navigation }: NavigationStackScreenProps<'TrackingExample'>) {
  const { theme } = useTheme();
  const [screenViews, setScreenViews] = useState<string[]>([]);
  const [timings, setTimings] = useState<Array<{ screen: string; duration: number }>>([]);

  console.log('[TrackingExample] Rendering');

  // Create a screen tracker
  const trackScreen = createScreenTracker((event, properties) => {
    console.log('[TrackingExample] Analytics Event:', event, properties);
  });

  // Track screen views
  useNavigationTracking({
    onScreenChange: (screen, params) => {
      console.log('[TrackingExample] Screen changed:', screen, params);
      trackScreen(screen, params);
      
      setScreenViews(prev => [...prev, `${screen} at ${new Date().toLocaleTimeString()}`]);
    },
    onStateChange: (state) => {
      console.log('[TrackingExample] State changed:', state);
    },
  });

  // Track screen timing
  useRouteTimingTracker({
    onRouteStart: (screen) => {
      console.log('[TrackingExample] Route started:', screen);
    },
    onRouteEnd: (screen, duration) => {
      console.log('[TrackingExample] Route ended:', screen, 'Duration:', duration);
      
      setTimings(prev => [...prev, { screen, duration }].slice(-5)); // Keep last 5
    },
  });

  return (
    <Column className="flex-1 bg-background p-6">
      <Text className="text-2xl font-bold mb-2">Screen Tracking</Text>
      <Text className="text-muted-foreground mb-6">
        Analytics integration with useNavigationTracking
      </Text>

      {/* Screen Views */}
      <Column className="mb-6">
        <Text className="text-lg font-semibold mb-3">Screen Views</Text>
        <Text className="text-sm text-muted-foreground mb-2">
          Recent screen views (last {screenViews.length})
        </Text>
        
        <Column className="p-4 bg-card rounded-lg">
          {screenViews.length === 0 ? (
            <Text className="text-muted-foreground text-sm">
              Navigate to other screens to see tracking...
            </Text>
          ) : (
            screenViews.slice(-5).map((view, index) => (
              <Text key={index} className="text-sm mb-1">
                • {view}
              </Text>
            ))
          )}
        </Column>
      </Column>

      {/* Screen Timings */}
      <Column className="mb-6">
        <Text className="text-lg font-semibold mb-3">Screen Timings</Text>
        <Text className="text-sm text-muted-foreground mb-2">
          Time spent on each screen
        </Text>
        
        <Column className="p-4 bg-card rounded-lg">
          {timings.length === 0 ? (
            <Text className="text-muted-foreground text-sm">
              Navigate away to see timing data...
            </Text>
          ) : (
            timings.map((timing, index) => (
              <Row key={index} justify="between" className="mb-2">
                <Text className="text-sm">{timing.screen}</Text>
                <Text className="text-sm text-muted-foreground">
                  {(timing.duration / 1000).toFixed(1)}s
                </Text>
              </Row>
            ))
          )}
        </Column>
      </Column>

      {/* Test Navigation */}
      <Column className="mb-6">
        <Text className="text-lg font-semibold mb-3">Test Navigation</Text>
        
        <Button className="mb-2" onTap={() => navigation.navigate('NavigationHome')}>
          <Text>Navigate to Home</Text>
        </Button>

        <Button className="mb-2" onTap={() => navigation.navigate('ActionsExample')}>
          <Text>Navigate to Actions</Text>
        </Button>

        <Button className="mb-2" onTap={() => navigation.navigate('HooksExample')}>
          <Text>Navigate to Hooks</Text>
        </Button>
      </Column>

      {/* Info */}
      <Column className="p-4 bg-muted rounded-lg">
        <Text className="text-sm text-muted-foreground mb-2">
          💡 All tracking events are logged to the console
        </Text>
        <Text className="text-sm text-muted-foreground">
          In a real app, you'd send these to your analytics platform (e.g., Google Analytics, Mixpanel, Segment)
        </Text>
      </Column>
    </Column>
  );
}

