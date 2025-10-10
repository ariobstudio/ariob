// packages/senterej-ui/src/components/Board.tsx
import * as React from ‘@lynx-js/react’;
import { type ViewProps } from ‘@lynx-js/types’;
import { cn } from ‘@ariob/ui’;
import type { GameState, Position, Piece } from ‘@ariob/senterej-engine’;

interface BoardProps extends ViewProps {
gameState: GameState;
selectedSquare?: Position;
validMoves?: Position[];
onSquarePress: (position: Position) => void;
localPlayer?: ‘green’ | ‘gold’;
}

export const Board = React.forwardRef<React.ElementRef<‘view’>, BoardProps>(
({ gameState, selectedSquare, validMoves = [], onSquarePress, localPlayer, className, …props }, ref) => {
const isFlipped = localPlayer === ‘gold’;

```
return (
  <view
    ref={ref}
    className={cn('flex flex-col w-full aspect-square', className)}
    data-slot="senterej-board"
    {...props}
  >
    {gameState.board.map((row, rowIndex) => {
      const displayRow = isFlipped ? 7 - rowIndex : rowIndex;
      
      return (
        <view key={displayRow} className="flex flex-row flex-1">
          {row.map((_, colIndex) => {
            const displayCol = isFlipped ? 7 - colIndex : colIndex;
            const position = { row: displayRow, col: displayCol };
            const piece = gameState.board[displayRow][displayCol];
            const isSelected = selectedSquare && 
              selectedSquare.row === displayRow && 
              selectedSquare.col === displayCol;
            const isValidMove = validMoves.some(
              m => m.row === displayRow && m.col === displayCol
            );
            
            return (
              <Square
                key={displayCol}
                position={position}
                piece={piece}
                isSelected={isSelected}
                isValidMove={isValidMove}
                onPress={() => onSquarePress(position)}
              />
            );
          })}
        </view>
      );
    })}
  </view>
);
```

}
);

Board.displayName = ‘Board’;

// packages/senterej-ui/src/components/Square.tsx
interface SquareProps extends ViewProps {
position: Position;
piece: Piece | null;
isSelected?: boolean;
isValidMove?: boolean;
onPress: () => void;
}

export const Square = React.memo<SquareProps>(
({ position, piece, isSelected, isValidMove, onPress }) => {
// Traditional Senterej board is red with black lines
const bgColor = ‘bg-red-700’;

```
return (
  <view
    className={cn(
      'flex-1 items-center justify-center border border-gray-900',
      bgColor,
      isSelected && 'bg-yellow-400',
      isValidMove && 'bg-green-400 bg-opacity-50'
    )}
    onClick={onPress}
    data-slot="senterej-square"
  >
    {piece && <PieceView piece={piece} />}
    {isValidMove && !piece && (
      <view className="w-3 h-3 rounded-full bg-gray-600 opacity-50" />
    )}
  </view>
);
```

}
);

Square.displayName = ‘Square’;

// packages/senterej-ui/src/components/PieceView.tsx
const PIECE_SYMBOLS = {
negus: { green: ‘♔’, gold: ‘♚’ },
fers: { green: ‘♕’, gold: ‘♛’ },
saba: { green: ‘♗’, gold: ‘♝’ },
ferese: { green: ‘♘’, gold: ‘♞’ },
der: { green: ‘♖’, gold: ‘♜’ },
medeq: { green: ‘♙’, gold: ‘♟’ }
} as const;

interface PieceViewProps {
piece: Piece;
}

const PieceView: React.FC<PieceViewProps> = ({ piece }) => {
const symbol = PIECE_SYMBOLS[piece.type][piece.player];
const color = piece.player === ‘green’ ? ‘text-green-200’ : ‘text-yellow-600’;

return (
<text
className={cn(‘text-4xl select-none’, color)}
data-slot=“senterej-piece”
>
{symbol}
</text>
);
};

// packages/senterej-ui/src/components/GameInfo.tsx
import { Column, Row, Card, CardContent, CardHeader, CardTitle } from ‘@ariob/ui’;

interface GameInfoProps {
gameState: GameState;
localPlayer?: ‘green’ | ‘gold’;
opponentName?: string;
}

export const GameInfo: React.FC<GameInfoProps> = ({
gameState,
localPlayer,
opponentName = ‘Opponent’
}) => {
const phaseText = {
werera: ‘⚡ Werera Phase (Free Movement)’,
normal: ‘♟️ Normal Phase’,
ended: ‘🏁 Game Ended’
};

return (
<Column className="gap-3">
<Card>
<CardHeader>
<CardTitle>Game Status</CardTitle>
</CardHeader>
<CardContent>
<Column className="gap-2">
<Row className="justify-between">
<text className="text-sm text-muted-foreground">Phase:</text>
<text className="text-sm font-semibold">{phaseText[gameState.phase]}</text>
</Row>

```
        {gameState.phase === 'normal' && (
          <Row className="justify-between">
            <text className="text-sm text-muted-foreground">Turn:</text>
            <text className={cn(
              'text-sm font-semibold',
              gameState.currentPlayer === 'green' ? 'text-green-600' : 'text-yellow-600'
            )}>
              {gameState.currentPlayer === localPlayer ? 'Your Turn' : `${opponentName}'s Turn`}
            </text>
          </Row>
        )}
        
        {gameState.check && (
          <text className="text-sm font-bold text-red-600">
            {gameState.check === localPlayer ? 'You are in Check!' : 'Opponent in Check!'}
          </text>
        )}
        
        {gameState.winner && (
          <text className="text-lg font-bold text-center text-primary">
            {gameState.winner === localPlayer ? '🎉 You Won!' : `${opponentName} Won`}
          </text>
        )}
        
        <Row className="justify-between pt-2 border-t">
          <text className="text-xs text-muted-foreground">Total Moves:</text>
          <text className="text-xs">{gameState.moves.length}</text>
        </Row>
      </Column>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader>
      <CardTitle>Captured Pieces</CardTitle>
    </CardHeader>
    <CardContent>
      <Column className="gap-3">
        <view>
          <text className="text-xs text-muted-foreground mb-1">
            {localPlayer === 'green' ? 'Your Captures:' : "Opponent's Captures:"}
          </text>
          <Row className="flex-wrap gap-1">
            {gameState.capturedPieces.green.map((piece, i) => (
              <text key={i} className="text-xl">{PIECE_SYMBOLS[piece.type].gold}</text>
            ))}
          </Row>
        </view>
        
        <view>
          <text className="text-xs text-muted-foreground mb-1">
            {localPlayer === 'gold' ? 'Your Captures:' : "Opponent's Captures:"}
          </text>
          <Row className="flex-wrap gap-1">
            {gameState.capturedPieces.gold.map((piece, i) => (
              <text key={i} className="text-xl">{PIECE_SYMBOLS[piece.type].green}</text>
            ))}
          </Row>
        </view>
      </Column>
    </CardContent>
  </Card>
</Column>
```

);
};

// packages/senterej-ui/src/components/MoveHistory.tsx
import { Scrollable, List, ListItem } from ‘@ariob/ui’;

interface MoveHistoryProps {
moves: Move[];
localPlayer?: ‘green’ | ‘gold’;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, localPlayer }) => {
const formatPosition = (pos: Position) => {
const file = String.fromCharCode(97 + pos.col);
const rank = pos.row + 1;
return `${file}${rank}`;
};

const formatMove = (move: Move, index: number) => {
const piece = PIECE_SYMBOLS[move.piece.type][move.piece.player];
const from = formatPosition(move.from);
const to = formatPosition(move.to);
const capture = move.captured ? ‘x’ : ‘-’;
const player = move.player === localPlayer ? ‘You’ : ‘Opponent’;

```
return {
  title: `${index + 1}. ${piece} ${from}${capture}${to}`,
  subtitle: player,
  time: new Date(move.timestamp).toLocaleTimeString()
};
```

};

return (
<Card>
<CardHeader>
<CardTitle>Move History</CardTitle>
</CardHeader>
<CardContent className="p-0">
<Scrollable className="max-h-64">
<List>
{moves.length === 0 ? (
<ListItem title="No moves yet" subtitle="Game hasn't started" />
) : (
moves.map((move, i) => {
const formatted = formatMove(move, i);
return (
<ListItem
key={i}
title={formatted.title}
subtitle={`${formatted.subtitle} • ${formatted.time}`}
/>
);
})
)}
</List>
</Scrollable>
</CardContent>
</Card>
);
};

// packages/senterej-ui/src/index.ts
export { Board } from ‘./components/Board’;
export { Square } from ‘./components/Square’;
export { GameInfo } from ‘./components/GameInfo’;
export { MoveHistory } from ‘./components/MoveHistory’;