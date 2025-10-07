import * as React from '@lynx-js/react';
import { cn } from '@ariob/ui';
import type { Piece } from '@ariob/senterej/engine';

const PIECE_SYMBOLS = {
  negus: { green: '♔', gold: '♚' },
  fers: { green: '♕', gold: '♛' },
  saba: { green: '♗', gold: '♝' },
  ferese: { green: '♘', gold: '♞' },
  der: { green: '♖', gold: '♜' },
  medeq: { green: '♙', gold: '♟' }
} as const;

interface PieceViewProps {
  piece: Piece;
}

export const PieceView: React.FC<PieceViewProps> = ({ piece }) => {
  const symbol = PIECE_SYMBOLS[piece.type][piece.player];
  const color = piece.player === 'green' ? 'text-green-200' : 'text-yellow-600';

  return (
    <text
      className={cn('text-4xl select-none', color)}
      data-slot="senterej-piece"
    >
      {symbol}
    </text>
  );
};
