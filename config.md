# Senterej - Peer-to-Peer Ethiopian Chess

A decentralized, peer-to-peer multiplayer implementation of Senterej (Ethiopian Chess) built with LynxJS, following UNIX and React philosophies.

## 🎯 Philosophy

### UNIX Philosophy Applied

1. **Do One Thing Well**: Each package has a single, clear purpose
- `@ariob/senterej-engine`: Pure game logic, no dependencies
- `@ariob/senterej-ui`: Presentational components only
- `@ariob/senterej-p2p`: Networking layer, isolated from UI
1. **Composition**: Small, focused modules that work together
- Engine validates moves without knowing about networking
- UI renders state without knowing where it comes from
- P2P syncs data without knowing game rules
1. **Text Streams**: Data flows unidirectionally through the system
- Game state → UI rendering
- User input → Engine validation → P2P sync
- P2P updates → Game state → UI

### React Philosophy Applied

1. **Unidirectional Data Flow**:
- State flows down through props
- Events bubble up through callbacks
- No two-way binding
1. **Component Composition**:
- Small, reusable pieces (`Square`, `PieceView`, `Board`)
- Container components handle logic
- Presentational components render
1. **Declarative UI**:
- Describe what you want, not how to build it
- UI is a function of state: `UI = f(state)`

## 📦 Package Structure

```
packages/
├── senterej-engine/          # Pure game logic
│   ├── src/
│   │   ├── types.ts          # Game types
│   │   ├── board.ts          # Board utilities
│   │   ├── moves.ts          # Move validation
│   │   ├── game.ts           # Game state management
│   │   └── index.ts          # Public API
│   └── package.json
│
├── senterej-ui/              # LynxJS UI components
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board.tsx     # Chess board
│   │   │   ├── Square.tsx    # Individual square
│   │   │   ├── GameInfo.tsx  # Status panel
│   │   │   └── MoveHistory.tsx
│   │   └── index.ts
│   └── package.json
│
├── senterej-p2p/             # Networking layer
│   ├── src/
│   │   ├── types.ts          # P2P types
│   │   ├── game-sync.ts      # Gun.js sync
│   │   ├── session-discovery.ts
│   │   ├── hooks/
│   │   │   └── useP2PGame.ts # React hook
│   │   └── index.ts
│   └── package.json
│
apps/senterej/                # Main application
├── src/
│   ├── App.tsx              # Main app component
│   ├── index.tsx            # Entry point
│   └── styles/
│       └── globals.css
├── lynx.config.ts
├── package.json
└── tailwind.config.js
```

## 🎮 Game Rules

### Piece Movement

|Piece          |Amharic|Movement                          |
|---------------|-------|----------------------------------|
|Negus (King)   |ንጉስ    |One square in any direction       |
|Fers (Minister)|ፈርዝ    |One square diagonally             |
|Saba (Elephant)|ሳባ     |Jumps exactly 2 squares diagonally|
|Ferese (Knight)|ፈረስ    |Standard L-shape                  |
|Der (Rook)     |ደር     |Horizontal/vertical lines         |
|Medeq (Pawn)   |መደቅ    |One square forward, no double-step|

### Special Rules

1. **Werera Phase** (Mobilization):
- Both players move freely without turns
- Continues until first capture
- Players can move as fast as they want
- Castling only possible in this phase (king moves 2 right)
1. **Normal Phase**:
- Starts after first capture
- Players alternate turns
- Standard chess rules apply
1. **Victory Conditions**:
- Checkmate the opponent’s king
- Most honorable: Pawn checkmate
- Least honorable: Rook or knight checkmate

## 🚀 Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev:senterej

# Build for production
pnpm build:senterej
```

## 🔧 Package.json Files

### packages/senterej-engine/package.json

```json
{
  "name": "@ariob/senterej-engine",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "sideEffects": false,
  "dependencies": {},
  "peerDependencies": {},
  "type": "module"
}
```

### packages/senterej-ui/package.json

```json
{
  "name": "@ariob/senterej-ui",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "sideEffects": false,
  "dependencies": {
    "@ariob/senterej-engine": "workspace:*",
    "@ariob/ui": "workspace:*",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "peerDependencies": {
    "@lynx-js/react": "^0.114.0",
    "@lynx-js/types": "3.4.11"
  },
  "type": "module"
}
```

### packages/senterej-p2p/package.json

```json
{
  "name": "@ariob/senterej-p2p",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "sideEffects": false,
  "dependencies": {
    "@ariob/senterej-engine": "workspace:*"
  },
  "peerDependencies": {
    "@lynx-js/react": "^0.114.0"
  },
  "type": "module"
}
```

## 🔌 Integration with @ariob/core

The P2P layer integrates seamlessly with your existing `@ariob/core` Gun.js setup:

```typescript
import { useAuth } from '@ariob/core';
import { useP2PGame } from '@ariob/senterej-p2p';

function MyComponent() {
  const { gun, user } = useAuth();
  
  const { session, createGame, makeMove } = useP2PGame({
    gun,
    user,
    playerName: 'Player1'
  });
  
  // Rest of your component...
}
```

## 🧪 Testing

Each package is independently testable:

```bash
# Test game engine
pnpm --filter @ariob/senterej-engine test

# Test UI components
pnpm --filter @ariob/senterej-ui test

# Test P2P sync
pnpm --filter @ariob/senterej-p2p test

# Test full app
pnpm --filter senterej test
```

## 📝 API Documentation

### Engine API

```typescript
import { createGame, makeMove, getValidMoves } from '@ariob/senterej-engine';

// Create new game
const game = createGame();

// Get valid moves for a piece
const moves = getValidMoves(piece, game.board, game.phase);

// Make a move
const newState = makeMove(game, from, to);
```

### UI Components

```typescript
import { Board, GameInfo, MoveHistory } from '@ariob/senterej-ui';

<Board
  gameState={state}
  selectedSquare={selected}
  validMoves={moves}
  onSquarePress={handlePress}
  localPlayer="green"
/>
```

### P2P Hook

```typescript
import { useP2PGame } from '@ariob/senterej-p2p';

const {
  session,          // Current game session
  error,            // Any errors
  loading,          // Loading state
  localPlayer,      // 'green' or 'gold'
  createGame,       // () => Promise<string>
  joinGame,         // (sessionId) => Promise<void>
  makeMove,         // (from, to) => Promise<void>
  leaveGame         // () => void
} = useP2PGame({ gun, user, playerName });
```

## 🌐 P2P Architecture

```
Player 1 (Green)                    Gun.js Relay                    Player 2 (Gold)
     |                                   |                                |
     |-- Create Session --------------->|                                |
     |<-- Session ID -------------------|                                |
     |                                   |<-- Join Session ---------------|
     |<-- Opponent Joined --------------|---- Opponent Joined ---------->|
     |                                   |                                |
     |-- Move (Werera) ---------------->|---- Move Sync ---------------->|
     |<-- Move Sync --------------------|<-- Move (Werera) --------------|
     |                                   |                                |
     |-- Capture (End Werera) --------->|---- End Werera --------------->|
     |                                   |                                |
     |<-- Turn: Gold -------------------|---- Turn: Gold --------------->|
     |                                   |<-- Move (Normal) --------------|
     |<-- Move Sync --------------------|---- Move Sync ---------------->|
```

## 🎨 Styling

All components use Tailwind CSS with your existing @ariob/ui theme:

- Traditional red board with black grid lines
- Green and gold pieces (chess symbols)
- Dark/light mode support via `useTheme()`
- Responsive design for mobile and desktop

## 🔒 Security

- Gun.js SEA encryption for all game data
- Peer-to-peer validation prevents cheating
- No central server required
- All moves verified by game engine

## 📱 Platform Support

- ✅ iOS (LynxJS native)
- ✅ Android (LynxJS native)
- ✅ Web (LynxJS web runtime)

## 🤝 Contributing

Follow the established patterns:

1. Keep packages focused (UNIX philosophy)
1. Use composition over inheritance (React philosophy)
1. Write pure functions where possible
1. Test each package independently
1. Use TypeScript for type safety

## 📄 License

Private - Part of the Ariob ecosystem

-----

Built with ❤️ using LynxJS and Gun.js