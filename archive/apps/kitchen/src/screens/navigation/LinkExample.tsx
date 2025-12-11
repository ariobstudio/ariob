/**
 * Link Component Example
 * 
 * Demonstrates declarative navigation using the Link component
 */

import { Column, Text, Link, useTheme } from '@ariob/ui';
import type { NavigationStackScreenProps } from '../../navigation/types';

export function LinkExample({ navigation }: NavigationStackScreenProps<'LinkExample'>) {
  const { theme } = useTheme();

  console.log('[LinkExample] Rendering');

  return (
    <Column className="flex-1 bg-background p-6">
      <Text className="text-2xl font-bold mb-2">Link Component</Text>
      <Text className="text-muted-foreground mb-6">
        Declarative navigation with accessibility support
      </Text>

      {/* Basic Links */}
      <Column className="mb-6">
        <Text className="text-lg font-semibold mb-3">Basic Links</Text>
        
        <Link to="/NavigationHome" className="mb-3 p-4 bg-card rounded-lg">
          <Text className="text-primary">→ Navigate to Home</Text>
        </Link>

        <Link to="/StackDemo" className="mb-3 p-4 bg-card rounded-lg">
          <Text className="text-primary">→ Navigate to Stack Demo</Text>
        </Link>

        <Link to="/LiquidGlassExample" className="mb-3 p-4 bg-card rounded-lg">
          <Text className="text-primary">→ Navigate to Liquid Glass</Text>
        </Link>
      </Column>

      {/* Links with Parameters */}
      <Column className="mb-6">
        <Text className="text-lg font-semibold mb-3">Links with Parameters</Text>
        
        <Link 
          to="/ActionsExample?timestamp=123456" 
          className="mb-3 p-4 bg-card rounded-lg"
        >
          <Column>
            <Text className="text-primary font-semibold">→ Actions with Params</Text>
            <Text className="text-sm text-muted-foreground">
              Passes timestamp=123456
            </Text>
          </Column>
        </Link>

        <Link 
          to="/HooksExample?demo=true&source=link" 
          className="mb-3 p-4 bg-card rounded-lg"
        >
          <Column>
            <Text className="text-primary font-semibold">→ Hooks with Multiple Params</Text>
            <Text className="text-sm text-muted-foreground">
              Passes demo=true & source=link
            </Text>
          </Column>
        </Link>
      </Column>

      {/* Styled Links */}
      <Column className="mb-6">
        <Text className="text-lg font-semibold mb-3">Styled Links</Text>
        
        <Link 
          to="/NavigationHome" 
          className="mb-3 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"
        >
          <Text className="text-white font-bold text-center">
            🎨 Gradient Link
          </Text>
        </Link>

        <Link 
          to="/NavigationHome" 
          className="mb-3 p-4 border-2 border-primary rounded-lg"
        >
          <Text className="text-primary font-semibold text-center">
            📦 Bordered Link
          </Text>
        </Link>
      </Column>

      {/* Info */}
      <Column className="p-4 bg-muted rounded-lg">
        <Text className="text-sm text-muted-foreground mb-2">
          💡 Link components are accessible by default (role="link")
        </Text>
        <Text className="text-sm text-muted-foreground">
          All navigation is logged to the console with timestamps.
        </Text>
      </Column>
    </Column>
  );
}

