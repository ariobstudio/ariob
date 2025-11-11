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

// Mapping: Both Senterej and Standard piece types to image files
// Convention: white images for white player, black images for black player
export const PIECE_IMAGES: Record<PieceType, Record<Player, string>> = {
  // Senterej pieces (Ethiopian chess)
  negus: {
    // King
    white: kingWhite,
    black: kingBlack,
  },
  fers: {
    // Minister/Vizier (uses queen image)
    white: queenWhite,
    black: queenBlack,
  },
  saba: {
    // Elephant (uses bishop image)
    white: bishopWhite,
    black: bishopBlack,
  },
  ferese: {
    // Knight
    white: knightWhite,
    black: knightBlack,
  },
  der: {
    // Rook
    white: rookWhite,
    black: rookBlack,
  },
  medeq: {
    // Pawn
    white: pawnWhite,
    black: pawnBlack,
  },
  // Standard chess pieces (International chess)
  king: {
    white: kingWhite,
    black: kingBlack,
  },
  queen: {
    white: queenWhite,
    black: queenBlack,
  },
  bishop: {
    white: bishopWhite,
    black: bishopBlack,
  },
  knight: {
    white: knightWhite,
    black: knightBlack,
  },
  rook: {
    white: rookWhite,
    black: rookBlack,
  },
  pawn: {
    white: pawnWhite,
    black: pawnBlack,
  },
};

// Helper function to get piece image
export function getPieceImage(type: PieceType, player: Player): string {
  return PIECE_IMAGES[type][player];
}
