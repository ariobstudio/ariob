/**
 * Profile Screen
 *
 * Demonstrates receiving and using route parameters
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
  Avatar,
  Badge,
  Scrollable,
} from '@ariob/ui';
import type { NavigationStackScreenProps } from '../navigation/types';

export function ProfileScreen({
  navigation,
  route,
}: NavigationStackScreenProps<'ProfileScreen'>) {
  // Type-safe access to route params!
  const { userId, name } = route.params;

  return (
    <Scrollable direction="vertical" className="flex-1">
      <Column spacing="lg" className="p-6">
        {/* Header with Avatar */}
        <Column spacing="md" align="center">
          <Avatar name={name} size="xl" online />
          <Column spacing="xs" align="center">
            <text className="text-foreground text-2xl font-bold">
              {name}
            </text>
            <Badge variant="outline">
              <text>ID: {userId}</text>
            </Badge>
          </Column>
        </Column>

        {/* Route Params Info */}
        <Card>
          <CardHeader>
            <CardTitle>Route Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <Column spacing="sm">
              <Column spacing="xs">
                <text className="text-foreground text-sm font-medium">
                  User ID
                </text>
                <text className="text-muted-foreground text-sm">
                  {userId}
                </text>
              </Column>

              <Column spacing="xs">
                <text className="text-foreground text-sm font-medium">
                  Name
                </text>
                <text className="text-muted-foreground text-sm">
                  {name}
                </text>
              </Column>

              <Column spacing="xs">
                <text className="text-muted-foreground text-xs">
                  These parameters were passed via navigation.navigate()
                </text>
              </Column>
            </Column>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Column spacing="md">
              <Button
                variant="outline"
                onTap={() =>
                  navigation.navigate('SettingsScreen', {
                    section: 'profile',
                  })
                }
                prefix={<Icon name="settings" />}
              >
                Edit Profile
              </Button>

              <Button
                variant="outline"
                onTap={() =>
                  navigation.navigate('DetailScreen', {
                    itemId: userId,
                    title: `${name}'s Details`,
                  })
                }
                prefix={<Icon name="file-text" />}
              >
                View Details
              </Button>

              <Button
                variant="ghost"
                onTap={() => navigation.goBack()}
                prefix={<Icon name="arrow-left" />}
              >
                Go Back
              </Button>
            </Column>
          </CardContent>
        </Card>

        {/* Type Safety Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Type Safety</CardTitle>
          </CardHeader>
          <CardContent>
            <Column spacing="sm">
              <text className="text-muted-foreground text-sm">
                ✅ TypeScript knows this screen requires 'userId' and 'name' parameters
              </text>
              <text className="text-muted-foreground text-sm">
                ✅ Compile-time error if you navigate here without params
              </text>
              <text className="text-muted-foreground text-sm">
                ✅ IntelliSense for route.params properties
              </text>
            </Column>
          </CardContent>
        </Card>
      </Column>
    </Scrollable>
  );
}
