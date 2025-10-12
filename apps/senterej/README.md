# Senterej - Ethiopian Chess P2P Multiplayer Game

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![LynxJS](https://img.shields.io/badge/LynxJS-121212?style=for-the-badge&logo=javascript&logoColor=white)](https://lynxjs.org/)
[![P2P](https://img.shields.io/badge/P2P-Gun.js-orange?style=for-the-badge)](https://gun.eco/)

A real-time, peer-to-peer multiplayer implementation of Senterej (ሰንጠረዥ), the traditional Ethiopian chess variant, built with modern web technologies following UNIX and React philosophy principles.

[Project Overview](#project-overview) • [Architecture](#architecture) • [Game Rules](#game-rules) • [Package Documentation](#package-documentation) • [Getting Started](#getting-started) • [API Reference](#api-reference) • [Implementation Details](#implementation-details) • [Development Guide](#development-guide)

</div>

## Project Overview

### What is Senterej?

Senterej is Ethiopia's traditional chess-like board game with unique gameplay mechanics including:
- **Werera Phase**: Initial phase with free movement for both players
- **Asymmetric Pieces**: Different piece movements than international chess
- **Ethiopian Names**: Traditional piece names (Negus, Fers, Saba, etc.)
- **P2P Multiplayer**: Real-time gameplay without central servers

### Key Features

- **Decentralized Architecture**: Peer-to-peer gameplay using Gun.js distributed database
- **Real-time Synchronization**: Instant move updates across all connected clients
- **Progressive Gameplay**: Two-phase system (Werera → Normal)
- **Type-Safe Implementation**: Full TypeScript coverage with strict typing
- **Modular Design**: Clean separation of concerns following UNIX philosophy
- **Cross-platform**: Works on web, desktop, and mobile via LynxJS

### Tech Stack

- **LynxJS**: Cross-platform React-based framework for native apps
- **Gun.js**: Decentralized graph database for P2P synchronization
- **TypeScript**: Type-safe development with compile-time checking
- **TailwindCSS**: Utility-first CSS framework for styling
- **Rsbuild**: Fast build tool for modern web applications

## Architecture

### Package Structure and Responsibilities

```
ariob/
├── packages/
│   ├── senterej-engine/     # Pure game logic (no UI, no network)
│   │   ├── types.ts         # Core type definitions
│   │   ├── board.ts         # Board initialization and utilities
│   │   ├── moves.ts         # Move validation and check detection
│   │   └── game.ts          # Game state management
│   │
│   ├── senterej-ui/         # UI components (pure presentation)
│   │   ├── Board.tsx        # Main game board component
│   │   ├── Square.tsx       # Individual square component
│   │   ├── PieceView.tsx    # Piece rendering component
│   │   ├── GameInfo.tsx     # Game status display
│   │   └── MoveHistory.tsx  # Move list component
│   │
│   └── senterej-p2p/        # P2P networking layer
│       ├── game-sync.ts     # P2P synchronization logic
│       ├── session-discovery.ts # Game session discovery
│       └── hooks/           # React hooks for P2P integration
│
└── apps/
    └── senterej/            # Main application
        └── pages/           # Application screens
            ├── MenuScreen.tsx
            ├── LobbyScreen.tsx
            └── GameScreen.tsx
```

### UNIX Philosophy Principles Applied

1. **Do One Thing Well**: Each package has a single, well-defined responsibility
   - Engine: Game logic only
   - UI: Presentation only
   - P2P: Network synchronization only

2. **Composition Over Monoliths**: Small, composable modules that work together
   - `useP2PGame` hook combines engine and networking
   - UI components accept game state as props
   - Clean interfaces between packages

3. **Text Streams Philosophy**: Data flows as simple, serializable structures
   - Game state as plain JSON objects
   - Move commands as position pairs
   - No complex class hierarchies

### React Philosophy Principles Applied

1. **Declarative UI**: Board state drives rendering
   ```tsx
   <Board gameState={session.state} />
   ```

2. **Unidirectional Data Flow**: State flows down, events bubble up
   ```
   GameScreen → Board → Square → onSquarePress → makeMove → Gun.js → GameScreen
   ```

3. **Component Composition**: Small, focused components
   - `Square` handles individual squares
   - `Board` composes 64 squares
   - `GameScreen` orchestrates the full experience

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Gun.js P2P Network                   │
│                                                              │
│  Player A                                      Player B      │
│  ┌──────────┐                              ┌──────────┐     │
│  │ Browser  │◄────── Sync via Gun.js ─────►│ Browser  │     │
│  └────┬─────┘                              └────┬─────┘     │
│       │                                          │           │
└───────┼──────────────────────────────────────────┼───────────┘
        │                                          │
        ▼                                          ▼
┌──────────────┐                          ┌──────────────┐
│ useP2PGame   │                          │ useP2PGame   │
│    Hook      │                          │    Hook      │
├──────────────┤                          ├──────────────┤
│ SenterejP2P  │                          │ SenterejP2P  │
│    Sync      │                          │    Sync      │
└──────┬───────┘                          └──────┬───────┘
       │                                          │
       ▼                                          ▼
┌──────────────┐                          ┌──────────────┐
│   Engine     │                          │   Engine     │
│  makeMove()  │                          │  makeMove()  │
└──────┬───────┘                          └──────┬───────┘
       │                                          │
       ▼                                          ▼
┌──────────────┐                          ┌──────────────┐
│  UI Layer    │                          │  UI Layer    │
│   <Board/>   │                          │   <Board/>   │
└──────────────┘                          └──────────────┘
```

## Game Rules

### Brief Explanation of Senterej Rules

Senterej is played on an 8×8 board with unique pieces and movement patterns. The game has two distinct phases that fundamentally change gameplay dynamics.

### Game Phases

#### Werera Phase (ወረራ - "Raid/Attack")
- **Initial phase** where both players can move freely
- Players alternate turns but no turn enforcement
- Strategic positioning before main battle
- **Ends when**: First capture occurs
- Similar to deployment phase in strategy games

#### Normal Phase
- Traditional turn-based gameplay begins
- Strict turn alternation (Green → Gold → Green...)
- Check and checkmate rules apply
- Game continues until checkmate or draw

### Piece Types and Movements

| Piece | Ethiopian | English | Movement | Special Rules |
|-------|-----------|---------|----------|---------------|
| ♔/♚ | ንጉሥ (Negus) | King | One square any direction | Can castle in Werera phase |
| ♕/♛ | ፈረስ (Fers) | Minister | One square diagonally | No special moves |
| ♗/♝ | ሳባ (Saba) | Elephant | Jumps exactly 2 squares diagonally | Can jump over pieces |
| ♘/♞ | ፈረሰ (Ferese) | Knight | L-shape (2+1 squares) | Same as chess knight |
| ♖/♜ | ደር (Der) | Castle | Any distance horizontally/vertically | Can castle with king |
| ♙/♟ | መደቅ (Medeq) | Pawn | One square forward, captures diagonally | No double-move or en passant |

### Winning Conditions

1. **Checkmate**: Opponent's king is in check with no legal moves
2. **Resignation**: Player voluntarily concedes
3. **Time**: (If implemented) Player runs out of time

## Package Documentation

### @ariob/senterej-engine

Pure game logic implementation with zero dependencies. Handles all game rules, move validation, and state management.

**Key Exports:**
```typescript
// Types
type PieceType = 'negus' | 'fers' | 'saba' | 'ferese' | 'der' | 'medeq';
type Player = 'green' | 'gold';
type GamePhase = 'werera' | 'normal' | 'ended';

// Functions
createGame(): GameState              // Initialize new game
makeMove(state, from, to): GameState // Execute and validate move
getValidMoves(piece, board, phase): Position[] // Get legal moves
isInCheck(player, board, phase): boolean      // Check detection

// Board utilities
createInitialBoard(): (Piece | null)[][]
positionEquals(a, b): boolean
isValidPosition(pos): boolean
```

**Usage Example:**
```typescript
import { createGame, makeMove, getValidMoves } from '@ariob/senterej-engine';

const game = createGame();
const piece = game.board[1][4]; // Get pawn
const moves = getValidMoves(piece, game.board, game.phase);
const newState = makeMove(game, {row: 1, col: 4}, {row: 2, col: 4});
```

### @ariob/senterej-ui

Presentational React components for rendering the game interface. Follows component composition pattern.

**Key Components:**
```typescript
// Main board component
<Board
  gameState={gameState}
  selectedSquare={selectedPosition}
  validMoves={validMovesList}
  onSquarePress={(position) => handleMove(position)}
  localPlayer="green"
/>

// Game information panel
<GameInfo
  gameState={gameState}
  localPlayer="green"
  opponentName="Player 2"
/>

// Move history display
<MoveHistory
  moves={gameState.moves}
  localPlayer="green"
/>
```

### @ariob/senterej-p2p

P2P networking layer using Gun.js for real-time synchronization between players.

**Core Classes:**

1. **SenterejP2PSync**: Main synchronization manager
   ```typescript
   class SenterejP2PSync {
     createSession(playerName): Promise<string>
     joinSession(sessionId, playerName): Promise<void>
     makeMove(from, to): Promise<void>
     leaveSession(): void
     getLocalPlayer(): Player | undefined
   }
   ```

2. **SessionDiscovery**: Find available games
   ```typescript
   class SessionDiscovery {
     listSessions(): Promise<GameSession[]>
     watchSessions(callback): () => void  // Returns cleanup function
   }
   ```

3. **useP2PGame Hook**: React integration
   ```typescript
   const {
     session,        // Current game session
     error,          // Any errors
     loading,        // Loading state
     localPlayer,    // 'green' or 'gold'
     createGame,     // Create new game
     joinGame,       // Join existing game
     makeMove,       // Make a move
     leaveGame       // Leave current game
   } = useP2PGame({ gun, user, sessionId, playerName });
   ```

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/ariobstudio/ariob.git
cd ariob

# Install dependencies
pnpm install

# Navigate to the Senterej app
cd apps/senterej
```

### Development Setup

```bash
# Start development server
pnpm dev

# The app will be available at http://localhost:3000
# QR code for mobile testing will be displayed in terminal
```

### Building for Production

```bash
# Build the application
pnpm build

# Preview production build
pnpm preview
```

### Project Structure

```
senterej/
├── src/
│   ├── index.tsx          # Application entry point
│   ├── App.tsx            # Main app component
│   └── pages/
│       ├── MenuScreen.tsx # Main menu
│       ├── LobbyScreen.tsx # Game lobby
│       └── GameScreen.tsx  # Game play screen
├── package.json
├── tsconfig.json
└── README.md
```

## API Reference

### Core Functions

#### createGame()
Creates a new game with initial board setup.
```typescript
const gameState = createGame();
// Returns GameState with:
// - board: 8x8 array with pieces in starting positions
// - phase: 'werera'
// - currentPlayer: 'green'
// - moves: []
// - capturedPieces: { green: [], gold: [] }
```

#### makeMove(state, from, to)
Validates and executes a move.
```typescript
const newState = makeMove(gameState,
  { row: 1, col: 4 },  // from position
  { row: 3, col: 4 }   // to position
);
// Returns: new GameState or null if invalid
```

#### getValidMoves(piece, board, phase)
Returns all legal moves for a piece.
```typescript
const moves = getValidMoves(
  piece,           // Piece object
  gameState.board, // Current board
  gameState.phase  // Current phase
);
// Returns: Position[] of valid destinations
```

### Hook Usage Examples

#### Basic Game Setup
```tsx
function GameComponent() {
  const { session, makeMove, localPlayer } = useP2PGame({
    gun: gunInstance,
    user: gun.user(),
    sessionId: 'game-123',
    playerName: 'Alice'
  });

  const handleMove = async (from, to) => {
    try {
      await makeMove(from, to);
    } catch (error) {
      console.error('Invalid move:', error);
    }
  };

  return <Board
    gameState={session?.state}
    onSquarePress={handleMove}
    localPlayer={localPlayer}
  />;
}
```

#### Creating/Joining Games
```tsx
function Lobby() {
  const { createGame, joinGame, loading } = useP2PGame({
    gun,
    user: gun.user(),
    playerName: 'Player'
  });

  const handleCreate = async () => {
    const sessionId = await createGame();
    console.log('Created game:', sessionId);
  };

  const handleJoin = async (id: string) => {
    await joinGame(id);
  };

  return (
    <div>
      <Button onClick={handleCreate} disabled={loading}>
        Create Game
      </Button>
      <Input
        onSubmit={(id) => handleJoin(id)}
        placeholder="Enter game ID"
      />
    </div>
  );
}
```

### Component Props

#### Board Component
```typescript
interface BoardProps {
  gameState: GameState;           // Current game state
  selectedSquare?: Position;      // Currently selected square
  validMoves?: Position[];         // Valid moves for selected piece
  onSquarePress: (pos) => void;   // Square click handler
  localPlayer?: 'green' | 'gold'; // Player perspective
}
```

#### GameInfo Component
```typescript
interface GameInfoProps {
  gameState: GameState;           // Current game state
  localPlayer?: 'green' | 'gold'; // Local player color
  opponentName?: string;          // Opponent's display name
}
```

## Implementation Details

### How Moves Are Validated

Move validation follows a pipeline pattern with multiple validation stages:

1. **Piece Selection**
   ```typescript
   // Check piece exists and belongs to player
   const piece = state.board[from.row][from.col];
   if (!piece || piece.player !== currentPlayer) return null;
   ```

2. **Move Generation**
   ```typescript
   // Generate legal moves based on piece type
   const validMoves = getValidMoves(piece, board, phase);
   ```

3. **Destination Validation**
   ```typescript
   // Check if destination is in valid moves list
   if (!validMoves.some(m => positionEquals(m, to))) return null;
   ```

4. **Special Rules**
   - Werera phase: Any piece can move (no turn restriction)
   - Normal phase: Only current player can move
   - Castling: Only in Werera, king hasn't moved, path is clear
   - Check: King cannot move into check

5. **State Update**
   ```typescript
   // Clone board, move piece, handle captures
   const newBoard = state.board.map(row => [...row]);
   newBoard[to.row][to.col] = piece;
   newBoard[from.row][from.col] = null;
   ```

### How P2P Sync Works

The P2P synchronization leverages Gun.js's distributed graph database:

1. **Session Creation**
   ```typescript
   // Create unique session ID
   const sessionId = `senterej-${Date.now()}-${randomString()}`;

   // Store in Gun's distributed graph
   gun.get('senterej').get('games').get(sessionId).put(gameSession);
   ```

2. **Real-time Updates**
   ```typescript
   // Subscribe to session changes
   sessionRef.on((data) => {
     if (data) onGameUpdate(data);
   });
   ```

3. **Move Synchronization**
   ```typescript
   // Local move → Validate → Update Gun → Broadcast to peers
   const newState = makeMove(currentState, from, to);
   sessionRef.get('state').put(newState);
   ```

4. **Conflict Resolution**
   - Gun.js handles conflicts with CRDT (Conflict-free Replicated Data Types)
   - Last-write-wins for move ordering
   - State validation ensures consistency

### State Management Approach

The application uses a hybrid state management approach:

1. **Local State**: UI-specific state (selected square, valid moves)
   ```tsx
   const [selectedSquare, setSelectedSquare] = useState<Position>();
   const [validMoves, setValidMoves] = useState<Position[]>([]);
   ```

2. **P2P State**: Game state synchronized across peers
   ```typescript
   // Managed by Gun.js and accessed via hooks
   const { session } = useP2PGame({ ... });
   const gameState = session?.state;
   ```

3. **Derived State**: Computed from game state
   ```typescript
   const isMyTurn = gameState.currentPlayer === localPlayer;
   const canMove = isMyTurn || gameState.phase === 'werera';
   ```

## Development Guide

### Code Style Guidelines

1. **TypeScript First**: Use strict typing throughout
2. **Functional Components**: Use hooks over class components
3. **Pure Functions**: Keep game logic pure and testable
4. **Composition**: Small, focused functions and components

### Testing Strategy

```bash
# Run tests
pnpm test

# Run with coverage
pnpm run test:coverage
```

Test categories:
- **Unit Tests**: Game engine logic
- **Integration Tests**: P2P synchronization
- **Component Tests**: UI components
- **E2E Tests**: Full gameplay scenarios

### Common Development Tasks

#### Adding a New Piece Type
1. Add to `PieceType` in `types.ts`
2. Implement movement in `moves.ts`
3. Add symbol to `PIECE_SYMBOLS` in UI
4. Update board initialization if needed

#### Implementing New Game Mode
1. Add phase to `GamePhase` type
2. Update `makeMove()` logic
3. Add UI indicators in `GameInfo`
4. Update validation rules

#### Debugging P2P Issues
```typescript
// Enable Gun.js debugging
localStorage.setItem('gun/debug', 'true');

// Log all P2P events
sessionRef.on((data) => {
  console.log('Session update:', data);
});
```

### Performance Optimizations

1. **Memoization**: Use React.memo for board squares
2. **Batch Updates**: Group state changes
3. **Lazy Loading**: Load game sessions on demand
4. **Virtual Rendering**: For large move histories

### Security Considerations

1. **Input Validation**: All moves validated on each client
2. **No Trust**: Each peer validates received states
3. **Rate Limiting**: Prevent move spam (future enhancement)
4. **Encryption**: Gun.js SEA for authenticated games (future)

## Future Enhancements

### Planned Features
- [ ] AI opponent using minimax algorithm
- [ ] Tournament mode with brackets
- [ ] Spectator mode for watching games
- [ ] Move time limits and game clocks
- [ ] ELO rating system
- [ ] Game replay and analysis
- [ ] Mobile app deployment
- [ ] Sound effects and animations
- [ ] Chat between players
- [ ] Puzzle mode with scenarios

### Contributing

Contributions are welcome! Please follow the existing code style and include tests for new features.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is part of the Ariob Studio suite of applications.

## Credits

- Game Rules: Traditional Ethiopian Chess (ሰንጠረዥ)
- Framework: LynxJS by Ariob Studio
- P2P Layer: Gun.js by Mark Nadal
- UI Components: Ariob UI Library

---

**Built with ❤️ for preserving Ethiopian gaming heritage in the digital age**