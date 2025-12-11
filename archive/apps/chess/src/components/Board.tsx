import * as React from '@lynx-js/react';
import { cn } from '@ariob/ui';
import type { GameState, Position } from '../types';
import { Square } from './Square';
import { positionsEqual } from '../engine';
import { useSettings } from '../store/settings';
import boardLayout from '../config/board.json';

interface BoardProps {
  gameState: GameState;
  onSquarePress: (position: Position) => void;
  className?: string;
}

interface CoordinatesConfig {
  enabled?: boolean;
  files?: string[];
  ranks?: string[];
  style?: {
    textClass?: string;
    mutedTextClass?: string;
  };
}

export const Board = React.forwardRef<any, BoardProps>(({
  gameState,
  onSquarePress,
  className,
}, ref) => {
  const boardRef = React.useRef<any>(null);

  // Expose ref to parent
  React.useImperativeHandle(ref, () => boardRef.current);

  const { showCoordinates } = useSettings((state) => ({
    showCoordinates: state.showCoordinates,
  }));

  const coordinatesConfig: CoordinatesConfig = (boardLayout as { coordinates?: CoordinatesConfig }).coordinates || {};
  const coordinatesEnabled = showCoordinates && coordinatesConfig.enabled !== false;
  const files = coordinatesConfig.files || ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = coordinatesConfig.ranks || ['8', '7', '6', '5', '4', '3', '2', '1'];
  const fileTextClass = coordinatesConfig.style?.textClass || 'text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground';
  const rankTextClass = coordinatesConfig.style?.mutedTextClass || 'text-[10px] font-medium text-muted-foreground';

  return (
    <view
      ref={boardRef}
      className={cn('relative h-full w-full', className)}
      data-component="board"
    >
      <view className="grid h-full w-full grid-cols-8 grid-rows-8">
        {gameState.board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const position: Position = { row: rowIndex, col: colIndex };
            const isSelected =
              gameState.selectedSquare !== null &&
              positionsEqual(position, gameState.selectedSquare);
            const isValidMove = gameState.validMoves.some((move) =>
              positionsEqual(move, position)
            );
            const rankLabel =
              coordinatesEnabled && colIndex === 0 ? ranks[rowIndex] : undefined;
            const fileLabel =
              coordinatesEnabled && rowIndex === gameState.board.length - 1
                ? files[colIndex]
                : undefined;

            return (
              <Square
                key={`${rowIndex}-${colIndex}`}
                position={position}
                piece={piece}
                isSelected={isSelected}
                isValidMove={isValidMove}
                onPress={() => onSquarePress(position)}
                lastMove={gameState.lastMove}
                rankLabel={rankLabel}
                fileLabel={fileLabel}
                rankClassName={rankTextClass}
                fileClassName={fileTextClass}
              />
            );
          })
        )}
      </view>
    </view>
  );
});
