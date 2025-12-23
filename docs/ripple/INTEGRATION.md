# Integration Guide

> How to integrate @ariob/ripple into your app

This guide walks through integrating Ripple into a React Native/Expo application, using apps/ariob as the reference implementation.

---

## Prerequisites

- React Native 0.71+ or Expo SDK 50+
- TypeScript 5+
- react-native-unistyles 2+

---

## Installation

### 1. Add Dependencies

```bash
# If using npm/yarn
npm install @ariob/ripple @ariob/andromeda @ariob/core

# In monorepo
pnpm add @ariob/ripple @ariob/andromeda @ariob/core
```

### 2. Peer Dependencies

Ensure these are installed:

```json
{
  "react": "^18.0.0 || ^19.0.0",
  "react-native": ">=0.71.0",
  "react-native-unistyles": "^2.0.0",
  "zod": "^3.23.0",
  "zustand": "^5.0.0"
}
```

---

## Setup

### 1. Configure Unistyles

**Critical**: Configure before any other imports.

```typescript
// unistyles.config.ts
import { StyleSheet } from 'react-native-unistyles';
import { rippleThemes, rippleBreakpoints } from '@ariob/ripple/styles';

StyleSheet.configure({
  themes: rippleThemes,
  breakpoints: rippleBreakpoints,
  settings: {
    adaptiveThemes: true,
  },
});
```

```javascript
// index.js (app entry point)
import './unistyles.config';  // MUST be first!
import 'expo-router/entry';   // Then router
```

### 2. Create Action Config

```typescript
// config/actions.ts
import { make, createFeedConfigs, createNodeMenus } from '@ariob/ripple';
import type { Act } from '@ariob/ripple';

export const actions: Record<string, Act> = {
  // Main actions
  create: make('create', { icon: 'person-add', label: 'Anchor' }),
  post: make('post', { icon: 'add', label: 'Post' }),
  reply: make('reply', { icon: 'arrow-undo', label: 'Reply' }),
  back: make('back', { icon: 'arrow-back', label: 'Back' }),
  close: make('close', { icon: 'close', label: 'Close' }),

  // Settings menu
  config: make('config', {
    icon: 'settings',
    label: 'Settings',
    sub: [
      { name: 'profile', icon: 'person', label: 'Profile' },
      { name: 'theme', icon: 'color-palette', label: 'Theme' },
    ],
  }),

  // Content actions
  save: make('save', { icon: 'bookmark-outline', label: 'Save' }),
  share: make('share', { icon: 'share-outline', label: 'Share' }),
  report: make('report', { icon: 'flag', label: 'Report' }),
};

export const feedConfig = createFeedConfigs({
  0: { main: 'post', mainUnauthenticated: 'create', left: 'config', right: 'more' },
  1: { main: 'post', right: 'find' },
  2: { main: 'post', left: 'trend', right: 'search' },
  3: { main: 'post', left: 'filter', right: 'trend' },
  4: { main: 'post', left: 'mute', right: 'report' },
});

export const nodeMenus = createNodeMenus({
  post: { quick: ['reply', 'save', 'share'], detail: ['reply'], opts: ['report'] },
  message: { quick: ['reply', 'forward'], detail: ['reply'], opts: ['delete'] },
  profile: { quick: ['link', 'message'], detail: ['link'], opts: ['block'] },
  default: { quick: ['reply'], detail: ['reply'], opts: ['report'] },
});
```

### 3. Create Action Handler

```typescript
// config/actionHandler.ts
import { router } from 'expo-router';
import { toast } from '@ariob/andromeda';

interface ActionContext {
  view: { degree: number; profile: boolean };
  node?: { id: string; type: string };
}

// Callback setters (registered by app)
let openAccountSheet: (() => void) | null = null;
let setBarInputMode: (() => void) | null = null;

export function setOpenAccountSheet(fn: () => void) {
  openAccountSheet = fn;
}

export function setBarInputMode(fn: () => void) {
  setBarInputMode = fn;
}

export function handleAction(action: string, ctx: ActionContext) {
  const isAuthenticated = !!ctx.view.profile;

  switch (action) {
    case 'create':
      if (!isAuthenticated) openAccountSheet?.();
      else setBarInputMode?.();
      break;

    case 'post':
      if (isAuthenticated) setBarInputMode?.();
      else toast.info('Create an identity first');
      break;

    case 'reply':
      if (ctx.node) router.push(`/thread/${ctx.node.id}`);
      break;

    case 'profile':
      router.push('/profile');
      break;

    case 'back':
      router.back();
      break;

    case 'save':
      toast.success('Saved!');
      break;

    default:
      console.log('Unhandled action:', action);
  }
}
```

### 4. Setup Root Layout

```tsx
// app/_layout.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Stack } from 'expo-router';
import {
  ActionsProvider,
  Bar,
  Context as MenuContext,
  SheetRegistryProvider,
} from '@ariob/ripple';
import { ToastProvider, ToastContainer } from '@ariob/andromeda';
import { init } from '@ariob/core';

import { actions, feedConfig, nodeMenus, handleAction } from '../config';
import { AccountSheet } from '../components/sheets';

// Sheet registry
const sheetRegistry = {
  account: AccountSheet,
};

const sheetTitles = {
  account: 'Create Identity',
};

export default function RootLayout() {
  // Initialize Gun
  const gun = init({
    peers: ['https://gun-manhattan.herokuapp.com/gun'],
    // AsyncStorage adapter for persistence
    store: {
      get: async (key, cb) => { /* ... */ },
      put: async (key, val, cb) => { /* ... */ },
    },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <SheetRegistryProvider sheets={sheetRegistry} titles={sheetTitles}>
            <ActionsProvider
              config={{
                actions,
                feedConfig,
                nodeMenus,
                onAction: handleAction,
              }}
            >
              <ToastProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="thread/[id]" options={{ animation: 'none' }} />
                  <Stack.Screen name="message/[id]" options={{ animation: 'slide_from_right' }} />
                </Stack>
                <Bar />
                <MenuContext />
                <ToastContainer />
              </ToastProvider>
            </ActionsProvider>
          </SheetRegistryProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
```

---

## Rendering Nodes

### Basic Feed

```tsx
// app/index.tsx
import { FlatList } from 'react-native';
import { NodeView, type NodeData } from '@ariob/ripple';
import { useCollection } from '@ariob/core';
import { router } from 'expo-router';

export default function Feed() {
  const { items, isLoading } = useCollection({ path: 'posts' });

  // Transform Gun items to NodeData
  const feed: NodeData[] = items.map((item) => ({
    id: item.id,
    type: 'post',
    author: item.data?.author || 'Unknown',
    timestamp: formatTimestamp(item.data?.created),
    degree: item.data?.degree ?? 1,
    content: item.data?.content,
  }));

  const handlePress = (item: NodeData) => {
    router.push(`/thread/${item.id}`);
  };

  const handleAvatarPress = (item: NodeData) => {
    router.push(`/user/${item.author}`);
  };

  return (
    <FlatList
      data={feed}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <NodeView
          data={item}
          isLast={index === feed.length - 1}
          onPress={() => handlePress(item)}
          onAvatarPress={() => handleAvatarPress(item)}
        />
      )}
    />
  );
}
```

### Using the Renderer Bridge

For more control, use a Renderer component:

```tsx
// components/Renderer.tsx
import { NodeView, type NodeData } from '@ariob/ripple';

interface FeedItem {
  id: string;
  type: string;
  author?: string;
  content?: string;
  timestamp?: string;
  degree?: number;
}

interface RendererProps {
  item: FeedItem;
  isLast: boolean;
  onPress?: () => void;
  onAvatarPress?: () => void;
  typeMapper?: (type: string) => string;
  dataTransformer?: (item: FeedItem, base: NodeData) => NodeData;
}

const defaultTypeMapper = (type: string) => {
  switch (type) {
    case 'sponsored': return 'post';
    case 'dm': return 'message';
    default: return type;
  }
};

export function Renderer({
  item,
  isLast,
  onPress,
  onAvatarPress,
  typeMapper = defaultTypeMapper,
  dataTransformer,
}: RendererProps) {
  const nodeType = typeMapper(item.type);

  let nodeData: NodeData = {
    id: item.id,
    type: nodeType as NodeData['type'],
    author: item.author,
    timestamp: item.timestamp,
    degree: item.degree ?? 1,
    content: item.content,
  };

  if (dataTransformer) {
    nodeData = dataTransformer(item, nodeData);
  }

  return (
    <NodeView
      data={nodeData}
      isLast={isLast}
      onPress={onPress}
      onAvatarPress={onAvatarPress}
    />
  );
}
```

---

## Using the Bar

### Configure Bar for Current View

```tsx
import { useBar, useMetaActions } from '@ariob/ripple';

function FeedScreen() {
  const bar = useBar();
  const [degree, setDegree] = useState(0);
  const [focusedNode, setFocusedNode] = useState<string | null>(null);
  const hasProfile = useAuth();

  // Get contextual actions
  const meta = useMetaActions(degree, hasProfile, null, focusedNode);

  useEffect(() => {
    bar.configure({
      mode: 'action',
      left: meta.left,
      center: meta.main,
      right: meta.right,
      placeholder: 'What\'s on your mind?',
    });
  }, [meta]);

  // Switch to input mode for posting
  const handlePost = () => {
    bar.setMode('input');
  };

  // Handle submit
  const handleSubmit = (text: string) => {
    createPost({ content: text });
    bar.setMode('action');
  };

  bar.setCallbacks({
    onSubmit: handleSubmit,
    onCancel: () => bar.setMode('action'),
  });

  return <Feed />;
}
```

### Open Sheets

```tsx
const bar = useBar();

// Open a registered sheet
bar.openSheet('account');

// Close sheet
bar.closeSheet();
```

---

## Using Search

```tsx
import { useUserSearch, useHashtagSearch } from '@ariob/ripple';

function SearchScreen() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'users' | 'hashtags'>('users');

  const userSearch = useUserSearch(searchType === 'users' ? query : '');
  const hashtagSearch = useHashtagSearch(searchType === 'hashtags' ? query : '');

  return (
    <View>
      <TextInput value={query} onChangeText={setQuery} />

      <SegmentedControl
        values={['Users', 'Hashtags']}
        selectedIndex={searchType === 'users' ? 0 : 1}
        onChange={(index) => setSearchType(index === 0 ? 'users' : 'hashtags')}
      />

      {searchType === 'users' && (
        <FlatList
          data={userSearch.results}
          renderItem={({ item }) => <UserCard user={item} />}
        />
      )}

      {searchType === 'hashtags' && (
        <FlatList
          data={hashtagSearch.posts}
          renderItem={({ item }) => <PostCard post={item} />}
        />
      )}
    </View>
  );
}
```

---

## Custom Sheets

### Create a Sheet Component

```tsx
// components/sheets/MySheet.tsx
import { View, Text } from 'react-native';
import { Button } from '@ariob/andromeda';

interface SheetComponentProps {
  onClose: () => void;
}

export function MySheet({ onClose }: SheetComponentProps) {
  return (
    <View style={{ padding: 20 }}>
      <Text>My Custom Sheet</Text>
      <Button onPress={onClose}>Close</Button>
    </View>
  );
}
```

### Register the Sheet

```tsx
// app/_layout.tsx
import { MySheet } from '../components/sheets/MySheet';

const sheetRegistry = {
  account: AccountSheet,
  mysheet: MySheet,  // Add here
};

const sheetTitles = {
  account: 'Create Identity',
  mysheet: 'My Sheet',  // Add title
};
```

### Open the Sheet

```tsx
const bar = useBar();
bar.openSheet('mysheet');
```

---

## Theming

### Access Theme

```tsx
import { useStyles } from 'react-native-unistyles';

function MyComponent() {
  const { theme } = useStyles();

  return (
    <View style={{ backgroundColor: theme.colors.surface }}>
      <Text style={{ color: theme.colors.textPrimary }}>Hello</Text>
    </View>
  );
}
```

### Degree Colors

```tsx
const { theme } = useStyles();

// Get degree color
const color = theme.colors.degree[1]; // Friends degree color
```

### Create Themed Styles

```tsx
import { createStyleSheet, useStyles } from 'react-native-unistyles';

const stylesheet = createStyleSheet((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
  },
  text: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
}));

function MyComponent() {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Themed content</Text>
    </View>
  );
}
```

---

## Provider Checklist

Ensure all providers are in the correct order:

```tsx
<GestureHandlerRootView>     {/* Outermost - gestures */}
  <KeyboardProvider>          {/* Keyboard handling */}
    <SafeAreaProvider>        {/* Safe area insets */}
      <SheetRegistryProvider> {/* Sheet registry */}
        <ActionsProvider>     {/* Action system */}
          <ToastProvider>     {/* Notifications */}
            {/* Your app content */}
            <Bar />           {/* Action bar */}
            <MenuContext />   {/* Context menu */}
            <ToastContainer /> {/* Toast display */}
          </ToastProvider>
        </ActionsProvider>
      </SheetRegistryProvider>
    </SafeAreaProvider>
  </KeyboardProvider>
</GestureHandlerRootView>
```

---

## Common Patterns

### Handling Node Focus

```tsx
const [focusedNode, setFocusedNode] = useState<string | null>(null);

const handleNodePress = (node: NodeData) => {
  if (focusedNode === node.id) {
    // Already focused, navigate to detail
    router.push(`/thread/${node.id}`);
  } else {
    // Focus the node
    setFocusedNode(node.id);
  }
};

const handleClose = () => {
  setFocusedNode(null);
};
```

### Degree Switching

```tsx
const [degree, setDegree] = useState(0);

// Swipe gesture to change degree
const onSwipe = (direction: 'left' | 'right') => {
  if (direction === 'left' && degree < 4) {
    setDegree(degree + 1);
  } else if (direction === 'right' && degree > 0) {
    setDegree(degree - 1);
  }
};
```

### Creating Posts

```tsx
import { useCollection } from '@ariob/core';
import { indexPostHashtags } from '@ariob/ripple';

function usePosts() {
  const { add } = useCollection({ path: 'posts' });

  const createPost = async (content: string) => {
    const post = await add({
      content,
      author: currentUser.pub,
      created: Date.now(),
      degree: 1,
    });

    // Index hashtags for search
    await indexPostHashtags(post);

    return post;
  };

  return { createPost };
}
```

---

## Related Documentation

- [Architecture](./ARCHITECTURE.md) - Design patterns
- [Menu System](./MENU.md) - Action configuration
- [Nodes](./NODES.md) - Content types
- [Hooks](./HOOKS.md) - React hooks reference
