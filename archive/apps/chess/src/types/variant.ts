/**
 * Chess Variant Type System
 *
 * Extensible architecture for supporting multiple chess variants.
 * Each variant defines its own rules, piece movement, and win conditions.
 */

import type { Position } from '../types';

/**
 * Piece types (extensible per variant)
 */
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

/**
 * Player colors
 */
export type Player = 'white' | 'black';

/**
 * Game phase (for variants with special phases like Werera)
 */
export type GamePhase = 'opening' | 'werera' | 'midgame' | 'endgame';

/**
 * Move validation result
 */
export interface MoveValidation {
  valid: boolean;
  reason?: string;
}

/**
 * Chess variant interface
 * Implement this for each variant (Senterej, Standard, Shatranj, etc.)
 */
export interface ChessVariant {
  /** Variant identifier */
  id: string;

  /** Display name */
  name: string;

  /** Short description */
  description: string;

  /** Board dimensions */
  boardSize: { rows: number; cols: number };

  /** Initial board setup */
  getInitialBoard(): (Piece | null)[][];

  /** Validate if a move is legal */
  isValidMove(
    board: (Piece | null)[][],
    from: Position,
    to: Position,
    phase: GamePhase,
    moveHistory: Move[]
  ): MoveValidation;

  /** Get all valid moves for a piece */
  getValidMoves(
    board: (Piece | null)[][],
    position: Position,
    phase: GamePhase,
    moveHistory: Move[]
  ): Position[];

  /** Check if game is over */
  isGameOver(
    board: (Piece | null)[][],
    currentPlayer: Player,
    moveHistory: Move[]
  ): {
    gameOver: boolean;
    winner?: Player;
    reason?: 'checkmate' | 'stalemate' | 'bare-king' | 'draw';
  };

  /** Check if king is in check */
  isInCheck(board: (Piece | null)[][], player: Player): boolean;

  /** Determine game phase (optional, for variants with phases) */
  getGamePhase?(moveHistory: Move[]): GamePhase;

  /** Handle pawn promotion */
  getPawnPromotionPieces?(): PieceType[];
}

/**
 * Piece representation
 */
export interface Piece {
  type: PieceType;
  player: Player;
}

/**
 * Move representation
 */
export interface Move {
  from: Position;
  to: Position;
  piece: PieceType;
  captured?: boolean;
  timestamp: number;
  player: Player;
}

/**
 * Game state
 */
export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: Player;
  phase: GamePhase;
  moveHistory: Move[];
  checkmate: boolean;
  stalemate: boolean;
  winner: Player | null;
}

/**
 * Variant registry
 * Add new variants here
 */
export const VARIANTS: Record<string, ChessVariant> = {};

/**
 * Register a variant
 */
export function registerVariant(variant: ChessVariant): void {
  VARIANTS[variant.id] = variant;
}

/**
 * Get a variant by ID
 */
export function getVariant(id: string): ChessVariant | undefined {
  return VARIANTS[id];
}

/**
 * Get all registered variants
 */
export function getAllVariants(): ChessVariant[] {
  return Object.values(VARIANTS);
}
