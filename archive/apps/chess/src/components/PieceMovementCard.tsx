import * as React from '@lynx-js/react';
import { Column } from '@ariob/ui';
import type { PieceType, Position } from '../types';
import { MiniBoard } from './MiniBoard';

interface PieceMovementCardProps {
  pieceType: PieceType;
  name: string;
  description: string;
}

// Helper to generate movement patterns for each piece type
const getMovementPattern = (pieceType: PieceType): { moves: Position[]; position: Position } => {
  // Center the piece at row 2, col 2 for 5x5 board
  const position: Position = { row: 2, col: 2 };
  const moves: Position[] = [];
  const BOARD_SIZE = 5;

  switch (pieceType) {
    case 'negus': // King - 1 square any direction
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const row = position.row + dr;
          const col = position.col + dc;
          if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
            moves.push({ row, col });
          }
        }
      }
      break;

    case 'fers': // Minister - 1 square diagonally
      for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        const row = position.row + dr;
        const col = position.col + dc;
        if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
          moves.push({ row, col });
        }
      }
      break;

    case 'saba': // Elephant - jumps 2 squares diagonally
      for (const [dr, dc] of [[-2, -2], [-2, 2], [2, -2], [2, 2]]) {
        const row = position.row + dr;
        const col = position.col + dc;
        if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
          moves.push({ row, col });
        }
      }
      break;

    case 'ferese': // Knight - L-shape
      for (const [dr, dc] of [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ]) {
        const row = position.row + dr;
        const col = position.col + dc;
        if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
          moves.push({ row, col });
        }
      }
      break;

    case 'der': // Rook - horizontal and vertical lines
      // Show 2 squares in each direction for 5x5 board
      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        for (let i = 1; i <= 2; i++) {
          const row = position.row + dr * i;
          const col = position.col + dc * i;
          if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
            moves.push({ row, col });
          }
        }
      }
      break;

    case 'medeq': // Pawn - 1 forward (for green player going up)
      const direction = -1; // Showing green player's perspective
      const forward = { row: position.row + direction, col: position.col };
      if (forward.row >= 0 && forward.row < BOARD_SIZE) {
        moves.push(forward);
      }
      // Diagonal captures
      for (const dc of [-1, 1]) {
        const captureRow = position.row + direction;
        const captureCol = position.col + dc;
        if (captureRow >= 0 && captureRow < BOARD_SIZE && captureCol >= 0 && captureCol < BOARD_SIZE) {
          moves.push({ row: captureRow, col: captureCol });
        }
      }
      break;
  }

  return { moves, position };
};

export const PieceMovementCard: React.FC<PieceMovementCardProps> = React.memo(({
  pieceType,
  name,
  description,
}) => {
  const pattern = React.useMemo(() => getMovementPattern(pieceType), [pieceType]);

  return (
    <view
      className="flex-shrink-0 px-3"
      style={{ width: '100%' }}
    >
      <view className="rounded-2xl border border-border bg-card shadow-lg p-5">
        <Column className="gap-4">
          {/* Piece name */}
          <view>
            <text className="text-xl font-bold text-primary">
              {name}
            </text>
            <text className="text-sm mt-1 text-muted-foreground">
              {description}
            </text>
          </view>

          {/* Mini board showing movement */}
          <view className="rounded-xl overflow-hidden shadow-md">
            <MiniBoard
              pieceType={pieceType}
              validMoves={pattern.moves}
              piecePosition={pattern.position}
              player="white"
            />
          </view>

          {/* Legend */}
          <view className="rounded-lg p-3 bg-muted">
            <text className="text-xs text-muted-foreground text-center">
              Blue dots show possible moves
            </text>
          </view>
        </Column>
      </view>
    </view>
  );
});
