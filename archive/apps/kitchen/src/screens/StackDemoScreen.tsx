/**
 * Stack Demo Screen
 *
 * Demonstrates stack navigation operations
 */

import { useState } from '@lynx-js/react';
import {
  Column,
  Row,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Icon,
  Badge,
  Scrollable,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@ariob/ui';
import type { NavigationStackScreenProps } from '../navigation/types';

export function StackDemoScreen({
  navigation,
  route,
}: NavigationStackScreenProps<'StackDemo'>) {
  const [pushCount, setPushCount] = useState(0);

  const handlePush = () => {
    'background only';
    setPushCount(prev => prev + 1);
    navigation.navigate('StackDemoScreen');
  };

  const handlePop = () => {
    'background only';
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handlePopToTop = () => {
    'background only';
    // Navigate to root - implementation depends on your navigation setup
    navigation.goBack();
  };

  const handleReplace = () => {
    'background only';
    // Use navigate with replace: true option instead
    navigation.navigate('ProfileScreen', {
      userId: '456',
      name: 'Jane Smith',
    });
  };

  const stackDepth = navigation.getState().routes.length;

  return (
    <Scrollable direction="vertical" className="flex-1 bg-green-500">
      <Column spacing="lg" className="p-6">
        {/* Header */}
        <Column spacing="sm">
          <text className="text-foreground text-2xl font-bold">
            Stack Operations Demo
          </text>
          <text className="text-muted-foreground text-sm">
            Try different stack navigation methods
          </text>
        </Column>

        {/* Stack Info */}
        <Alert variant="default">
          <AlertTitle icon={<Icon name="info" />}>
            Current Stack Depth
          </AlertTitle>
          <AlertDescription>
            You are currently {stackDepth} screen(s) deep in the navigation stack.
            {pushCount > 0 && ` You've pushed ${pushCount} time(s) from this screen.`}
          </AlertDescription>
        </Alert>

        {/* Navigation Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Methods</CardTitle>
            <CardDescription>
              Standard stack navigation operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Column spacing="md">
              <Column spacing="sm">
                <Button
                  onTap={handlePush}
                  prefix={<Icon name="plus" />}
                >
                  Push (this screen again)
                </Button>
                <text className="text-muted-foreground text-xs ml-1">
                  navigation.push('StackDemo')
                </text>
              </Column>

              <Column spacing="sm">
                <Button
                  variant="outline"
                  onTap={handlePop}
                  disabled={!navigation.canGoBack()}
                  prefix={<Icon name="arrow-left" />}
                >
                  Pop
                </Button>
                <text className="text-muted-foreground text-xs ml-1">
                  navigation.pop()
                </text>
              </Column>

              <Column spacing="sm">
                <Button
                  variant="outline"
                  onTap={() => navigation.goBack()}
                  disabled={!navigation.canGoBack()}
                  prefix={<Icon name="arrow-left" />}
                >
                  Go Back
                </Button>
                <text className="text-muted-foreground text-xs ml-1">
                  navigation.goBack()
                </text>
              </Column>

              <Column spacing="sm">
                <Button
                  variant="outline"
                  onTap={handlePopToTop}
                  disabled={stackDepth <= 1}
                  prefix={<Icon name="arrow-up-to-line" />}
                >
                  Pop to Top
                </Button>
                <text className="text-muted-foreground text-xs ml-1">
                  navigation.popToTop()
                </text>
              </Column>

              <Column spacing="sm">
                <Button
                  variant="destructive"
                  onTap={handleReplace}
                  prefix={<Icon name="replace" />}
                >
                  Replace with Profile
                </Button>
                <text className="text-muted-foreground text-xs ml-1">
                  navigation.replace('ProfileScreen', params)
                </text>
              </Column>
            </Column>
          </CardContent>
        </Card>

        {/* Navigate to Other Screens */}
        <Card>
          <CardHeader>
            <CardTitle>Navigate to Other Screens</CardTitle>
            <CardDescription>
              Test navigation with parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Column spacing="md">
              <Button
                variant="outline"
                onTap={() =>
                  navigation.navigate('DetailScreen', {
                    itemId: String(Math.floor(Math.random() * 1000)),
                    title: 'Random Item',
                  })
                }
                prefix={<Icon name="file-text" />}
              >
                Go to Detail (random ID)
              </Button>

              <Button
                variant="outline"
                onTap={() =>
                  navigation.navigate('SettingsScreen', {})
                }
                prefix={<Icon name="settings" />}
              >
                Go to Settings
              </Button>
            </Column>
          </CardContent>
        </Card>

        {/* Stack State */}
        <Card>
          <CardHeader>
            <CardTitle>Stack State</CardTitle>
            <CardDescription>
              Current navigation stack
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Column spacing="sm">
              {navigation.getState().routes.map((route, index) => (
                <Row key={route.key} spacing="sm" align="center">
                  <Badge variant={index === navigation.getState().index ? 'default' : 'secondary'}>
                    {index + 1}
                  </Badge>
                  <text className="text-foreground text-sm">
                    {route.name}
                  </text>
                  {index === navigation.getState().index && (
                    <Badge variant="success">
                      <text className="text-xs">Current</text>
                    </Badge>
                  )}
                </Row>
              ))}
            </Column>
          </CardContent>
        </Card>
      </Column>
    </Scrollable>
  );
}
