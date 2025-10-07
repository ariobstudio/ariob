import * as React from '@lynx-js/react';
import { type ViewProps } from '@lynx-js/types';
import { cn } from '@ariob/ui';
import type { GameState, Position } from '@ariob/senterej/engine';
import { Square } from './Square';

interface BoardProps extends ViewProps {
  gameState: GameState;
  selectedSquare?: Position;
  validMoves?: Position[];
  onSquarePress: (position: Position) => void;
  localPlayer?: 'green' | 'gold';
}

export const Board = React.forwardRef<React.ElementRef<'view'>, BoardProps>(
  ({ gameState, selectedSquare, validMoves = [], onSquarePress, localPlayer, className, ...props }, ref) => {
    const isFlipped = localPlayer === 'gold';

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
                    onTap={() => onSquarePress(position)}
                  />
                );
              })}
            </view>
          );
        })}
      </view>
    );
  }
);

Board.displayName = 'Board';
