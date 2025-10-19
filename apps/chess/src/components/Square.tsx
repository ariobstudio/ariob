import * as React from '@lynx-js/react';
import type { Position, Piece as PieceType } from '../types';
import { Piece } from './Piece';
import { positionsEqual } from '../engine';

interface SquareProps {
  position: Position;
  piece: PieceType | null;
  isSelected: boolean;
  isValidMove: boolean;
  onPress: () => void;
  lastMove: { from: Position; to: Position } | null;
}

export const Square: React.FC<SquareProps> = ({
  position,
  piece,
  isSelected,
  isValidMove,
  onPress,
  lastMove,
}) => {

  // Indigo theme checkerboard
  const isLight = (position.row + position.col) % 2 === 0;

  // Check if this square is part of the last move
  const isLastMoveFrom = lastMove && positionsEqual(position, lastMove.from);
  const isLastMoveTo = lastMove && positionsEqual(position, lastMove.to);
  const isPartOfLastMove = isLastMoveFrom || isLastMoveTo;

  // Build animation style for pieces - chess.com inspired smooth animations
  const pieceAnimationStyle = isLastMoveTo
    ? 'pieceMove 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)'
    : isSelected
    ? 'pieceSelect 0.18s cubic-bezier(0.4, 0.0, 0.2, 1)'
    : undefined;

  return (
    <view
      className="flex-1 aspect-square items-center justify-center relative"
      style={{
        backgroundColor: isLight ? '#c7d2fe' : '#818cf8', // indigo-200 / indigo-400
      }}
      bindtap={onPress}
    >
      {/* Last move highlight */}
      {isPartOfLastMove && (
        <view
          className="absolute top-0 left-0 right-0 bottom-0"
          style={{
            backgroundColor: 'rgba(165, 180, 252, 0.5)', // indigo-300 alpha
            animation: 'fadeIn 0.2s ease-out',
          }}
        />
      )}

      {/* Selected square highlight */}
      {isSelected && (
        <view
          className="absolute top-0 left-0 right-0 bottom-0"
          style={{
            backgroundColor: 'rgba(99, 102, 241, 0.35)', // indigo-500 alpha
            animation: 'fadeIn 0.15s ease-out',
          }}
        />
      )}

      {/* Piece */}
      {piece && (
        <view
          className="relative"
          style={{
            width: '88%',
            height: '88%',
            animation: pieceAnimationStyle,
            zIndex: 10,
            pointerEvents: 'none', // Let touch events pass through to square
          }}
        >
          <Piece piece={piece} />
        </view>
      )}

      {/* Valid move indicator - minimal dot with smooth fade */}
      {isValidMove && !piece && (
        <view
          className="rounded-full relative"
          style={{
            width: '22%',
            height: '22%',
            backgroundColor: 'rgba(79, 70, 229, 0.25)', // indigo-600 alpha
            zIndex: 5,
            animation: 'scaleIn 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
          }}
        />
      )}

      {/* Capture indicator - elegant ring with smooth fade */}
      {isValidMove && piece && (
        <view
          className="absolute rounded-full"
          style={{
            top: '5%',
            left: '5%',
            right: '5%',
            bottom: '5%',
            border: '3px solid rgba(79, 70, 229, 0.4)', // indigo-600 alpha
            zIndex: 5,
            animation: 'scaleIn 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
          }}
        />
      )}
    </view>
  );
};
