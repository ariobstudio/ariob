/**
 * Navigation Hooks Example
 * 
 * Demonstrates helper hooks: useLinkTo, useLinkBuilder, usePreventRemove
 */

import { useState, useRef } from '@lynx-js/react';
import { Column, Text, Button, Input, Row, useTheme } from '@ariob/ui';
import { useLinkTo, useLinkBuilder, usePreventRemove, useScrollToTop } from '@ariob/ui';
import type { NavigationStackScreenProps } from '../../navigation/types';

export function HooksExample({ navigation }: NavigationStackScreenProps<'HooksExample'>) {
  const { theme } = useTheme();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pathInput, setPathInput] = useState('/NavigationHome');
  const scrollRef = useRef(null);

  // Hook examples
  const linkTo = useLinkTo();
  const buildLink = useLinkBuilder();

  console.log('[HooksExample] Rendering, hasUnsavedChanges:', hasUnsavedChanges);

  // useScrollToTop example (would work with a ScrollView)
  useScrollToTop(scrollRef);

  // usePreventRemove example
  usePreventRemove(hasUnsavedChanges, ({ action }) => {
    console.log('[HooksExample] Navigation prevented, action:', action);
    // In a real app, you'd show a confirmation dialog here
    alert('You have unsaved changes! Are you sure you want to leave?');
  });

  const handleUseLinkTo = () => {
    console.log('[HooksExample] useLinkTo:', pathInput);
    linkTo(pathInput);
  };

  const handleBuildLink = () => {
    const link = buildLink('NavigationHome', { timestamp: Date.now() });
    console.log('[HooksExample] Built link:', link);
    // In a real app, you'd use a proper alert/modal
    console.log('Built link:', link);
  };

  const handleToggleUnsaved = () => {
    const newValue = !hasUnsavedChanges;
    console.log('[HooksExample] Toggle unsaved changes:', newValue);
    setHasUnsavedChanges(newValue);
  };

  return (
    <Column className="flex-1 bg-background p-6">
      <Text className="text-2xl font-bold mb-2">Navigation Hooks</Text>
      <Text className="text-muted-foreground mb-6">
        Demonstrates helper hooks for navigation
      </Text>

      {/* useLinkTo Example */}
      <Column className="mb-6">
        <Text className="text-lg font-semibold mb-3">useLinkTo</Text>
        <Text className="text-sm text-muted-foreground mb-2">
          Navigate using path strings
        </Text>
        
        <Input
          value={pathInput}
          onChange={(e: any) => setPathInput(e.target?.value || '')}
          placeholder="/Screen?param=value"
          className="mb-2"
        />
        
        <Button onTap={handleUseLinkTo}>
          <Text>Navigate to Path</Text>
        </Button>
      </Column>

      {/* useLinkBuilder Example */}
      <Column className="mb-6">
        <Text className="text-lg font-semibold mb-3">useLinkBuilder</Text>
        <Text className="text-sm text-muted-foreground mb-2">
          Build links from screen names and params
        </Text>
        
        <Button onTap={handleBuildLink}>
          <Text>Build Link (Home + timestamp)</Text>
        </Button>
      </Column>

      {/* usePreventRemove Example */}
      <Column className="mb-6">
        <Text className="text-lg font-semibold mb-3">usePreventRemove</Text>
        <Text className="text-sm text-muted-foreground mb-2">
          Prevent navigation when there are unsaved changes
        </Text>
        
        <Button 
          className="mb-2" 
          onTap={handleToggleUnsaved}
          variant={hasUnsavedChanges ? 'default' : 'outline'}
        >
          <Text>
            {hasUnsavedChanges ? '✓ Has Unsaved Changes' : 'Toggle Unsaved Changes'}
          </Text>
        </Button>

        {hasUnsavedChanges && (
          <view className="p-3 bg-yellow-500/20 rounded-lg mb-2">
            <Text className="text-sm text-yellow-700 dark:text-yellow-300">
              ⚠️ Navigation is now blocked. Try going back!
            </Text>
          </view>
        )}

        <Button onTap={() => navigation.goBack()}>
          <Text>Try to Go Back</Text>
        </Button>
      </Column>

      {/* useScrollToTop Example */}
      <Column className="mb-6">
        <Text className="text-lg font-semibold mb-3">useScrollToTop</Text>
        <Text className="text-sm text-muted-foreground">
          Automatically scrolls to top when tab is pressed (works with ScrollView)
        </Text>
      </Column>

      {/* Info */}
      <Column className="p-4 bg-muted rounded-lg">
        <Text className="text-sm text-muted-foreground">
          💡 All hooks are logged to the console. Try the different examples to see how they work!
        </Text>
      </Column>
    </Column>
  );
}

