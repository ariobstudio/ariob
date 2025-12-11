/**
 * Player Card Component
 *
 * Enhanced player information display showing:
 * - Player name and color
 * - Captured pieces with images
 * - Turn indicator
 * - Active/waiting status
 * - Optional timer (for future implementation)
 */

import * as React from '@lynx-js/react';
import { Row, Column, Icon, Badge, cn } from '@ariob/ui';
import type { Player, Piece, PieceType } from '../types';
import { getPieceImage } from '../utils/pieceImages';

export interface PlayerCardProps {
  playerName: string;
  player: Player;
  isCurrentTurn: boolean;
  isYou?: boolean;
  capturedPieces?: Piece[];
  isWerera?: boolean;
  canMove?: boolean;
  className?: string;
  variant?: 'default' | 'compact';
}

/**
 * Group captured pieces by type and count them
 */
function groupCapturedPieces(pieces: Piece[]): { type: PieceType; count: number }[] {
  const grouped = pieces.reduce((acc, piece) => {
    const existing = acc.find((g) => g.type === piece.type);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ type: piece.type, count: 1 });
    }
    return acc;
  }, [] as { type: PieceType; count: number }[]);

  // Sort by piece value (approximate)
  const pieceOrder: PieceType[] = ['negus', 'fers', 'der', 'saba', 'ferese', 'medeq'];
  return grouped.sort((a, b) => pieceOrder.indexOf(a.type) - pieceOrder.indexOf(b.type));
}

/**
 * Calculate material advantage
 */
function calculateMaterialValue(pieces: Piece[]): number {
  const pieceValues: Record<PieceType, number> = {
    // Senterej pieces
    negus: 0,    // King has no material value in this context
    fers: 9,     // Minister (Queen equivalent)
    der: 5,      // Rook
    saba: 3,     // Elephant (Bishop equivalent)
    ferese: 3,   // Knight
    medeq: 1,    // Pawn
    // Standard chess pieces (same values as equivalents)
    king: 0,     // King has no material value in this context
    queen: 9,    // Queen
    rook: 5,     // Rook
    bishop: 3,   // Bishop
    knight: 3,   // Knight
    pawn: 1,     // Pawn
  };

  return pieces.reduce((total, piece) => total + (pieceValues[piece.type] || 0), 0);
}

/**
 * Player Card Component
 */
export const PlayerCard: React.FC<PlayerCardProps> = React.memo((props) => {
  const {
    playerName,
    player,
    isCurrentTurn,
    isYou = false,
    capturedPieces = [],
    isWerera = false,
    canMove = false,
    className = '',
    variant = 'default',
  } = props;
  const groupedPieces = React.useMemo(
    () => groupCapturedPieces(capturedPieces),
    [capturedPieces]
  );

  const materialValue = React.useMemo(
    () => calculateMaterialValue(capturedPieces),
    [capturedPieces]
  );

  // Determine opponent color for piece images
  const opponentColor: Player = player === 'white' ? 'black' : 'white';

  const circleClasses = cn(
    'flex items-center justify-center rounded-full border-2',
    player === 'white'
      ? 'bg-card border-border text-foreground'
      : 'bg-foreground border-foreground text-background'
  );


  if (variant === 'compact') {
    return (
      <view
        className={cn(
          'rounded-2xl border transition-all p-4',
          isCurrentTurn
            ? 'border-primary bg-primary/10 shadow-lg'
            : 'border-border bg-card',
          className
        )}
      >
        <Column className="gap-3">
          <Row className="items-center gap-3">
            <view className={cn(circleClasses, 'w-9 h-9')}>
              <Icon
                name="user"
                size="sm"
                className={player === 'white' ? 'text-foreground' : 'text-background'}
              />
            </view>

            <Column className="flex-1 gap-1">
              <Row className="gap-2 items-center flex-wrap">
                <text className="text-sm font-semibold text-foreground">
                  {playerName}
                </text>
                {isYou && (
                  <Badge variant="outline" className="uppercase tracking-wide" style={{ fontSize: '10px' }}>
                    You
                  </Badge>
                )}
                {isWerera && (
                  <Badge variant="secondary" className="uppercase tracking-wide" style={{ fontSize: '10px' }}>
                    ⚡ Werera
                  </Badge>
                )}
              </Row>

              <Row className="gap-2 items-center flex-wrap">
                <text className="uppercase tracking-wide text-muted-foreground" style={{ fontSize: '10px' }}>
                  {player}
                </text>
                {isCurrentTurn && (
                  <Badge
                    variant={canMove ? 'success' : 'outline'}
                    className="uppercase tracking-wide"
                    style={{ fontSize: '10px' }}
                  >
                    {canMove ? 'Your move' : 'Thinking'}
                  </Badge>
                )}
              </Row>
            </Column>
          </Row>

          <Row className="items-center justify-between">
            <text className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: '10px' }}>
              Captured
            </text>
            <text className="text-xs font-medium text-muted-foreground">
              {materialValue} pts
            </text>
          </Row>

          <view className="min-h-8">
            {capturedPieces.length === 0 ? (
              <text className="text-xs text-muted-foreground">
                No pieces captured yet
              </text>
            ) : (
              <Row className="flex-wrap gap-2">
                {groupedPieces.map(({ type, count }) => (
                  <view key={type} className="relative">
                    <image
                      src={getPieceImage(type, opponentColor)}
                      style={{
                        width: '24px',
                        height: '24px',
                        opacity: 0.85,
                      }}
                    />
                    {count > 1 && (
                      <view
                        className="absolute -top-1 -right-1 rounded-full flex items-center justify-center bg-primary"
                        style={{
                          width: '16px',
                          height: '16px',
                        }}
                      >
                        <text
                          className="text-2xs font-bold text-primary-foreground"
                          style={{ fontSize: '9px' }}
                        >
                          {count}
                        </text>
                      </view>
                    )}
                  </view>
                ))}
              </Row>
            )}
          </view>
        </Column>
      </view>
    );
  }

  return (
    <view
      className={cn(
        'rounded-xl border-2 p-4 transition-all',
        isCurrentTurn
          ? 'border-primary bg-primary/10 shadow-lg'
          : 'border-border bg-card',
        className
      )}
    >
      <Column className="gap-3">
        {/* Player Info */}
        <Row className="items-center justify-between">
          <Row className="items-center gap-3 flex-1">
            {/* Player Color Indicator */}
            <view className={cn(circleClasses, 'w-10 h-10')}>
              <Icon
                name="user"
                size="sm"
                className={player === 'white' ? 'text-foreground' : 'text-background'}
              />
            </view>

            {/* Player Name */}
            <Column className="flex-1">
              <Row className="items-center gap-2">
          <text className="text-base font-bold text-foreground">
            {playerName}
          </text>
                {isYou && (
                  <Badge variant="default" className="text-xs">You</Badge>
                )}
              </Row>
              <text className="text-xs capitalize text-muted-foreground">
                {player}
              </text>
            </Column>
          </Row>

          {/* Status Indicators */}
          <Column className="items-end gap-1">
            {isCurrentTurn && (
              <Badge
                variant={canMove ? 'default' : 'outline'}
                className="text-xs"
              >
                {isWerera ? '⚡ Turn' : 'Your Turn'}
              </Badge>
            )}
            {isWerera && !isCurrentTurn && (
              <Badge variant="outline" className="text-xs">
                Werera
              </Badge>
            )}
          </Column>
        </Row>

        {/* Captured Pieces */}
        {capturedPieces.length > 0 && (
          <view>
            <text className="text-xs font-medium mb-2 text-muted-foreground">
              Captured ({materialValue} pts)
            </text>
            <Row className="flex-wrap gap-1">
              {groupedPieces.map(({ type, count }) => (
                    <view key={type} className="relative">
                      <image
                        src={getPieceImage(type, opponentColor)}
                        style={{
                          width: '24px',
                          height: '24px',
                          opacity: 0.7,
                        }}
                      />
                      {count > 1 && (
                        <view
                          className="absolute -top-1 -right-1 rounded-full flex items-center justify-center bg-primary"
                          style={{
                            width: '14px',
                            height: '14px',
                          }}
                        >
                          <text
                            className="text-xs font-bold text-primary-foreground"
                            style={{ fontSize: '9px' }}
                          >
                            {count}
                          </text>
                        </view>
                      )}
                </view>
              ))}
            </Row>
          </view>
        )}

        {capturedPieces.length === 0 && (
          <text className="text-xs text-muted-foreground">
            No pieces captured yet
          </text>
        )}
      </Column>
    </view>
  );
});

PlayerCard.displayName = 'PlayerCard';
