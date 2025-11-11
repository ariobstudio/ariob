import * as React from '@lynx-js/react';
import type { PieceType, Player, Position } from '../types';
import { Piece } from './Piece';
import { cn } from '@ariob/ui';

interface MiniBoardProps {
  pieceType: PieceType;
  /** Array of positions showing valid moves for demonstration */
  validMoves: Position[];
  /** Position where the piece sits (usually center of board) */
  piecePosition: Position;
  player?: Player;
}

// Smaller 5x5 board for better visibility
const BOARD_SIZE = 5;
const ROWS = [0, 1, 2, 3, 4];
const COLS = [0, 1, 2, 3, 4];

export const MiniBoard: React.FC<MiniBoardProps> = React.memo(({
  pieceType,
  validMoves,
  piecePosition,
  player = 'white',
}) => {
  const isValidMove = React.useCallback((row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col);
  }, [validMoves]);

  const isPiecePosition = React.useCallback((row: number, col: number) => {
    return piecePosition.row === row && piecePosition.col === col;
  }, [piecePosition]);

  const isLightSquare = React.useCallback((row: number, col: number) => {
    return (row + col) % 2 === 0;
  }, []);

  const piece = React.useMemo(() => ({
    type: pieceType,
    player,
    position: piecePosition,
  }), [pieceType, player, piecePosition]);

  return (
    <view className="w-full aspect-square">
      <view className="w-full h-full flex flex-col">
        {ROWS.map((row) => (
          <view key={row} className="flex flex-row flex-1">
            {COLS.map((col) => {
              const isLight = isLightSquare(row, col);
              const isValid = isValidMove(row, col);
              const hasPiece = isPiecePosition(row, col);

              return (
                <view
                  key={`${row}-${col}`}
                  className={cn(
                    'flex-1 relative border border-border',
                    isLight ? 'bg-board-light' : 'bg-board-dark'
                  )}
                >
                  {/* Show piece at its position */}
                  {hasPiece && (
                    <view
                      className="absolute p-1"
                      style={{
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                    >
                      <Piece piece={piece} />
                    </view>
                  )}

                  {/* Show valid move indicator */}
                  {isValid && (
                    <view
                      className="absolute flex items-center justify-center"
                      style={{
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                    >
                      <view
                        className="rounded-full bg-primary"
                        style={{
                          width: '30%',
                          height: '30%',
                          opacity: 0.5,
                        }}
                      />
                    </view>
                  )}
                </view>
              );
            })}
          </view>
        ))}
      </view>
    </view>
  );
});
