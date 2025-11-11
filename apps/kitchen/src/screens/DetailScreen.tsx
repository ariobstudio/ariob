/**
 * Detail Screen
 *
 * Demonstrates a typical detail view with navigation
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
  Row,
  Scrollable,
  useNavigation,
  useRoute,
} from '@ariob/ui';
import type { KitchenParamList, NavigationStackScreenProps } from '../navigation/types';
import type { StackNavigationProp, RouteProp } from '@ariob/ui';

export function DetailScreen() {
  // Alternative: use hooks instead of props
  const navigation = useNavigation() as unknown as StackNavigationProp<KitchenParamList, 'DetailScreen'>;
  const route = useRoute<RouteProp<KitchenParamList, 'DetailScreen'>>();

  const { itemId, title } = route.params;

  return (
    <Scrollable direction="vertical" className="flex-1">
      <Column spacing="lg" className="p-6">
        {/* Header */}
        <Column spacing="sm">
          <text className="text-foreground text-2xl font-bold">
            {title}
          </text>
          <Badge variant="outline">
            <text>Item #{itemId}</text>
          </Badge>
        </Column>

        {/* Item Details */}
        <Card>
          <CardHeader>
            <CardTitle>Item Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Column spacing="md">
              <Row spacing="sm" justify="between" align="center">
                <text className="text-foreground text-sm font-medium">
                  ID
                </text>
                <Badge variant="secondary">
                  <text>{itemId}</text>
                </Badge>
              </Row>

              <Row spacing="sm" justify="between" align="center">
                <text className="text-foreground text-sm font-medium">
                  Title
                </text>
                <text className="text-muted-foreground text-sm">
                  {title}
                </text>
              </Row>

              <Row spacing="sm" justify="between" align="center">
                <text className="text-foreground text-sm font-medium">
                  Status
                </text>
                <Badge variant="success">
                  <Icon name="check" />
                  <text>Active</text>
                </Badge>
              </Row>
            </Column>
          </CardContent>
        </Card>

        {/* Using Hooks Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Using Navigation Hooks</CardTitle>
          </CardHeader>
          <CardContent>
            <Column spacing="sm">
              <text className="text-muted-foreground text-sm">
                This screen demonstrates using navigation hooks:
              </text>
              <text className="text-muted-foreground text-xs ml-2">
                • useNavigation() - Access navigation object
              </text>
              <text className="text-muted-foreground text-xs ml-2">
                • useRoute() - Access current route and params
              </text>
              <text className="text-muted-foreground text-xs mt-2">
                These hooks can be used anywhere in your component tree!
              </text>
            </Column>
          </CardContent>
        </Card>

        {/* Navigation Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Navigate From Here</CardTitle>
          </CardHeader>
          <CardContent>
            <Column spacing="md">
              <Button
                variant="outline"
                onTap={() =>
                  navigation.navigate('ProfileScreen', {
                    userId: itemId.toString(),
                    name: title,
                  })
                }
                prefix={<Icon name="user" />}
              >
                View Related Profile
              </Button>

              <Button
                variant="outline"
                onTap={() =>
                  navigation.push('DetailScreen', {
                    itemId: itemId + 1,
                    title: `Next Item: ${title}`,
                  })
                }
                prefix={<Icon name="plus" />}
              >
                Push Next Detail
              </Button>

              <Button
                variant="outline"
                onTap={() => navigation.popToTop()}
                prefix={<Icon name="arrow-up-to-line" />}
              >
                Pop to Top
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

        {/* Stack Info */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation State</CardTitle>
          </CardHeader>
          <CardContent>
            <Column spacing="sm">
              <Row spacing="sm" justify="between">
                <text className="text-foreground text-sm">Stack Depth</text>
                <Badge variant="outline">
                  <text>{navigation.getState().routes.length}</text>
                </Badge>
              </Row>
              <Row spacing="sm" justify="between">
                <text className="text-foreground text-sm">Can Go Back</text>
                <Badge variant={navigation.canGoBack() ? 'success' : 'secondary'}>
                  <text>{navigation.canGoBack() ? 'Yes' : 'No'}</text>
                </Badge>
              </Row>
            </Column>
          </CardContent>
        </Card>
      </Column>
    </Scrollable>
  );
}
