# Ripple

> Decentralized social network

A peer-to-peer social app built on GUN, featuring five degrees of visibility and graph-native interactions.

---

## Setup

```bash
# From monorepo root
pnpm install

# Run iOS
pnpm --filter ripple start
# Then press 'i' for iOS simulator

# Or directly
cd apps/ripple
npx expo run:ios
```

### Requirements

- Node.js 18+
- pnpm 8+
- Xcode 15+ (for iOS)
- Expo CLI

---

## Architecture

### File Structure

```
apps/ripple/
├── app/                    # Expo Router pages
│   ├── _layout.tsx         # Root layout (Gun init, MenuContext)
│   ├── index.tsx           # Main feed view
│   ├── onboarding.tsx      # User creation flow
│   ├── thread/[id].tsx     # Thread detail
│   └── user/[id].tsx       # Profile view
├── components/             # App-specific components
│   ├── index.ts            # Component exports
│   ├── Renderer.tsx        # Modular feed item renderer
│   ├── views/              # View compositions
│   ├── profile/            # Profile components
│   ├── chat/               # Chat components
│   └── composers/          # Content creation components
├── styles/                 # App styles (Unistyles)
├── unistyles.config.ts     # Theme configuration
└── package.json
```

### Renderer Component

The `Renderer` is a modular wrapper that transforms application-level feed items into `@ariob/ripple` Node components. It lives in `components/Renderer.tsx` as it contains app-specific business logic.

**Features:**
- Type mapping (app item types → node types)
- Data transformation (feed items → NodeData)
- Customizable via `typeMapper` and `dataTransformer` props
- Timestamp formatting utility

**Basic Usage:**

```typescript
import { Renderer } from '../components/Renderer';

function FeedItem({ item }) {
  return (
    <Renderer
      item={item}
      onPress={() => router.push(`/thread/${item.id}`)}
      onAvatarPress={() => router.push(`/user/${item.author}`)}
    />
  );
}
```

**Custom Type Mapping:**

```typescript
// Add new item types or override existing mappings
const customTypeMapper = (itemType: string) => {
  if (itemType === 'sponsored') return 'post';
  if (itemType === 'system-alert') return 'sync';
  return defaultTypeMapper(itemType);
};

<Renderer
  item={item}
  typeMapper={customTypeMapper}
/>
```

**Custom Data Transformation:**

```typescript
// Extend the base transformation with custom fields
const customTransformer = (item, baseData) => ({
  ...baseData,
  // Add custom fields or modify existing ones
  aiModel: item.aiModel ? { id: item.aiModel, selected: false } : undefined,
});

<Renderer
  item={item}
  dataTransformer={customTransformer}
/>
```

**Exported Types:**

```typescript
export interface FeedItem {
  id?: string;
  type: string;
  author?: string;
  content?: string;
  // ... see Renderer.tsx for full interface
}

export type ViewMode = 'preview' | 'full' | 'immersive';
export interface RendererProps { /* ... */ }
```

### Navigation

Uses Expo Router (file-based routing):

| Route | Screen | Description |
|-------|--------|-------------|
| `/` | Feed | Main feed with degree tabs |
| `/onboarding` | Onboarding | Create identity modal |
| `/thread/[id]` | Thread | Message thread detail |
| `/message/[id]` | Message | Immersive chat view |
| `/user/[id]` | Profile | User profile view |

### Shared Element Transitions

Node cards morph seamlessly between feed and detail views using React Native Reanimated 4:

```typescript
import { Node, getTransitionTag, useNodeNavigation } from '@ariob/ripple';

function FeedItem({ item }) {
  const { navigate } = useNodeNavigation();

  return (
    <Node
      data={item}
      transitionTag={getTransitionTag(item.id)}
      onPress={() => navigate(item.id, 'full')}
    />
  );
}
```

The thread view uses a matching `transitionTag` to connect the animation:

```typescript
// app/thread/[id].tsx
<Node
  data={threadData}
  transitionTag={getTransitionTag(id)}
/>
```

**Stack Configuration:**

```typescript
// app/_layout.tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="index" />
  <Stack.Screen
    name="thread/[id]"
    options={{ animation: 'none' }} // Shared element handles it
  />
  <Stack.Screen
    name="message/[id]"
    options={{ animation: 'slide_from_right' }}
  />
</Stack>
```

### State Management

- **GUN** — P2P data sync via `@ariob/core`
- **Zustand** — Menu state, local UI state
- **React state** — Component-level state

---

## Features

### Five Degrees

The feed filters content by degree of connection:

| Degree | Tab | Content |
|--------|-----|---------|
| 0 | Me | Personal posts, drafts |
| 1 | Friends | Direct connections |
| 2 | World | Extended network |
| 3 | Discover | Recommendations |
| 4 | Noise | Unfiltered content |

```typescript
// Degree selector in feed
const [degree, setDegree] = useState<string>('1');
const { items } = useFeed({ degree });
```

### Context Menu

Long-press any node to reveal quick actions:

```typescript
// Enabled via Shell primitive
<Shell nodeRef={{ id: post.id, type: 'post' }}>
  <PostContent post={post} />
</Shell>
```

The `<MenuContext />` in `_layout.tsx` renders the floating menu overlay.

### Action Bar

Bottom bar shows contextual actions based on current view:

```typescript
const meta = useActs({
  degree: Number(degree),
  node: focusedNodeId,
  full: isViewingDetail ? { type: 'post', isMe: false } : undefined,
});

<Bar
  left={meta.left}
  center={meta.main}
  right={meta.right}
  onAction={handleAction}
/>
```

### Reply Input Mode

In thread views, tapping Reply transforms the bar into an input:

```typescript
const [barMode, setBarMode] = useState<'action' | 'input'>('action');
const [replyText, setReplyText] = useState('');

const handleAction = (action: ActionType) => {
  if (action === 'reply') setBarMode('input');
};

const handleSend = (text: string) => {
  sendReply(text);
  setReplyText('');
  setBarMode('action');
};

<Pill
  mode={barMode}
  placeholder="Reply..."
  value={replyText}
  onChangeText={setReplyText}
  onSubmit={handleSend}
  inputLeft={{ name: 'attach', icon: 'attach', label: 'Attach' }}
/>
```

### Toasts

Notifications using `@ariob/andromeda`:

```typescript
import { toast } from '@ariob/andromeda';

// In action handlers
toast.success('Reply sent');
toast.error('Failed to send');
```

### Messaging

End-to-end encrypted DMs using GUN SEA:

```typescript
// Send message
await sendMessage({
  text: 'Hello!',
  from: user.pub,
  to: recipient.pub,
  threadId: createThreadId(user.pub, recipient.pub),
});
```

### Profiles

User profiles with avatar, bio, and connection status:

```typescript
// View profile
router.push(`/user/${pubKey}`);

// Check relationship
const degree = getDegree(pubKey, myPub);
// 0 = me, 1 = friend, 2 = friend-of-friend, null = not connected
```

---

## Styling

Uses [React Native Unistyles](https://unistyl.es/) with the **"Liquid Trust"** design system:

### Design System

The Liquid Trust aesthetic features:
- **Deep ocean depths** for backgrounds (`#0A0E14` → `#243447`)
- **Bioluminescent cyan** (`#00E5FF`) as primary glow accent
- **Degree-based color coding** for social distance visualization

```typescript
// Theme structure (from @ariob/ripple/styles)
{
  colors: {
    background: '#000000',
    surface: '#0F1216',
    accent: '#1D9BF0',
    accentGlow: '#00E5FF',  // Liquid Trust bioluminescent cyan
    text: '#E7E9EA',
    textTertiary: '#6B6F76',
    degree: {
      0: '#FF6B9D',  // Me (warm pink)
      1: '#00E5FF',  // Friends (cyan)
      2: '#7C4DFF',  // World (purple)
      3: '#FFC107',  // Discover (amber)
      4: '#78909C',  // Noise (gray)
    },
    // ...
  },
  spacing: { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 },
  radii: { sm: 6, md: 12, lg: 18, xl: 24, pill: 999 },
}
```

### Usage

```typescript
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

function Component() {
  const { theme } = useUnistyles();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={{ color: theme.colors.text }}>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
});
```

### Legacy Theme Bridge

For components using the legacy `import { theme } from '../theme'` pattern, the bridge file at `theme/index.ts` provides backward compatibility while using the modern Liquid Trust values.

---

## Configuration

### Gun Peers

Configure relay servers in `_layout.tsx`:

```typescript
const gun = init({
  peers: ['https://gun-manhattan.herokuapp.com/gun'],
  store: {
    get: async (key, cb) => { /* AsyncStorage */ },
    put: async (key, val, cb) => { /* AsyncStorage */ },
  },
});
```

### Theme

Modify `unistyles.config.ts` for custom theming.

### Paths

Import paths from `@ariob/ripple`:

```typescript
import { getPath, getDegree } from '@ariob/ripple';

const feedPath = getPath(1); // 'feeds/friends'
```

---

## Actions

Handle menu actions in the main feed:

```typescript
const handleAction = (action: ActionType) => {
  switch (action) {
    case 'post':
      openComposer();
      break;
    case 'reply':
      replyTo(focusedNode);
      break;
    case 'save':
      bookmark(focusedNode);
      break;
    case 'share':
      Share.share({ message: getShareUrl(focusedNode) });
      break;
    case 'back':
      clearFocus();
      break;
    // ...
  }
};
```

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `@ariob/core` | GUN primitives, auth, crypto |
| `@ariob/ripple` | Social primitives, menus, hooks, transitions |
| `@ariob/andromeda` | Design system, toast notifications |
| `expo-router` | File-based navigation |
| `react-native-gesture-handler` | Touch gestures |
| `react-native-reanimated` | Animations, shared transitions |
| `react-native-unistyles` | Theming |
| `expo-blur` | Blur effects |
| `@expo/vector-icons` | Icons |

---

## Development

### Run

```bash
# Development server
pnpm --filter ripple start

# iOS simulator
pnpm --filter ripple ios

# Clear cache
npx expo start -c
```

### Testing

The app includes a test suite using Vitest:

```bash
# Run tests
pnpm --filter ripple test

# Watch mode
pnpm --filter ripple test --watch
```

**Test Structure:**

```
apps/ripple/
├── __tests__/
│   └── actions.test.ts    # Action picker tests
└── vitest.config.ts       # Vitest configuration
```

**Action Picker Tests:**

Tests the `resolve` function from `@ariob/ripple` which determines what actions to show in the floating action bar based on:
- Current degree (0-4)
- Authentication state
- View state (focused node, detail view, feed view)

### TypeScript

```bash
# Type check
pnpm --filter ripple typecheck
```

**Type Configuration:**

The app uses a dedicated `unistyles.d.ts` file for proper type augmentation:

```typescript
// unistyles.d.ts - Type declarations (must be .d.ts for proper resolution)
import type { RippleTheme } from '@ariob/ripple/styles';

declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    dark: RippleTheme;
    light: RippleTheme;
  }
}
```

```typescript
// unistyles.config.ts - Runtime configuration
import { StyleSheet } from 'react-native-unistyles';
import { appThemes, appBreakpoints, appSettings } from './theme/tokens';

StyleSheet.configure({
  themes: appThemes,
  breakpoints: appBreakpoints,
  settings: appSettings,
});
```

### Debug

```bash
# Shake device or Cmd+D in simulator
# Opens React Native debugger
```

### Build

```bash
# Development build
npx expo run:ios

# Production
eas build --platform ios
```

---

## License

Private - Ariob

