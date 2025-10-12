import * as React from '@lynx-js/react';
import { cn } from '@ariob/ui';
import type { Position, Piece } from '@ariob/senterej/engine';
import { PieceView } from './PieceView';

interface SquareProps {
  position: Position;
  piece: Piece | null;
  isSelected?: boolean;
  isValidMove?: boolean;
  onTap: () => void;
}

export const Square = React.memo<SquareProps>(
  ({ piece, isSelected, isValidMove, onTap }) => {
    // Traditional Senterej board is red with black lines
    const bgColor = 'bg-red-700';

    return (
      <view
        className={cn(
          'flex-1 items-center justify-center border border-gray-900',
          bgColor,
          isSelected && 'bg-yellow-400',
          isValidMove && 'bg-green-400 bg-opacity-50'
        )}
        bindtap={onTap}
        data-slot="senterej-square"
      >
        {piece && <PieceView piece={piece} />}
        {isValidMove && !piece && (
          <view className="w-3 h-3 rounded-full bg-gray-600 opacity-50" />
        )}
      </view>
    );
  }
);

Square.displayName = 'Square';
