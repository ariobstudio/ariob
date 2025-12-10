# RFC: Ripple Architecture

> Graph-native social operating system built on GUN P2P

## Overview

Ripple is not an app—it's a social operating system. Every piece of content is a **node** in a distributed graph, rendered through **views** based on context.

### Principles

1. **Identity is an Anchor** — Users don't sign up, they anchor a cryptographic keypair
2. **Everything is a Node** — Posts, messages, profiles are all nodes with different views
3. **Degrees of Trust** — Content visibility flows through social distance (0-4)
4. **Offline First** — All writes work locally, sync when peers available

---

## Stack

| Layer | Technology |
|-------|------------|
| Data | GUN P2P graph database |
| State | Zustand with GUN sync |
| UI | React Native (Expo) |
| Design | Andromeda (tokens, primitives, motion) |
| Routing | Expo Router (file-based) |
| Crypto | SEA (Sign, Encrypt, Authenticate) |

---

## Data Architecture

### GUN Graph Structure

```
User Space (gun.user())
├── profile/
│   ├── name
│   ├── bio
│   └── avatar
├── posts/
│   └── [lex-id]: { content, degree, created }
├── connections/
│   └── [pubKey]: { status, since }
└── messages/
    └── [threadId]/
        └── [lex-id]: { text, from, to }

Public Space (gun.get())
├── feeds/
│   ├── degree-1/
│   ├── degree-2/
│   └── global/
└── users/
    └── [pubKey]/profile
```

### Degree Model

| Degree | Name | Visibility | Storage |
|--------|------|------------|---------|
| 0 | Me | Only self | `gun.user()` encrypted |
| 1 | Friends | Direct connections | Shared secret space |
| 2 | World | Friends of friends | Public signed |
| 3 | Discover | Recommendations | Public aggregated |
| 4 | Noise | Filtered/spam | Local quarantine |

### Node Types

```typescript
type NodeType = 'post' | 'message' | 'profile' | 'auth' | 'sync' | 'ghost';

interface Node {
  id: string;         // Gun soul
  type: NodeType;
  author: string;     // Public key
  timestamp: string;
  degree: number;     // 0-4
  // Type-specific payload
}
```

---

## UI Architecture

### Packages

```
packages/
├── andromeda/        # Design system
│   ├── tokens.ts     # Colors, spacing, radii
│   ├── primitives/   # Box, Text, Avatar, Badge, etc.
│   ├── compose/      # Row, Stack, Grid, Scroll
│   └── motion/       # Fade, Slide, Spring
├── ripple/           # Social components
│   ├── nodes/        # Post, Message, Profile renderers
│   ├── menu/         # Context-aware action system
│   └── gesture/      # Hold, Swipe, Tap hooks
└── core/             # GUN integration
    ├── graph.ts      # Gun singleton
    ├── node.ts       # useNode hook
    ├── collection.ts # useCollection hook
    └── auth.ts       # Authentication
```

### Menu System

The menu system uses **pickers** to determine which actions to show:

```typescript
interface Pick {
  name: string;
  match: (view: View) => boolean;
  acts: (view: View) => Acts;
}

// Pickers in priority order
const picks = [focus, detail, noise, discover, feed];

// Resolution
function resolve(view: View): Acts {
  const picker = picks.find(p => p.match(view));
  return picker.acts(view, get);
}
```

### Gesture System

| Gesture | Target | Action |
|---------|--------|--------|
| Long press | Node | Show context menu |
| Swipe left | Node | Dismiss/archive |
| Swipe right | Node | Quick reply |
| Double tap | Node | Bookmark |

---

## Data Flow

### Read Path

```
User Request
    ↓
useCollection/useNode Hook
    ↓
Gun Subscription (.on)
    ↓
Zod Validation
    ↓
Zustand Store
    ↓
React Re-render
```

### Write Path

```
User Action
    ↓
Zod Validation
    ↓
Gun Put (local first)
    ↓
Gun Propagation
    ↓
Peer Sync (eventual consistency)
```

---

## Security

### Authentication

- SEA keypairs (sign + encrypt)
- No passwords—cryptographic identity only
- Session persistence via SecureStore

### Encryption

| Degree | Encryption |
|--------|------------|
| 0 | User's own keys |
| 1 | ECDH shared secrets |
| 2+ | Signed, not encrypted |

### Verification

All content is signed. Nodes verify signatures before rendering.

---

## Offline First

1. All writes go to local Gun storage first
2. UI updates immediately (optimistic)
3. Gun syncs with peers when available
4. HAM resolves conflicts (last-write-wins with tie-breaker)

---

## API Reference

### Core

```typescript
// Initialize
init({ peers: ['wss://relay.example.com/gun'] });

// Data
const { data, mutate } = useNode({ path: 'profile', schema: ProfileSchema });
const { items, add } = useCollection({ path: 'posts', schema: PostSchema });

// Auth
await auth(keypair);
const { user, isAuthenticated } = useAuth();
```

### Ripple

```typescript
// Menu actions
const acts = useActs(degree, hasProfile, fullViewData, focusedNode);

// Gestures
const holdGesture = useHold(nodeRef);
const swipeGesture = useSwipe({ left: dismiss, right: reply });
```

### Andromeda

```typescript
// Primitives
<Box ghost><Text size="body" color="dim">Hello</Text></Box>
<Avatar char="A" size="lg" tint="accent" />
<Badge label="NEW" tint="info" />

// Compose
<Stack gap="md"><Row justify="between">...</Row></Stack>

// Motion
<Fade show={visible}><SlideUp>...</SlideUp></Fade>
```

---

## File Map

| Path | Purpose |
|------|---------|
| `packages/core/graph.ts` | Gun singleton |
| `packages/core/node.ts` | Single node hook |
| `packages/core/collection.ts` | Collection hook |
| `packages/core/auth.ts` | Authentication |
| `packages/andromeda/src/tokens.ts` | Design tokens |
| `packages/andromeda/src/primitives/` | UI primitives |
| `packages/ripple/src/menu/pick.ts` | Action resolution |
| `packages/ripple/src/gesture/` | Gesture hooks |
| `packages/ripple/src/schemas.ts` | Content schemas |
| `apps/ripple/app/(tabs)/index.tsx` | Main feed |

---

## Future

- [ ] Degree 3 recommendation algorithm
- [ ] Degree 4 spam detection
- [ ] Voice messages
- [ ] Media attachments
- [ ] Group chats (multi-party encryption)
- [ ] Cross-device sync
