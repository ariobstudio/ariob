// Piece Image Mapping - Maps Senterej pieces to conventional chess images

import type { PieceType, Player } from '../types';

// Import piece images
import kingWhite from '../assets/pieces/king-white.png';
import kingBlack from '../assets/pieces/king-black.png';
import queenWhite from '../assets/pieces/queen-white.png';
import queenBlack from '../assets/pieces/queen-black.png';
import bishopWhite from '../assets/pieces/bishop-white.png';
import bishopBlack from '../assets/pieces/bishop-black.png';
import knightWhite from '../assets/pieces/knight-white.png';
import knightBlack from '../assets/pieces/knight-black.png';
import rookWhite from '../assets/pieces/rook-white.png';
import rookBlack from '../assets/pieces/rook-black.png';
import pawnWhite from '../assets/pieces/pawn-white.png';
import pawnBlack from '../assets/pieces/pawn-black.png';

// Mapping: Senterej piece types to image files
// Convention: white = green player, black = gold player
export const PIECE_IMAGES: Record<PieceType, Record<Player, string>> = {
  negus: {
    // King
    green: kingWhite,
    gold: kingBlack,
  },
  fers: {
    // Minister/Vizier (uses queen image)
    green: queenWhite,
    gold: queenBlack,
  },
  saba: {
    // Elephant (uses bishop image)
    green: bishopWhite,
    gold: bishopBlack,
  },
  ferese: {
    // Knight
    green: knightWhite,
    gold: knightBlack,
  },
  der: {
    // Rook
    green: rookWhite,
    gold: rookBlack,
  },
  medeq: {
    // Pawn
    green: pawnWhite,
    gold: pawnBlack,
  },
};

// Helper function to get piece image
export function getPieceImage(type: PieceType, player: Player): string {
  return PIECE_IMAGES[type][player];
}
