import * as React from '@lynx-js/react';
import { Column, Row, Card, CardContent, CardHeader, CardTitle, Alert, AlertTitle, AlertDescription, cn } from '@ariob/ui';
import type { GameState, Piece } from '../types';

interface GameInfoProps {
  gameState: GameState;
}

export const GameInfo: React.FC<GameInfoProps> = ({ gameState }) => {
  const currentPlayerText = gameState.currentPlayer === 'white' ? 'White' : 'Black';
  const currentPlayerColor = gameState.currentPlayer === 'white' ? 'text-gray-800' : 'text-gray-600';

  return (
    <Column className="gap-4">
      {/* Current Turn */}
      <Card>
        <CardHeader>
          <CardTitle>Current Turn</CardTitle>
        </CardHeader>
        <CardContent>
          <text className={cn('text-2xl font-bold', currentPlayerColor)}>
            {currentPlayerText}'s Turn
          </text>
        </CardContent>
      </Card>

      {/* Check Alert */}
      {gameState.check && !gameState.checkmate && (
        <Alert variant="destructive">
          <AlertTitle>Check!</AlertTitle>
          <AlertDescription>
            {gameState.check === 'white' ? 'White' : 'Black'} King is in check!
          </AlertDescription>
        </Alert>
      )}

      {/* Checkmate Alert */}
      {gameState.checkmate && gameState.winner && (
        <Alert>
          <AlertTitle>Checkmate!</AlertTitle>
          <AlertDescription>
            {gameState.winner === 'white' ? 'White' : 'Black'} wins!
          </AlertDescription>
        </Alert>
      )}

      {/* Captured Pieces */}
      <Card>
        <CardHeader>
          <CardTitle>Captured Pieces</CardTitle>
        </CardHeader>
        <CardContent>
          <Column className="gap-3">
            {/* White's Captures */}
            <view>
              <text className="text-sm text-muted-foreground mb-1">
                White captured:
              </text>
              <Row className="flex-wrap gap-1">
                {gameState.capturedPieces.white.length === 0 ? (
                  <text className="text-xs text-muted-foreground">None</text>
                ) : (
                  gameState.capturedPieces.white.map((piece: Piece, i: number) => (
                    <text key={i} className="text-sm">
                      {piece.type}
                    </text>
                  ))
                )}
              </Row>
            </view>

            {/* Black's Captures */}
            <view>
              <text className="text-sm text-muted-foreground mb-1">
                Black captured:
              </text>
              <Row className="flex-wrap gap-1">
                {gameState.capturedPieces.black.length === 0 ? (
                  <text className="text-xs text-muted-foreground">None</text>
                ) : (
                  gameState.capturedPieces.black.map((piece: Piece, i: number) => (
                    <text key={i} className="text-sm">
                      {piece.type}
                    </text>
                  ))
                )}
              </Row>
            </view>
          </Column>
        </CardContent>
      </Card>

      {/* Game Rules Info */}
      <Card>
        <CardHeader>
          <CardTitle>Senterej Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Column className="gap-1">
            <text className="text-xs text-muted-foreground">
              • Negus (King): Moves 1 square any direction
            </text>
            <text className="text-xs text-muted-foreground">
              • Fers (Minister): Moves 1 square diagonally
            </text>
            <text className="text-xs text-muted-foreground">
              • Saba (Elephant): Jumps exactly 2 squares diagonally
            </text>
            <text className="text-xs text-muted-foreground">
              • Ferese (Knight): Standard L-shape moves
            </text>
            <text className="text-xs text-muted-foreground">
              • Der (Rook): Any distance horizontally/vertically
            </text>
            <text className="text-xs text-muted-foreground">
              • Medeq (Pawn): Moves 1 forward, captures diagonally
            </text>
          </Column>
        </CardContent>
      </Card>
    </Column>
  );
};
