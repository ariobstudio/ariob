/**
 * Chess Engine
 *
 * Modular chess engine supporting multiple variants.
 * Exports the registered variants and game logic utilities.
 */

import { registerVariant } from '../types/variant';
import { SenterejVariant } from './rules/senterej';
import type { PieceType, SenterejPieceType, StandardPieceType } from '../types';

// Register all variants
registerVariant(SenterejVariant);

// Re-export variant system
export * from '../types/variant';
export { SenterejVariant } from './rules/senterej';

// Re-export FEN utilities
export * from './fen';

/**
 * Normalize piece types from Senterej names to Standard names
 * This ensures compatibility when replaying old moves that use Senterej names
 */
export function normalizePieceType(pieceType: PieceType): StandardPieceType {
  const senterejToStandard: Record<SenterejPieceType, StandardPieceType> = {
    'medeq': 'pawn',      // Medeq → Pawn
    'der': 'rook',        // Der → Rook
    'ferese': 'knight',   // Ferese → Knight
    'saba': 'bishop',     // Saba → Bishop
    'fers': 'queen',      // Fers → Queen
    'negus': 'king',      // Negus → King
  };

  // If it's a Senterej piece type, normalize it
  if (pieceType in senterejToStandard) {
    return senterejToStandard[pieceType as SenterejPieceType];
  }

  // Otherwise it's already a Standard piece type
  return pieceType as StandardPieceType;
}
