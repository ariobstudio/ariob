# Ripple

A decentralized social network built with LynxJS and Gun.js, featuring unified feeds, degree-based visibility, and end-to-end encryption.

## Overview

Ripple is a privacy-focused social network that combines traditional posts with direct messaging in a unified feed. It uses Gun.js for peer-to-peer data synchronization and SEA (Security, Encryption, Authorization) for end-to-end encryption.

### Key Features

- **Unified Feed**: Posts and DM previews in a single chronological stream
- **Degree-Based Visibility**: Control who sees your content (0° Personal, 1° Friends, 2° Extended network)
- **End-to-End Encryption**: All content encrypted by default using Gun.js SEA
- **Real-Time Sync**: P2P synchronization with Gun.js graph database
- **Multi-Bundle Architecture**: Efficient code splitting for optimal performance

## Architecture

### Platform Detection

Ripple automatically detects the platform (mobile vs desktop) and adjusts the layout accordingly:

```typescript
// PageLayout component checks globalThis.SystemInfo.platform
// Mobile platforms (iOS, Android): Full-width layout
// Desktop platforms (macOS, Windows, Linux): Constrained max-width with centering
```

All screens use the `PageLayout` component for consistent theming and platform-aware rendering:

```tsx
import { PageLayout } from '../components/Layout';

export function MyScreen() {
  return (
    <PageLayout>
      <Column className="p-4">
        {/* Your screen content */}
      </Column>
    </PageLayout>
  );
}
```

### Multi-Bundle System

Ripple uses a feature-based bundle architecture for optimal loading performance:

```
┌─────────────────────────────────────────────────┐
│           Main Shell (646 KB)                    │
│  - App navigation & state management             │
│  - Shared components & design system             │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ Auth (523KB) │ │Feed (553)│ │Thread (540KB)│
│- Welcome     │ │- Unified │ │- PostViewer  │
│- Create Acct │ │- Degree  │ │- MsgThread   │
│- Login       │ │- Search  │ │- Real-time   │
└──────────────┘ └──────────┘ └──────────────┘
        │             │             │
        ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐
│Composer(470) │ │Profile(516)  │
│- CreatePost  │ │- User Info   │
│- CreateMsg   │ │- Settings    │
│- Scope Sel.  │ │- Logout      │
└──────────────┘ └──────────────┘
```

**Total Bundle Size**: ~4 MB (efficiently split)

### Tech Stack

- **UI Framework**: [LynxJS](https://lynxjs.org) - Cross-platform React for iOS/Android
- **Database**: [Gun.js](https://gun.eco) - Decentralized graph database
- **Authentication**: Gun.js SEA - Cryptographic authentication & encryption
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Rspeedy (Rsbuild + Rspack)
- **Package**: @ariob/ripple - Ripple-specific schemas and hooks

## Project Structure

```
apps/ripple/
├── src/
│   ├── auth/              # Auth feature bundle
│   │   └── index.tsx      # Welcome, Create Account, Login
│   ├── feed/              # Feed feature bundle
│   │   └── index.tsx      # Unified feed with degree filtering
│   ├── thread/            # Thread feature bundle
│   │   └── index.tsx      # Post viewer & message threads
│   ├── composer/          # Composer feature bundle
│   │   └── index.tsx      # Create posts & messages
│   ├── profile/           # Profile feature bundle
│   │   └── index.tsx      # User profile & settings
│   ├── components/        # Shared components
│   │   ├── FeedItem/      # Feed item previews
│   │   ├── Layout/        # Discovery bar, compose dock, PageLayout
│   │   └── Navigation/    # Navigator component
│   ├── screens/           # Screen components
│   │   ├── Welcome.tsx
│   │   ├── CreateAccount.tsx
│   │   ├── Login.tsx
│   │   ├── CreatePost.tsx
│   │   ├── CreateMessage.tsx
│   │   ├── PostViewer.tsx
│   │   ├── MessageThread.tsx
│   │   └── Profile.tsx
│   ├── App.tsx            # Main app shell
│   ├── index.tsx          # App entry point
│   └── globals.css        # Design system & Tailwind
├── lynx.config.ts         # LynxJS multi-bundle config
└── README.md

packages/ripple/           # Ripple package
├── src/
│   ├── schemas.ts         # Zod schemas (Post, Message, Feed)
│   ├── feed.ts            # Feed hooks and API
│   └── index.ts           # Package exports
└── package.json
```

## Data Model

### Schemas

```typescript
// Post - Public text content with degree scope
type Post = {
  type: 'post';
  content: string;
  author: string;           // Public key
  authorAlias?: string;
  degree: '0' | '1' | '2';  // Visibility scope
  created: number;
  tags?: string[];
  editedAt?: number;
};

// Message - Private DM between two users
type Message = {
  type: 'message';
  text: string;
  from: string;             // Sender public key
  to: string;               // Recipient public key
  threadId: string;         // Conversation identifier
  created: number;
  encrypted: boolean;       // Default: true
  read: boolean;
};

// ThreadMetadata - DM conversation metadata
type ThreadMetadata = {
  type: 'thread';
  threadId: string;
  participants: [string, string];
  lastMessage?: string;
  lastMessageAt?: number;
  unreadCount: number;
};

// FeedItem - Discriminated union for unified feed
type FeedItem = Post | ThreadMetadata;
```

### Gun.js Graph Structure

```
gun
├── users/                 # User accounts (Gun.js SEA)
│   └── <pub-key>/
│       ├── alias
│       └── pub
├── posts/                 # All posts by ID
│   └── <post-id>/
│       ├── content
│       ├── author
│       ├── degree
│       └── created
├── global-feed/           # Degree-based feeds
│   ├── 0-me/              # Personal posts
│   ├── 1-friends/         # Friends' posts
│   └── 2-extended/        # Extended network
└── threads/               # DM conversations
    └── <thread-id>/
        ├── participants
        ├── lastMessage
        └── messages/
            └── <msg-id>/
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- LynxExplorer app (for iOS testing)
- Ariob development environment

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

### Development Workflow

1. **Start Dev Server**: `pnpm dev`
2. **Scan QR Code**: Use LynxExplorer app to scan the QR code in terminal
3. **Hot Reload**: Edit files in `src/` - changes reflect instantly
4. **Build**: Run `pnpm build` to create production bundles

### Testing Features

1. **Create Account**: Launch app → Create Account → Set username & password
2. **Login**: Use credentials to log back in
3. **Create Post**: Tap "+" button → Select degree → Write post
4. **View Feed**: See posts in unified feed with degree filtering
5. **Send Message**: Tap message icon → Select recipient → Send DM
6. **View Thread**: Tap thread preview to view conversation
7. **Profile**: Access profile to view account info and log out

## Design System

### Degree Colors

Ripple uses a temperature-based color system for degree visibility:

- **0° Personal** (Hot): Red accent - `hsl(0, 70%, 50%)`
- **1° Friends** (Warm): Orange accent - `hsl(30, 80%, 55%)`
- **2° Extended** (Cool): Blue accent - `hsl(210, 70%, 50%)`

### Media Signatures

Each content type has a unique visual signature:

- **Posts**: Document icon, vertical accent strip
- **Messages**: Message icon, lock indicator, rounded corners
- **Focused Items**: Scaled up with focus lens effect (future)

## Network Configuration

### Peer Management

Ripple uses Gun.js relay peers for P2P synchronization. Peers can be configured through the Settings screen or programmatically.

#### Default Configuration

By default, Ripple connects to a local Gun relay server:

```typescript
// Default peer (can be changed in Settings)
const DEFAULT_PEERS = ['http://localhost:8765/gun'];
```

#### Configuring Peers in Settings

1. Navigate to Settings screen
2. Scroll to "Network Configuration" section
3. View current active peers with count
4. Add new peers using the input field:
   - Supports protocols: ws://, wss://, http://, https://
   - Add multiple peers at once by separating with commas (e.g., `ws://peer1.com/gun, wss://peer2.com/gun`)
5. Remove peers by tapping the X button next to each peer
6. Tap "Apply Changes" button to add peers to the active Gun instance
7. Changes are saved to localStorage and persist across sessions

#### Programmatic Configuration

```typescript
import { getPeers, setPeers, addPeer, removePeer, addPeersToGraph } from '@ariob/core';

// Get current peers
const peers = getPeers();
console.log('Current peers:', peers);

// Set peers (replaces all existing peers in localStorage)
setPeers(['wss://relay1.example.com/gun', 'wss://relay2.example.com/gun']);

// Add a single peer to localStorage
addPeer('wss://relay3.example.com/gun');

// Remove a peer from localStorage
removePeer('ws://localhost:8765/gun');

// Add peers to the active Gun instance (uses gun.opt())
addPeersToGraph(['wss://relay1.com/gun', 'wss://relay2.com/gun']);

// Initialize graph with custom peers on startup
import { graph } from '@ariob/core';
const g = graph({ peers: ['wss://my-relay.com/gun'] });
```

#### Peer Configuration Storage

Peer configuration is persisted in localStorage under the key `'gun-peers'`. The configuration automatically loads when the app initializes, and changes are tracked in the graph store.

```typescript
// Config is loaded automatically on first graph() call
const g = graph(); // Loads peers from localStorage

// Override with explicit config
const g = graph({ peers: ['wss://custom.com/gun'] });

// Graph store tracks current peers
import { graphStore } from '@ariob/core';
const currentPeers = graphStore.getState().peers;
```

**Dynamic Peer Management**: When peers are modified through Settings or programmatically via `addPeersToGraph()`, the function uses Gun's `.opt()` method to add peers to the existing instance. This allows Gun to establish new connections without destroying the existing instance or losing its state. Changes take effect immediately without requiring an app restart.

## User Profiles

### Profile Data Structure

User profiles are stored in the Gun user graph under the `profile` node:

```typescript
interface UserProfile {
  alias: string;           // Username
  bio?: string;            // User bio/description
  avatar?: string;         // Avatar URL or data URI
  location?: string;       // User location
  website?: string;        // User website
  createdAt?: number;      // Account creation timestamp
  updatedAt?: number;      // Last profile update
}
```

### Saving Profile Data

```typescript
import { saveUserProfile } from '@ariob/core';

// Update user profile
await saveUserProfile(graph(), {
  alias: 'alice',
  bio: 'Building decentralized apps',
  location: 'San Francisco',
  website: 'https://example.com'
});
```

### Fetching Profile Data

```typescript
import { useUserProfile } from '@ariob/core';

function MyProfile() {
  const g = graph();
  const { profile, loading } = useUserProfile(g);

  if (loading) return <text>Loading...</text>;

  return (
    <view>
      <text>{profile?.alias}</text>
      <text>{profile?.bio}</text>
    </view>
  );
}
```

### Profile Creation

When creating an account, the alias and timestamps are automatically saved to Gun:

```typescript
// createAccount automatically saves:
// - profile.alias
// - profile.createdAt
// - profile.updatedAt
```

## Gun.js Integration

### Real-Time Subscriptions

```typescript
import { useFeed } from '@ariob/ripple';

function MyFeed() {
  // Automatically subscribes to degree 1 feed
  const { items, loading, post, sendMessage } = useFeed({ degree: '1' });

  // Items update in real-time as Gun.js syncs
  return items.map(item => <FeedItem data={item.data} />);
}
```

### Creating Content

```typescript
// Create a post
await post({
  content: 'Hello Ripple!',
  author: user.pub,
  authorAlias: user.alias,
  degree: '1'
});

// Send a message
await sendMessage({
  text: 'Hi there!',
  from: user.pub,
  to: recipientPub,
  threadId: createThreadId(user.pub, recipientPub)
});
```

## Navigation

The app uses a custom Navigator system with state-based routing:

```typescript
// Navigate to a feature
navigator.navigate('composer', { type: 'post', degree: '1' });

// Go back
navigator.goBack();

// Reset to auth
navigator.reset('auth');
```

## Future Enhancements

### Planned Features

- [ ] Focus lens animation with gesture controls
- [ ] Degree page swipe with haptic feedback
- [ ] Frame transitions and polish
- [ ] Post comments/replies
- [ ] User tagging and mentions
- [ ] Media attachments (images, videos)
- [ ] Group conversations
- [ ] Contact discovery and friend requests
- [ ] Notification system
- [ ] Performance optimizations (virtualization, lazy loading)

### Known Limitations

- DMs not yet encrypted (SEA encryption to be implemented)
- No offline-first data persistence yet
- Basic error handling needs improvement
- No image/media support yet
- Comments system not implemented

## Contributing

This is an experimental project exploring decentralized social networking with LynxJS and Gun.js. Contributions and feedback are welcome!

## License

See the main Ariob repository for license information.

---

Built with ❤️ using [LynxJS](https://lynxjs.org) and [Gun.js](https://gun.eco)
