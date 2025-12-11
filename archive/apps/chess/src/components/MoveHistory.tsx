/**
 * Move History Component
 *
 * Displays chronological list of all moves in the game
 * - Shows from/to positions in algebraic notation
 * - Indicates captures, checks
 * - Scrollable list with move numbers
 * - Highlights Werera phase moves
 */

import * as React from '@lynx-js/react';
import { Column, Row, Badge, Icon, cn } from '@ariob/ui';
import type { Move } from '../types';

export interface MoveHistoryProps {
  moves: Move[];
  showPhaseIndicator?: boolean;
  maxHeight?: string;
}

/**
 * Convert position to algebraic notation (e.g., {row: 0, col: 0} -> "a8")
 */
function positionToAlgebraic(position: { row: number; col: number }): string {
  const file = String.fromCharCode(97 + position.col); // a-h
  const rank = 8 - position.row; // 8-1
  return `${file}${rank}`;
}

/**
 * Format piece type for display using standard chess notation
 * Senterej pieces mapped to their chess equivalents
 */
function formatPieceType(type: string): string {
  const pieceNames: Record<string, string> = {
    negus: 'K',   // King
    fers: 'Q',    // Minister/Queen
    saba: 'B',    // Elephant/Bishop
    ferese: 'N',  // Knight
    der: 'R',     // Rook
    medeq: '',    // Pawn (no symbol in standard notation)
  };
  return pieceNames[type] || type;
}

/**
 * Format a move for display
 */
function formatMove(move: Move, moveNumber: number): {
  number: string;
  notation: string;
  isCapture: boolean;
  isWerera: boolean;
} {
  const fromNotation = positionToAlgebraic({ row: move.fromRow, col: move.fromCol });
  const toNotation = positionToAlgebraic({ row: move.toRow, col: move.toCol });
  const pieceSymbol = formatPieceType(move.pieceType);
  const captureSymbol = move.captured ? 'x' : '-';

  // Format: "Ne2-e4" or "Me2xe4" for captures
  const notation = `${pieceSymbol}${fromNotation}${captureSymbol}${toNotation}`;

  // First 4 moves are Werera phase
  const isWerera = moveNumber <= 4;

  return {
    number: `${moveNumber}.`,
    notation,
    isCapture: move.captured || false,
    isWerera,
  };
}

/**
 * Move History Component
 */
export const MoveHistory: React.FC<MoveHistoryProps> = React.memo(({
  moves,
  showPhaseIndicator = true,
  maxHeight = '300px',
}) => {
  const scrollRef = React.useRef<any>(null);

  // Auto-scroll to bottom when new move is added
  React.useEffect(() => {
    if (scrollRef.current && moves.length > 0) {
      // Scroll to bottom
      // Note: LynxJS scroll-view doesn't support scrollTo yet
      // This would work in a web environment
      // scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length]);

  if (moves.length === 0) {
    return (
      <view
        className="flex items-center justify-center p-6 bg-muted rounded-lg"
        style={{ minHeight: '120px' }}
      >
        <Column className="items-center gap-2">
          <Icon name="list" size="lg" className="text-muted-foreground" />
          <text className="text-sm text-muted-foreground text-center">
            No moves yet
          </text>
          <text className="text-xs text-muted-foreground text-center">
            Moves will appear here as the game progresses
          </text>
        </Column>
      </view>
    );
  }

  return (
    <view className="rounded-lg border border-border bg-card">
      {/* Header */}
      <view className="px-4 py-3 border-b border-border">
        <Row className="items-center justify-between">
          <Row className="items-center gap-2">
            <Icon name="list" className="text-primary" />
            <text className="text-sm font-semibold">Move History</text>
          </Row>
          <Badge variant="outline">
            {moves.length} {moves.length === 1 ? 'move' : 'moves'}
          </Badge>
        </Row>
      </view>

      {/* Move List */}
      <scroll-view
        className="px-2 py-2"
        style={{ maxHeight }}
        scroll-orientation="vertical"
        enable-scroll={true}
        scroll-bar-enable={false}
        ref={scrollRef}
      >
        <Column className="gap-1">
          {moves.map((move, index) => {
            const moveNumber = index + 1;
            const formattedMove = formatMove(move, moveNumber);
            const player = move.player;

            return (
              <view
                key={`${move.timestamp}-${index}`}
                className={cn(
                  'px-3 py-2 rounded-md',
                  moveNumber === moves.length ? 'bg-accent/60' : ''
                )}
              >
                <Row className="items-center justify-between gap-2">
                  {/* Move Number & Notation */}
                  <Row className="items-center gap-2 flex-1">
                    <text className="text-xs font-mono text-muted-foreground" style={{ minWidth: '32px' }}>
                      {formattedMove.number}
                    </text>

                    <text
                      className={cn(
                        'text-sm font-mono',
                        formattedMove.isCapture && 'font-bold',
                        moveNumber === moves.length
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {formattedMove.notation}
                    </text>
                  </Row>

                  {/* Indicators */}
                  <Row className="items-center gap-1">
                    {/* Player indicator */}
                    <view
                      className={cn(
                        'w-3 h-3 rounded-full border',
                        player === 'white'
                          ? 'bg-foreground border-border'
                          : 'bg-muted-foreground border-muted-foreground'
                      )}
                    />

                    {/* Werera indicator */}
                    {showPhaseIndicator && formattedMove.isWerera && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        ⚡
                      </Badge>
                    )}

                    {/* Capture indicator */}
                    {formattedMove.isCapture && (
                      <Icon name="x" size="sm" className="text-destructive" />
                    )}
                  </Row>
                </Row>
              </view>
            );
          })}
        </Column>
      </scroll-view>

      {/* Footer (optional stats) */}
      <view className="px-4 py-2 border-t border-border bg-muted">
        <Row className="items-center justify-between text-xs text-muted-foreground">
          <text className="text-xs">
            White: {moves.filter((m) => m.player === 'white').length} moves
          </text>
          <text className="text-xs">
            Black: {moves.filter((m) => m.player === 'black').length} moves
          </text>
        </Row>
      </view>
    </view>
  );
});

MoveHistory.displayName = 'MoveHistory';
