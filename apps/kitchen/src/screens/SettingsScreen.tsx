/**
 * Settings Screen
 *
 * Demonstrates optional route parameters
 */

import {} from '@lynx-js/react';
import {
  Column,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Icon,
  Badge,
  Separator,
  Scrollable,
} from '@ariob/ui';
import type { NavigationStackScreenProps } from '../navigation/types';

export function SettingsScreen({
  navigation,
  route,
}: NavigationStackScreenProps<'SettingsScreen'>) {
  // Optional parameter with default
  const section = route.params?.section || 'general';

  const sections = [
    { id: 'general', name: 'General', icon: 'settings' },
    { id: 'privacy', name: 'Privacy', icon: 'lock' },
    { id: 'notifications', name: 'Notifications', icon: 'bell' },
    { id: 'profile', name: 'Profile', icon: 'user' },
  ];

  return (
    <Scrollable direction="vertical" className="flex-1">
      <Column spacing="lg" className="p-6">
        {/* Header */}
        <Column spacing="sm">
          <text className="text-foreground text-2xl font-bold">
            Settings
          </text>
          <Badge variant="outline">
            <text>Section: {section}</text>
          </Badge>
        </Column>

        {/* Current Section Info */}
        <Card>
          <CardHeader>
            <CardTitle>Optional Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <Column spacing="sm">
              <text className="text-muted-foreground text-sm">
                This screen has an optional 'section' parameter.
              </text>
              <text className="text-muted-foreground text-sm">
                Current section: <text className="font-medium text-foreground">{section}</text>
              </text>
              <text className="text-muted-foreground text-xs mt-2">
                Navigate here with or without the section param - TypeScript won't complain!
              </text>
            </Column>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        <Card>
          <CardHeader>
            <CardTitle>Available Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <Column spacing="sm">
              {sections.map((item) => (
                <view key={item.id}>
                  <Button
                    variant={section === item.id ? 'default' : 'outline'}
                    onTap={() =>
                      navigation.navigate('SettingsScreen', {
                        section: item.id,
                      })
                    }
                    prefix={<Icon name={item.icon as any} />}
                  >
                    {item.name}
                  </Button>
                </view>
              ))}
            </Column>
          </CardContent>
        </Card>

        <Separator />

        {/* Navigation Actions */}
        <Column spacing="md">
          <Button
            variant="outline"
            onTap={() =>
              navigation.navigate('ProfileScreen', {
                userId: '789',
                name: 'Settings User',
              })
            }
            prefix={<Icon name="user" />}
          >
            Go to Profile
          </Button>

          <Button
            variant="ghost"
            onTap={() => navigation.goBack()}
            prefix={<Icon name="arrow-left" />}
          >
            Go Back
          </Button>
        </Column>
      </Column>
    </Scrollable>
  );
}
