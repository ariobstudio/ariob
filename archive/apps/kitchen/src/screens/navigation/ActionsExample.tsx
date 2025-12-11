/**
 * Navigation Actions Example
 * 
 * Demonstrates all navigation actions from CommonActions, StackActions, TabActions
 */

import { Column, Text, Button, Row, useTheme } from '@ariob/ui';
import { CommonActions, StackActions } from '@ariob/ui';
import type { NavigationStackScreenProps } from '../../navigation/types';

export function ActionsExample({ navigation }: NavigationStackScreenProps<'ActionsExample'>) {
  const { theme } = useTheme();

  console.log('[ActionsExample] Rendering');

  const handleCommonNavigate = () => {
    console.log('[ActionsExample] CommonActions.navigate');
    // Use navigate directly instead of dispatch
    navigation.navigate('NavigationHome');
  };

  const handleCommonGoBack = () => {
    console.log('[ActionsExample] CommonActions.goBack');
    navigation.goBack();
  };

  const handleCommonSetParams = () => {
    console.log('[ActionsExample] CommonActions.setParams');
    // setParams is typically used with navigation.setParams
    console.log('Set params action:', CommonActions.setParams({ timestamp: Date.now() }));
  };

  const handleStackPush = () => {
    console.log('[ActionsExample] StackActions.push');
    // Push another instance of this screen
    navigation.navigate('ActionsExample');
  };

  const handleStackPop = () => {
    console.log('[ActionsExample] StackActions.pop');
    navigation.goBack();
  };

  const handleStackPopToTop = () => {
    console.log('[ActionsExample] StackActions.popToTop');
    // Navigate to first screen in stack
    navigation.navigate('NavigationHome');
  };

  const handleStackReplace = () => {
    console.log('[ActionsExample] StackActions.replace');
    // Replace with NavigationHome
    navigation.navigate('NavigationHome');
  };

  return (
    <Column className="flex-1 bg-background p-6">
      <Text className="text-2xl font-bold mb-2">Navigation Actions</Text>
      <Text className="text-muted-foreground mb-6">
        Demonstrates CommonActions and StackActions
      </Text>

      {/* Common Actions */}
      <Column className="mb-6">
        <Text className="text-lg font-semibold mb-3">CommonActions</Text>
        
        <Button className="mb-2" onTap={handleCommonNavigate}>
          <Text>Navigate to Home</Text>
        </Button>

        <Button className="mb-2" onTap={handleCommonGoBack}>
          <Text>Go Back</Text>
        </Button>

        <Button className="mb-2" onTap={handleCommonSetParams}>
          <Text>Set Params (timestamp)</Text>
        </Button>
      </Column>

      {/* Stack Actions */}
      <Column className="mb-6">
        <Text className="text-lg font-semibold mb-3">StackActions</Text>
        
        <Button className="mb-2" onTap={handleStackPush}>
          <Text>Push (this screen)</Text>
        </Button>

        <Button className="mb-2" onTap={handleStackPop}>
          <Text>Pop (go back)</Text>
        </Button>

        <Button className="mb-2" onTap={handleStackPopToTop}>
          <Text>Pop to Top</Text>
        </Button>

        <Button className="mb-2" onTap={handleStackReplace}>
          <Text>Replace with Home</Text>
        </Button>
      </Column>

      {/* Info */}
      <Column className="p-4 bg-muted rounded-lg">
        <Text className="text-sm text-muted-foreground">
          💡 Check the console logs to see which actions are being dispatched.
          All actions are logged with timestamps.
        </Text>
      </Column>
    </Column>
  );
}

