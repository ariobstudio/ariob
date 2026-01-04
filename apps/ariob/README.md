# Ariob

> Decentralized social network client built on Gun + Ripple

A mobile-first social experience with peer-to-peer data sync, AI companions, and the Five Degrees of Visibility.

---

## Features

- **Peer-to-Peer**: Data syncs directly between devices via Gun
- **Five Degrees**: Filter content by relationship distance (Me → Friends → World → Discover → Noise)
- **AI Companion**: Built-in AI assistant (Ripple) for mesh network queries
- **Identity Anchoring**: Cryptographic identity without centralized auth
- **Real-time**: Live updates as peers sync

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- iOS Simulator or Android Emulator (or physical device)
- Xcode 15+ (for iOS)

### Installation

```bash
# From monorepo root
pnpm install

# Start the app
pnpm --filter ariob start
# Then press 'i' for iOS simulator
```

### Running on Device

```bash
# iOS
pnpm --filter ariob ios

# Android
pnpm --filter ariob android

# Clear cache if needed
pnpm --filter ariob start --clear
```

---

## Project Structure

```
apps/ariob/
├── app/                      # Expo Router screens
│   ├── _layout.tsx           # Root layout + providers
│   ├── index.tsx             # Main feed
│   ├── thread/[id].tsx       # Post detail
│   ├── message/[id].tsx      # Chat screen
│   ├── profile.tsx           # Current user profile
│   ├── user/[id].tsx         # Other user profiles
│   ├── settings.tsx          # App settings
│   └── me.tsx                # Personal view
├── components/               # App components
│   ├── Renderer.tsx          # Feed item bridge
│   ├── AnimatedPressable.tsx # Animated press wrapper
│   ├── RipplePullToRefresh.tsx
│   ├── chat/                 # Chat components
│   │   ├── ChatHeader.tsx
│   │   └── MessageBubble.tsx
│   ├── profile/              # Profile components
│   │   ├── ProfileHeader.tsx
│   │   ├── ProfileStats.tsx
│   │   ├── ProfileTabs.tsx
│   │   └── ...
│   └── sheets/               # Bottom sheets
│       └── AccountSheet.tsx  # Identity creation
├── config/                   # Configuration
│   ├── actions.ts            # Action definitions
│   └── actionHandler.ts      # Action routing
├── stores/                   # State management
│   └── rippleConversation.ts # AI chat state
├── theme/                    # Design tokens
│   ├── tokens.ts             # Theme config
│   ├── index.ts              # Legacy bridge
│   └── design-system.ts
├── utils/                    # Utilities
│   ├── mockData.ts           # Test data
│   ├── constants.ts          # App constants
│   └── animations.ts         # Animation helpers
├── styles/                   # Shared styles
├── docs/                     # App documentation
│   ├── ARCHITECTURE.md       # App patterns
│   └── CONFIG.md             # Action config guide
├── __tests__/                # Tests
│   └── actions.test.ts       # Action tests
├── unistyles.config.ts       # Unistyles setup
├── unistyles.d.ts            # Type augmentation
└── vitest.config.ts          # Test config
```

---

## Key Screens

| Route | Screen | Description |
|-------|--------|-------------|
| `/` | Feed | Main social feed with degree tabs |
| `/thread/[id]` | Thread | Post detail with replies |
| `/message/[id]` | Chat | Direct message conversation |
| `/profile` | Profile | Current user's profile |
| `/user/[id]` | User | Other user's profile |
| `/settings` | Settings | App configuration |
| `/me` | Me | Personal content view |

---

## Architecture Overview

### Provider Hierarchy

```
GestureHandlerRootView
  └── KeyboardProvider
      └── SafeAreaProvider
          └── SheetRegistryProvider
              └── ActionsProvider
                  └── ToastProvider
                      └── Stack (Routes)
                          └── Bar + MenuContext
```

### Data Flow

```
Gun (P2P Database)
    │
    ▼
useCollection({ path: 'posts' })
    │
    ▼
Transform → NodeData
    │
    ▼
<NodeView data={...} />
```

### Action Flow

```
User Tap → Bar/Context Menu
    │
    ▼
onAction(name, context)
    │
    ▼
actionHandler.ts
    │
    ▼
Execute (navigate, API call, etc.)
```

---

## Configuration

### Actions (config/actions.ts)

Actions are defined using the `make` helper:

```typescript
import { make } from '@ariob/ripple';

export const actions = {
  post: make('post', { icon: 'add', label: 'Post' }),
  reply: make('reply', { icon: 'arrow-undo', label: 'Reply' }),
  config: make('config', {
    icon: 'settings',
    label: 'Settings',
    sub: [
      { name: 'profile', icon: 'person', label: 'Profile' },
      { name: 'theme', icon: 'color-palette', label: 'Theme' },
    ],
  }),
};
```

### Feed Config

Configure actions per degree:

```typescript
export const feedConfig = createFeedConfigs({
  0: { main: 'post', mainUnauthenticated: 'create', left: 'config', right: 'more' },
  1: { main: 'post', right: 'find' },
  2: { main: 'post', left: 'trend', right: 'search' },
  3: { main: 'post', left: 'filter', right: 'trend' },
  4: { main: 'post', left: 'mute', right: 'report' },
});
```

### Node Menus

Configure context menus per node type:

```typescript
export const nodeMenus = createNodeMenus({
  post: { quick: ['reply', 'save', 'share'], detail: ['reply'], opts: ['report'] },
  message: { quick: ['reply', 'forward'], detail: ['reply'], opts: ['delete'] },
  profile: { quick: ['link', 'message'], detail: ['link'], opts: ['block'] },
});
```

See [docs/CONFIG.md](./docs/CONFIG.md) for detailed configuration guide.

---

## Renderer Component

The `Renderer` transforms application-level feed items into `@ariob/ripple` Node components:

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
const customTypeMapper = (itemType: string) => {
  if (itemType === 'sponsored') return 'post';
  return defaultTypeMapper(itemType);
};

<Renderer item={item} typeMapper={customTypeMapper} />
```

**Custom Data Transformation:**

```typescript
const customTransformer = (item, baseData) => ({
  ...baseData,
  customField: item.custom,
});

<Renderer item={item} dataTransformer={customTransformer} />
```

---

## Five Degrees of Visibility

| Degree | Tab | Content |
|--------|-----|---------|
| 0 | Me | Personal posts, drafts |
| 1 | Friends | Direct connections |
| 2 | World | Extended network |
| 3 | Discover | Recommendations |
| 4 | Noise | Unfiltered content |

```typescript
const [degree, setDegree] = useState(0);
const { items } = useFeed({ degree });
```

---

## Styling

Uses [React Native Unistyles](https://unistyl.es/) with the **"Liquid Trust"** design system:

### Theme

```typescript
{
  colors: {
    background: '#000000',
    surface: '#0F1216',
    accent: '#1D9BF0',
    accentGlow: '#00E5FF',  // Bioluminescent cyan
    degree: {
      0: '#FF6B9D',  // Me (warm pink)
      1: '#00E5FF',  // Friends (cyan)
      2: '#7C4DFF',  // World (purple)
      3: '#FFC107',  // Discover (amber)
      4: '#78909C',  // Noise (gray)
    },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 },
  radii: { sm: 6, md: 12, lg: 18, xl: 24, pill: 999 },
}
```

### Usage

```typescript
import { useStyles } from 'react-native-unistyles';

function Component() {
  const { theme } = useStyles();

  return (
    <View style={{ backgroundColor: theme.colors.surface }}>
      <Text style={{ color: theme.colors.textPrimary }}>Hello</Text>
    </View>
  );
}
```

---

## State Management

| Tool | Purpose |
|------|---------|
| **Gun** (`@ariob/core`) | Peer-to-peer data sync |
| **Zustand** | Menu state, UI state, AI chat |
| **React State** | Component-level state |
| **AsyncStorage** | Persistence |

### AI Conversation Store

```typescript
// stores/rippleConversation.ts
const { messages, addUserMessage, addAIMessage, setThinking } = useRippleConversation();
```

---

## Dependencies

### Workspace Packages

| Package | Purpose |
|---------|---------|
| `@ariob/ripple` | Social primitives, nodes, menu system |
| `@ariob/andromeda` | Design system, toast notifications |
| `@ariob/core` | Gun integration, auth, storage |
| `@ariob/ml` | AI model integration |

### External

| Package | Purpose |
|---------|---------|
| `expo` ~54.0 | App framework |
| `expo-router` ~6.0 | File-based routing |
| `react-native` ~0.81 | UI framework |
| `react-native-unistyles` ^3.0 | Theming |
| `zustand` ^5.0 | State management |
| `react-native-reanimated` ~4.1 | Animations |
| `react-native-gesture-handler` ~2.28 | Gestures |

---

## Development

### Testing

```bash
# Run tests
pnpm --filter ariob test

# Watch mode
pnpm --filter ariob test --watch
```

### Type Checking

```bash
pnpm --filter ariob typecheck
```

### Building

```bash
# Development build
npx expo run:ios

# Production
eas build --platform ios
```

---

## Troubleshooting

### Metro Bundler Issues

```bash
pnpm --filter ariob start --clear
```

### Unistyles Not Working

Ensure `unistyles.config.ts` is imported before expo-router in `index.js`:

```javascript
// index.js
import './unistyles.config';  // MUST be first
import 'expo-router/entry';
```

### Gun Connection Issues

Check peer configuration in `app/_layout.tsx`:

```typescript
const gun = init({
  peers: ['https://gun-manhattan.herokuapp.com/gun'],
});
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | App patterns and data flow |
| [Config](./docs/CONFIG.md) | Action configuration guide |

### Package Documentation

| Document | Description |
|----------|-------------|
| [@ariob/ripple](../../docs/ripple/README.md) | Social primitives |
| [Integration](../../docs/ripple/INTEGRATION.md) | How to integrate Ripple |
| [Architecture](../../docs/ripple/ARCHITECTURE.md) | Design patterns |

---

## License

Private - Ariob
