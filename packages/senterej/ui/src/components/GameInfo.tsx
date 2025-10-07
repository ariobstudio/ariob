import * as React from '@lynx-js/react';
import { Column, Row, Card, CardContent, CardHeader, CardTitle, cn } from '@ariob/ui';
import type { GameState } from '@ariob/senterej/engine';

const PIECE_SYMBOLS = {
  negus: { green: '♔', gold: '♚' },
  fers: { green: '♕', gold: '♛' },
  saba: { green: '♗', gold: '♝' },
  ferese: { green: '♘', gold: '♞' },
  der: { green: '♖', gold: '♜' },
  medeq: { green: '♙', gold: '♟' }
} as const;

interface GameInfoProps {
  gameState: GameState;
  localPlayer?: 'green' | 'gold';
  opponentName?: string;
}

export const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  localPlayer,
  opponentName = 'Opponent'
}) => {
  const phaseText = {
    werera: '⚡ Werera Phase (Free Movement)',
    normal: '♟️ Normal Phase',
    ended: '🏁 Game Ended'
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

            {gameState.phase === 'normal' && (
              <Row className="justify-between">
                <text className="text-sm text-muted-foreground">Turn:</text>
                <text className={cn(
                  'text-sm font-semibold',
                  gameState.currentPlayer === 'green' ? 'text-green-600' : 'text-yellow-600'
                )}>
                  {localPlayer
                    ? (gameState.currentPlayer === localPlayer ? 'Your Turn' : `${opponentName}'s Turn`)
                    : (gameState.currentPlayer === 'green' ? 'Green\'s Turn' : 'Gold\'s Turn')
                  }
                </text>
              </Row>
            )}

            {gameState.check && (
              <text className="text-sm font-bold text-red-600">
                {localPlayer
                  ? (gameState.check === localPlayer ? 'You are in Check!' : 'Opponent in Check!')
                  : `${gameState.check === 'green' ? 'Green' : 'Gold'} is in Check!`
                }
              </text>
            )}

            {gameState.winner && (
              <text className="text-lg font-bold text-center text-primary">
                {localPlayer
                  ? (gameState.winner === localPlayer ? '🎉 You Won!' : `${opponentName} Won`)
                  : `${gameState.winner === 'green' ? 'Green' : 'Gold'} Won!`
                }
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
                {localPlayer
                  ? (localPlayer === 'green' ? 'Your Captures:' : "Opponent's Captures:")
                  : "Green's Captures:"
                }
              </text>
              <Row className="flex-wrap gap-1">
                {gameState.capturedPieces.green.map((piece, i) => (
                  <text key={i} className="text-xl">{PIECE_SYMBOLS[piece.type].gold}</text>
                ))}
              </Row>
            </view>

            <view>
              <text className="text-xs text-muted-foreground mb-1">
                {localPlayer
                  ? (localPlayer === 'gold' ? 'Your Captures:' : "Opponent's Captures:")
                  : "Gold's Captures:"
                }
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
  );
};
