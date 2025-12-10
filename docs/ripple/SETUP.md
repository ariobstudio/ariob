# Setup

Installation and configuration guide for @ariob/ripple.

---

## Installation

```bash
# In the monorepo
pnpm add @ariob/ripple

# Peer dependencies
pnpm add @ariob/core @ariob/andromeda react-native-unistyles
```

---

## Theme Configuration

Ripple provides pre-built themes that work with Unistyles. You can use them directly or extend them.

### Using Ripple Themes

```typescript
// unistyles.config.ts
import { StyleSheet } from 'react-native-unistyles';
import { rippleThemes, rippleBreakpoints } from '@ariob/ripple/styles';

type AppThemes = typeof rippleThemes;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: rippleThemes,
  breakpoints: rippleBreakpoints,
  settings: {
    adaptiveThemes: true,
    CSSVars: true,
  },
});
```

### Importing in Root Layout

```typescript
// app/_layout.tsx
import '../unistyles.config'; // Must be first!
```

---

## Gun Database Setup

Ripple requires @ariob/core to be initialized with a storage adapter:

```typescript
// app/_layout.tsx
import 'react-native-get-random-values';
import '../unistyles.config';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { init } from '@ariob/core';

// Initialize Gun with AsyncStorage adapter
const gun = init({
  peers: ['https://gun-manhattan.herokuapp.com/gun'],
  store: {
    get: async (key: string, cb: (val: any) => void) => {
      try {
        const val = await AsyncStorage.getItem(key);
        cb(val ? JSON.parse(val) : undefined);
      } catch (e) {
        cb(undefined);
      }
    },
    put: async (key: string, val: any, cb: (ack: any) => void) => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(val));
        cb({ ok: 1 });
      } catch (e) {
        cb({ err: e });
      }
    }
  }
});
```

---

## Actions Configuration

Create your app's action configuration:

```typescript
// config/actions.ts
import { make, createFeedConfigs, createNodeMenus } from '@ariob/ripple';
import { router } from 'expo-router';

// Define all actions
export const actions = {
  post: make('post', { icon: 'add', label: 'Post' }),
  reply: make('reply', { icon: 'arrow-undo', label: 'Reply' }),
  save: make('save', { icon: 'bookmark-outline', label: 'Save' }),
  share: make('share', { icon: 'share-outline', label: 'Share' }),
  config: make('config', {
    icon: 'settings',
    label: 'Settings',
    sub: [
      { name: 'profile', icon: 'person', label: 'Profile' },
      { name: 'theme', icon: 'color-palette', label: 'Theme' },
    ],
  }),
  more: make('more', { icon: 'ellipsis-horizontal', label: 'More' }),
};

// Feed configuration per degree
export const feedConfig = createFeedConfigs({
  0: { main: 'post', left: 'config', right: 'more' },
  1: { main: 'post', right: 'find' },
  2: { main: 'post', left: 'trend', right: 'search' },
  3: { main: 'post', right: 'search' },
  4: { main: 'post' },
});

// Node menus per type
export const nodeMenus = createNodeMenus({
  post: {
    quick: ['reply', 'save', 'share'],
    detail: ['reply'],
    opts: ['report', 'block'],
  },
  message: {
    quick: ['reply', 'forward'],
    detail: ['reply'],
    opts: ['delete'],
  },
});

// Action handler
export const handleAction = (action: string, context: any) => {
  switch (action) {
    case 'post':
      router.push('/compose');
      break;
    case 'reply':
      router.push(`/thread/${context.node?.id}`);
      break;
    case 'profile':
      router.push('/profile');
      break;
    // ... handle other actions
  }
};
```

---

## Full Layout Setup

```typescript
// app/_layout.tsx
import 'react-native-get-random-values';
import '../unistyles.config';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { init } from '@ariob/core';
import { Context as MenuContext, Bar, ActionsProvider, type ActionsConfig } from '@ariob/ripple';
import { ToastProvider, ToastContainer } from '@ariob/andromeda';
import { useUnistyles } from 'react-native-unistyles';
import { useMemo } from 'react';

import { actions, feedConfig, nodeMenus, handleAction } from '../config';

// Initialize Gun
init({
  peers: ['https://gun-manhattan.herokuapp.com/gun'],
  store: { /* ... AsyncStorage adapter ... */ }
});

function AppContent() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  const actionsConfig = useMemo<ActionsConfig>(() => ({
    actions,
    feedConfig,
    nodeMenus,
    onAction: handleAction,
  }), []);

  return (
    <ActionsProvider config={actionsConfig}>
      <ToastProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        />
        <Bar />
        <MenuContext />
        <ToastContainer topInset={insets.top} />
      </ToastProvider>
    </ActionsProvider>
  );
}

export default function RootLayout() {
  const { theme } = useUnistyles();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
```

---

## Verifying Setup

Create a test screen:

```typescript
// app/test.tsx
import { View } from 'react-native';
import { Text, Button } from '@ariob/andromeda';
import { useBar, Shell } from '@ariob/ripple';
import { useUnistyles } from 'react-native-unistyles';

export default function TestScreen() {
  const { theme } = useUnistyles();
  const bar = useBar();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 20 }}>
      <Text size="title">Ripple Test</Text>

      <Shell nodeRef={{ id: 'test', type: 'post' }}>
        <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12 }}>
          <Text>Long press me for context menu</Text>
        </View>
      </Shell>

      <Button onPress={() => bar.setMode('input')}>
        Switch to Input Mode
      </Button>
    </View>
  );
}
```

If you can:
1. See the Bar at the bottom
2. Long-press to open context menu
3. Switch between bar modes

Setup is complete!

---

## Next Steps

- [Menu System](./MENU.md) - Learn the action system
- [Nodes](./NODES.md) - Content type components
- [Degrees](./DEGREES.md) - Understand visibility levels
