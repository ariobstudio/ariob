import * as React from '@lynx-js/react';
import { Column, Row, Card, CardContent, CardHeader, CardTitle, Alert, AlertTitle, AlertDescription, cn } from '@ariob/ui';
import type { GameState } from '../types';

interface GameInfoProps {
  gameState: GameState;
}

export const GameInfo: React.FC<GameInfoProps> = ({ gameState }) => {
  const currentPlayerText = gameState.currentPlayer === 'green' ? 'Green' : 'Gold';
  const currentPlayerColor = gameState.currentPlayer === 'green' ? 'text-green-600' : 'text-yellow-600';

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
            {gameState.check === 'green' ? 'Green' : 'Gold'} King is in check!
          </AlertDescription>
        </Alert>
      )}

      {/* Checkmate Alert */}
      {gameState.checkmate && gameState.winner && (
        <Alert>
          <AlertTitle>Checkmate!</AlertTitle>
          <AlertDescription>
            {gameState.winner === 'green' ? 'Green' : 'Gold'} wins!
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
            {/* Green's Captures */}
            <view>
              <text className="text-sm text-muted-foreground mb-1">
                Green captured:
              </text>
              <Row className="flex-wrap gap-1">
                {gameState.capturedPieces.green.length === 0 ? (
                  <text className="text-xs text-muted-foreground">None</text>
                ) : (
                  gameState.capturedPieces.green.map((piece, i) => (
                    <text key={i} className="text-sm">
                      {piece.type}
                    </text>
                  ))
                )}
              </Row>
            </view>

            {/* Gold's Captures */}
            <view>
              <text className="text-sm text-muted-foreground mb-1">
                Gold captured:
              </text>
              <Row className="flex-wrap gap-1">
                {gameState.capturedPieces.gold.length === 0 ? (
                  <text className="text-xs text-muted-foreground">None</text>
                ) : (
                  gameState.capturedPieces.gold.map((piece, i) => (
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
