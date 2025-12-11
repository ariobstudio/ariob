import * as React from '@lynx-js/react';
import type { Position, Piece as PieceType } from '../types';
import { Piece } from './Piece';
import { positionsEqual } from '../engine';
import { cn } from '@ariob/ui';
import { useSettings, BOARD_THEMES } from '../store/settings';

interface SquareProps {
  position: Position;
  piece: PieceType | null;
  isSelected: boolean;
  isValidMove: boolean;
  onPress: () => void;
  lastMove: { from: Position; to: Position } | null;
  rankLabel?: string;
  fileLabel?: string;
  rankClassName?: string;
  fileClassName?: string;
}

export const Square: React.FC<SquareProps> = ({
  position,
  piece,
  isSelected,
  isValidMove,
  onPress,
  lastMove,
  rankLabel,
  fileLabel,
  rankClassName,
  fileClassName,
}) => {
  const boardTheme = useSettings((state) => state.boardTheme);
  const themeColors = BOARD_THEMES[boardTheme];

  // Determine square color
  const isLight = (position.row + position.col) % 2 === 0;

  // Check if this square is part of the last move
  const isLastMoveFrom = lastMove && positionsEqual(position, lastMove.from);
  const isLastMoveTo = lastMove && positionsEqual(position, lastMove.to);
  const isPartOfLastMove = isLastMoveFrom || isLastMoveTo;

  // Build animation class for pieces - chess.com inspired smooth animations
  // Apply theme colors dynamically
  const lightColor = themeColors.lightSquare;
  const darkColor = themeColors.darkSquare;

  return (
    <view
      className={cn(
        'relative flex h-full w-full items-center justify-center',
        isLight ? 'bg-board-light' : 'bg-board-dark',
        isSelected && 'ring-2 ring-primary/60'
      )}
      style={{
        backgroundColor: isLight ? lightColor : darkColor,
      }}
      bindtap={onPress}
    >
      {isPartOfLastMove && (
        <view
          className="pointer-events-none absolute top-0 right-0 bottom-0 left-0 border-2 border-accent/50"
        />
      )}

      {rankLabel && (
        <text
          className={cn('pointer-events-none absolute left-1 top-1 text-[9px] font-semibold text-muted-foreground', rankClassName)}
        >
          {rankLabel}
        </text>
      )}

      {fileLabel && (
        <text
          className={cn('pointer-events-none absolute bottom-1 right-1 text-[9px] font-semibold text-muted-foreground', fileClassName)}
        >
          {fileLabel}
        </text>
      )}

      {isValidMove && !piece && (
        <view
          className="pointer-events-none rounded-full bg-primary/45"
          style={{
            width: '24%',
            height: '24%',
          }}
        />
      )}

      {isValidMove && piece && (
        <view
          style={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            bottom: '10%',
            left: '10%',
          }}
          className="pointer-events-none rounded-full border-2 border-primary/45"
        />
      )}

      {piece && (
        <view
          className="absolute flex items-center justify-center"
          style={{
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%',
            padding: '8%',
            pointerEvents: 'none',
          }}
        >
          <Piece piece={piece} />
        </view>
      )}
    </view>
  );
};
