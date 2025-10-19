import * as React from '@lynx-js/react';
import { cn } from '@ariob/ui';
import type { GameState, Position } from '../types';
import { Square } from './Square';
import { positionsEqual } from '../engine';

interface BoardProps {
  gameState: GameState;
  onSquarePress: (position: Position) => void;
  className?: string;
}

export const Board = React.forwardRef<any, BoardProps>(({
  gameState,
  onSquarePress,
  className,
}, ref) => {
  const boardRef = React.useRef<any>(null);

  // Expose ref to parent
  React.useImperativeHandle(ref, () => boardRef.current);

  return (
    <view
      ref={boardRef}
      className={cn('w-full h-full flex flex-col', className)}
      data-component="board"
    >
      {/* Render 8 rows */}
      {gameState.board.map((row, rowIndex) => (
        <view key={rowIndex} className="flex flex-row flex-1 w-full">
          {/* Render 8 columns */}
          {row.map((piece, colIndex) => {
            const position: Position = { row: rowIndex, col: colIndex };
            const isSelected =
              gameState.selectedSquare !== null &&
              positionsEqual(position, gameState.selectedSquare);
            const isValidMove = gameState.validMoves.some((move) =>
              positionsEqual(move, position)
            );

            return (
              <Square
                key={`${rowIndex}-${colIndex}`}
                position={position}
                piece={piece}
                isSelected={isSelected}
                isValidMove={isValidMove}
                onPress={() => onSquarePress(position)}
                lastMove={gameState.lastMove}
              />
            );
          })}
        </view>
      ))}
    </view>
  );
});
