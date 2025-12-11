/**
 * Navigation Demo Home Screen
 *
 * Demonstrates the navigation system with various examples
 */

import {} from '@lynx-js/react';
import {
  Column,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Icon,
  Scrollable,
} from '@ariob/ui';
import type { NavigationStackScreenProps } from '../navigation/types';

export function NavigationHomeScreen({
  navigation,
}: NavigationStackScreenProps<'NavigationHome'>) {
  return (
    <Scrollable direction="vertical" className="flex-1 bg-orange-500">
      <Column spacing="lg" className="p-6">
        {/* Header */}
        <Column spacing="sm">
          <text className="text-foreground text-3xl font-bold">
            Navigation System
          </text>
          <text className="text-muted-foreground text-sm">
            Type-safe navigation with native iOS integration
          </text>
        </Column>

        {/* Stack Navigation Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Stack Navigation</CardTitle>
            <CardDescription>
              Push, pop, and navigate between screens with native transitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Column spacing="md">
              <Button
                onTap={() => navigation.navigate('StackDemo')}
                prefix={<Icon name="layers" />}
              >
                Stack Demo
              </Button>

              <Button
                variant="outline"
                onTap={() =>
                  navigation.navigate('ProfileScreen', {
                    userId: '123',
                    name: 'John Doe',
                  })
                }
                prefix={<Icon name="user" />}
              >
                Profile (with params)
              </Button>

              <Button
                variant="outline"
                onTap={() =>
                  navigation.navigate('SettingsScreen', {
                    section: 'privacy',
                  })
                }
                prefix={<Icon name="settings" />}
              >
                Settings (optional params)
              </Button>

              <Button
                variant="outline"
                onTap={() =>
                  navigation.navigate('DetailScreen', {
                    itemId: '42',
                    title: 'Awesome Item',
                  })
                }
                prefix={<Icon name="file-text" />}
              >
                Detail Screen
              </Button>
            </Column>
          </CardContent>
        </Card>

        {/* Visual Effects */}
        <Card>
          <CardHeader>
            <CardTitle>Visual Effects</CardTitle>
            <CardDescription>
              iOS 26+ liquid glass and blur effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Column spacing="md">
              <Button
                onTap={() => navigation.navigate('LiquidGlassExample')}
                prefix={<Icon name="droplet" />}
              >
                Liquid Glass Demo
                <Badge variant="secondary" className="ml-2">iOS 26+</Badge>
              </Button>
            </Column>
          </CardContent>
        </Card>

        {/* Actions & Helpers */}
        <Card>
          <CardHeader>
            <CardTitle>Actions & Helpers</CardTitle>
            <CardDescription>
              Navigation actions, hooks, and utilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Column spacing="md">
              <Button
                onTap={() => navigation.navigate('ActionsExample')}
                prefix={<Icon name="zap" />}
              >
                Navigation Actions
              </Button>

              <Button
                onTap={() => navigation.navigate('HooksExample')}
                prefix={<Icon name="code" />}
              >
                Navigation Hooks
              </Button>

              <Button
                onTap={() => navigation.navigate('LinkExample')}
                prefix={<Icon name="link" />}
              >
                Link Component
              </Button>
            </Column>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics & Tracking</CardTitle>
            <CardDescription>
              Screen tracking and analytics integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Column spacing="md">
              <Button
                onTap={() => navigation.navigate('TrackingExample')}
                prefix={<Icon name="activity" />}
              >
                Screen Tracking
              </Button>
            </Column>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>
              What makes this navigation system special
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Column spacing="sm">
              <Column spacing="xs">
                <Badge variant="success">
                  <Icon name="check" />
                  <text>Type-safe</text>
                </Badge>
                <text className="text-muted-foreground text-sm ml-1">
                  Full TypeScript support with IntelliSense
                </text>
              </Column>

              <Column spacing="xs">
                <Badge variant="success">
                  <Icon name="check" />
                  <text>Native iOS</text>
                </Badge>
                <text className="text-muted-foreground text-sm ml-1">
                  UINavigationController with swipe-back gestures
                </text>
              </Column>

              <Column spacing="xs">
                <Badge variant="success">
                  <Icon name="check" />
                  <text>React Navigation API</text>
                </Badge>
                <text className="text-muted-foreground text-sm ml-1">
                  Familiar API for React Native developers
                </text>
              </Column>

              <Column spacing="xs">
                <Badge variant="success">
                  <Icon name="check" />
                  <text>LynxJS Optimized</text>
                </Badge>
                <text className="text-muted-foreground text-sm ml-1">
                  Dual-thread architecture support
                </text>
              </Column>
            </Column>
          </CardContent>
        </Card>

        {/* Navigation State */}
        <Card>
          <CardHeader>
            <CardTitle>Current Navigation State</CardTitle>
            <CardDescription>
              Real-time navigation stack information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Column spacing="sm">
              <Column spacing="xs">
                <text className="text-foreground text-sm font-medium">
                  Stack Depth
                </text>
                <text className="text-muted-foreground text-sm">
                  {navigation.getState().routes.length} screen(s)
                </text>
              </Column>

              <Column spacing="xs">
                <text className="text-foreground text-sm font-medium">
                  Can Go Back
                </text>
                <Badge variant={navigation.canGoBack() ? 'default' : 'secondary'}>
                  {navigation.canGoBack() ? 'Yes' : 'No'}
                </Badge>
              </Column>

              <Column spacing="xs">
                <text className="text-foreground text-sm font-medium">
                  Current Screen
                </text>
                <text className="text-muted-foreground text-sm">
                  NavigationHome
                </text>
              </Column>
            </Column>
          </CardContent>
        </Card>
      </Column>
    </Scrollable>
  );
}
