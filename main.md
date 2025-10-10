// apps/senterej/src/App.tsx
import * as React from ‘@lynx-js/react’;
import { useState, useCallback, useMemo } from ‘@lynx-js/react’;
import {
Column,
Row,
Button,
Card,
CardContent,
CardHeader,
CardTitle,
Input,
Scrollable,
useTheme
} from ‘@ariob/ui’;
import { Board, GameInfo, MoveHistory } from ‘@ariob/senterej-ui’;
import { useP2PGame } from ‘@ariob/senterej-p2p’;
import { getValidMoves, type Position } from ‘@ariob/senterej-engine’;
import { useAuth } from ‘@ariob/core’;

type Screen = ‘menu’ | ‘lobby’ | ‘game’;

export default function SenterejApp() {
const { withTheme } = useTheme();
const { gun, user } = useAuth();
const [screen, setScreen] = useState<Screen>(‘menu’);
const [playerName, setPlayerName] = useState(’’);
const [sessionIdInput, setSessionIdInput] = useState(’’);
const [selectedSquare, setSelectedSquare] = useState<Position | undefined>();
const [validMoves, setValidMoves] = useState<Position[]>([]);

const {
session,
error,
loading,
localPlayer,
createGame,
joinGame,
makeMove,
leaveGame
} = useP2PGame({
gun,
user,
playerName,
sessionId: sessionIdInput,
autoJoin: false
});

// Handle creating a new game
const handleCreateGame = useCallback(async () => {
if (!playerName.trim()) {
alert(‘Please enter your name’);
return;
}

```
const sessionId = await createGame();
if (sessionId) {
  setScreen('game');
}
```

}, [playerName, createGame]);

// Handle joining a game
const handleJoinGame = useCallback(async () => {
if (!playerName.trim()) {
alert(‘Please enter your name’);
return;
}

```
if (!sessionIdInput.trim()) {
  alert('Please enter a game code');
  return;
}

await joinGame(sessionIdInput);
if (!error) {
  setScreen('game');
}
```

}, [playerName, sessionIdInput, joinGame, error]);

// Handle square press
const handleSquarePress = useCallback((position: Position) => {
if (!session || !localPlayer) return;

```
const piece = session.state.board[position.row][position.col];

// If no square selected, select this square if it's the player's piece
if (!selectedSquare) {
  if (piece && piece.player === localPlayer) {
    // In werera phase, any piece can be selected
    // In normal phase, only if it's the player's turn
    if (session.state.phase === 'werera' || 
        session.state.currentPlayer === localPlayer) {
      setSelectedSquare(position);
      const moves = getValidMoves(piece, session.state.board, session.state.phase);
      setValidMoves(moves);
    }
  }
  return;
}

// If clicking the same square, deselect
if (selectedSquare.row === position.row && selectedSquare.col === position.col) {
  setSelectedSquare(undefined);
  setValidMoves([]);
  return;
}

// If clicking another piece of the same color, select it instead
if (piece && piece.player === localPlayer) {
  setSelectedSquare(position);
  const moves = getValidMoves(piece, session.state.board, session.state.phase);
  setValidMoves(moves);
  return;
}

// Try to make a move
const isValid = validMoves.some(m => m.row === position.row && m.col === position.col);
if (isValid) {
  makeMove(selectedSquare, position);
  setSelectedSquare(undefined);
  setValidMoves([]);
}
```

}, [session, localPlayer, selectedSquare, validMoves, makeMove]);

// Handle leaving game
const handleLeaveGame = useCallback(() => {
leaveGame();
setScreen(‘menu’);
setSelectedSquare(undefined);
setValidMoves([]);
}, [leaveGame]);

// Render menu screen
const renderMenu = () => (
<Column className="flex-1 p-6 gap-6 items-center justify-center">
<view className="items-center gap-3 mb-8">
<text className="text-4xl font-bold text-primary">ሰንጠረዥ</text>
<text className="text-2xl font-semibold">Senterej</text>
<text className="text-sm text-muted-foreground text-center">
Ethiopian Chess • Peer-to-Peer Multiplayer
</text>
</view>

```
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle>Player Setup</CardTitle>
    </CardHeader>
    <CardContent className="gap-4">
      <view>
        <text className="text-sm mb-2">Your Name</text>
        <Input
          placeholder="Enter your name"
          value={playerName}
          onChangeText={setPlayerName}
        />
      </view>
      
      <Button
        variant="default"
        size="lg"
        className="w-full"
        onClick={handleCreateGame}
        disabled={loading || !playerName.trim()}
      >
        {loading ? 'Creating...' : 'Create New Game'}
      </Button>
      
      <view className="flex-row items-center gap-3">
        <view className="flex-1 h-px bg-border" />
        <text className="text-xs text-muted-foreground">OR</text>
        <view className="flex-1 h-px bg-border" />
      </view>
      
      <view>
        <text className="text-sm mb-2">Game Code</text>
        <Input
          placeholder="Enter game code to join"
          value={sessionIdInput}
          onChangeText={setSessionIdInput}
        />
      </view>
      
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleJoinGame}
        disabled={loading || !playerName.trim() || !sessionIdInput.trim()}
      >
        {loading ? 'Joining...' : 'Join Game'}
      </Button>
    </CardContent>
  </Card>
  
  {error && (
    <Card className="w-full max-w-md bg-destructive/10">
      <CardContent className="p-4">
        <text className="text-sm text-destructive">{error.message}</text>
      </CardContent>
    </Card>
  )}
  
  <Card className="w-full max-w-md mt-4">
    <CardHeader>
      <CardTitle>How to Play</CardTitle>
    </CardHeader>
    <CardContent>
      <Column className="gap-2">
        <text className="text-xs">
          • <text className="font-semibold">Werera Phase:</text> Both players move freely until first capture
        </text>
        <text className="text-xs">
          • <text className="font-semibold">Normal Phase:</text> Players alternate turns after first capture
        </text>
        <text className="text-xs">
          • <text className="font-semibold">Special Pieces:</text> Fers (Minister) moves 1 diagonal, Saba (Elephant) jumps 2 diagonal
        </text>
        <text className="text-xs">
          • <text className="font-semibold">Pawns:</text> Move 1 square forward only, no double-step or en passant
        </text>
      </Column>
    </CardContent>
  </Card>
</Column>
```

);

// Render game screen
const renderGame = () => {
if (!session) {
return (
<Column className="flex-1 items-center justify-center">
<text>Loading game…</text>
</Column>
);
}

```
const opponentName = localPlayer === 'green' 
  ? session.players.gold?.name || 'Waiting for opponent...'
  : session.players.green?.name || 'Unknown';

const isWaitingForOpponent = !session.players.green || !session.players.gold;

return (
  <Column className="flex-1 gap-4 p-4">
    {/* Header */}
    <Row className="items-center justify-between">
      <view>
        <text className="text-xl font-bold">Senterej</text>
        <text className="text-xs text-muted-foreground">
          {localPlayer === 'green' ? 'Green ♔' : 'Gold ♚'} • vs {opponentName}
        </text>
      </view>
      <Button variant="outline" size="sm" onClick={handleLeaveGame}>
        Leave Game
      </Button>
    </Row>
    
    {/* Waiting for opponent */}
    {isWaitingForOpponent && (
      <Card>
        <CardContent className="p-4">
          <Column className="gap-2">
            <text className="font-semibold">Waiting for opponent...</text>
            <text className="text-sm text-muted-foreground">
              Share this game code: <text className="font-mono">{session.id}</text>
            </text>
          </Column>
        </CardContent>
      </Card>
    )}
    
    <Scrollable className="flex-1">
      <Row className="gap-4">
        {/* Game Board */}
        <view className="flex-1">
          <Board
            gameState={session.state}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            onSquarePress={handleSquarePress}
            localPlayer={localPlayer}
          />
        </view>
        
        {/* Sidebar */}
        <Column className="w-80 gap-4">
          <GameInfo
            gameState={session.state}
            localPlayer={localPlayer}
            opponentName={opponentName}
          />
          
          <MoveHistory
            moves={session.state.moves}
            localPlayer={localPlayer}
          />
        </Column>
      </Row>
    </Scrollable>
  </Column>
);
```

};

return (
<view className={withTheme(‘bg-background’, ‘bg-background’)}>
{screen === ‘menu’ && renderMenu()}
{screen === ‘game’ && renderGame()}
</view>
);
}

// apps/senterej/src/index.tsx
import * as React from ‘@lynx-js/react’;
import { createRoot } from ‘@lynx-js/react’;
import App from ‘./App’;
import ‘./styles/globals.css’;

const root = createRoot(document.getElementById(‘root’)!);
root.render(<App />);

// apps/senterej/lynx.config.ts
import { defineConfig } from ‘@lynx-js/core’;

export default defineConfig({
app: {
name: ‘Senterej’,
displayName: ‘ሰንጠረዥ Senterej’,
description: ‘Peer-to-peer Ethiopian Chess multiplayer game’,
},
platforms: {
ios: {
bundleId: ‘com.ariob.senterej’,
},
android: {
package: ‘com.ariob.senterej’,
},
},
build: {
entry: ‘./src/index.tsx’,
output: ‘./dist’,
},
});

// apps/senterej/package.json
{
“name”: “senterej”,
“version”: “1.0.0”,
“private”: true,
“main”: “src/index.tsx”,
“scripts”: {
“dev”: “lynx dev”,
“build”: “lynx build”,
“test”: “vitest”
},
“dependencies”: {
“@ariob/core”: “workspace:*”,
“@ariob/ui”: “workspace:*”,
“@ariob/senterej-engine”: “workspace:*”,
“@ariob/senterej-ui”: “workspace:*”,
“@ariob/senterej-p2p”: “workspace:*”,
“@lynx-js/react”: “^0.114.0”,
“@lynx-js/types”: “3.4.11”
},
“devDependencies”: {
“@lynx-js/core”: “latest”,
“typescript”: “^5.0.0”,
“vitest”: “^0.34.0”
}
}

// apps/senterej/tailwind.config.js
/** @type {import(‘tailwindcss’).Config} */
module.exports = {
content: [
’./src/**/*.{js,ts,jsx,tsx}’,
‘../../packages/ui/src/**/*.{js,ts,jsx,tsx}’,
’../../packages/senterej-ui/src/**/*.{js,ts,jsx,tsx}’,
],
presets: [
require(’@lynx-js/tailwind-preset’),
],
theme: {
extend: {
colors: {
border: “hsl(var(–border))”,
input: “hsl(var(–input))”,
ring: “hsl(var(–ring))”,
background: “hsl(var(–background))”,
foreground: “hsl(var(–foreground))”,
primary: {
DEFAULT: “hsl(var(–primary))”,
foreground: “hsl(var(–primary-foreground))”,
},
destructive: {
DEFAULT: “hsl(var(–destructive))”,
foreground: “hsl(var(–destructive-foreground))”,
},
muted: {
DEFAULT: “hsl(var(–muted))”,
foreground: “hsl(var(–muted-foreground))”,
},
},
},
},
plugins: [
require(‘tailwindcss-animate’),
],
};