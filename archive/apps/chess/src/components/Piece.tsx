import * as React from '@lynx-js/react';
import type { Piece as PieceType } from '../types';
import { getPieceImage } from '../utils/pieceImages';

interface PieceProps {
  piece: PieceType;
}

export const Piece: React.FC<PieceProps> = ({ piece }) => {
  const imageSource = getPieceImage(piece.type, piece.player);

  return (
    <image
      src={imageSource}
      mode="aspectFit"
      style={{ width: '100%', height: '100%' }}
      data-piece-type={piece.type}
      data-player={piece.player}
    />
  );
};
