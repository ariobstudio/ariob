// Multi-Variant Chess Type Definitions
// Supports: Senterej (Ethiopian Chess) and Standard International Chess

import { z } from '@ariob/core';

// Piece types for both variants
export type SenterejPieceType = 'negus' | 'fers' | 'saba' | 'ferese' | 'der' | 'medeq';
export type StandardPieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceType = SenterejPieceType | StandardPieceType;

// Variant identifier
export type ChessVariant = 'senterej' | 'standard';

export type Player = 'white' | 'black';

export interface Position {
  row: number; // 0-7
  col: number; // 0-7
}

export interface Piece {
  type: PieceType;
  player: Player;
  position: Position;
  hasMoved?: boolean; // Track for castling, etc.
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: Player;
  variant: ChessVariant; // Chess variant being played
  selectedSquare: Position | null;
  validMoves: Position[];
  capturedPieces: {
    white: Piece[];
    black: Piece[];
  };
  check: Player | null;
  checkmate: boolean;
  winner: Player | null;
  lastMove: { from: Position; to: Position } | null;
  fen?: string; // FEN notation for current position
  phase?: GamePhase; // Current game phase (werera or normal, werera is Senterej-only)
  moveCount?: number; // Number of moves made
}

// Helper type for piece images
export type PieceImageKey = {
  [K in PieceType]: {
    white: string;
    black: string;
  };
};

// ============================================================================
// Gun/Session Schemas
// ============================================================================

/**
 * Position schema for validation
 */
export const PositionSchema = z.object({
  row: z.number().min(0).max(7),
  col: z.number().min(0).max(7),
});

/**
 * Player schema
 */
export const PlayerSchema = z.enum(['white', 'black']);

/**
 * Move schema for Gun sync (FLATTENED for Gun compatibility)
 * Each move gets synced via Gun and processed in timestamp order
 *
 * Note: Gun doesn't handle nested objects well, so we flatten position data
 */
export const MoveSchema = z.object({
  // From position (flattened)
  fromRow: z.number().min(0).max(7),
  fromCol: z.number().min(0).max(7),
  // To position (flattened)
  toRow: z.number().min(0).max(7),
  toCol: z.number().min(0).max(7),
  // Move metadata
  player: PlayerSchema,
  timestamp: z.number(),
  captured: z.boolean(), // Did this move capture a piece?
  // Support both Senterej and Standard piece types
  pieceType: z.enum(['negus', 'fers', 'saba', 'ferese', 'der', 'medeq', 'pawn', 'rook', 'knight', 'bishop', 'queen', 'king']),
  // FEN snapshot after this move (for replay and analysis)
  fen: z.string().optional(),
});

export type Move = z.infer<typeof MoveSchema>;

/**
 * Game phase schema
 */
export const GamePhaseSchema = z.enum(['werera', 'normal']);

export type GamePhase = z.infer<typeof GamePhaseSchema>;

/**
 * Chess variant schema
 */
export const ChessVariantSchema = z.enum(['senterej', 'standard']);

/**
 * Session schema for Gun sync (FLATTENED for Gun compatibility)
 * Stored at: /senterej/sessions/{sessionId}
 *
 * Note: Gun doesn't handle nested objects well, so we flatten player data
 */
export const SessionSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  variant: ChessVariantSchema, // Required field, no default
  phase: GamePhaseSchema,
  // Player 1 (flattened)
  player1Pub: z.string(),
  player1Alias: z.string(),
  // Player 2 (optional, flattened)
  player2Pub: z.string().optional(),
  player2Alias: z.string().optional(),
  // Game state
  currentTurn: PlayerSchema.optional(),
  status: z.enum(['waiting', 'active', 'finished']).optional(),
  winner: PlayerSchema.optional(),
});

export type Session = z.infer<typeof SessionSchema>;

/**
 * Piece schema for Gun sync (supports both variants)
 */
export const PieceSchema = z.object({
  type: z.enum(['negus', 'fers', 'saba', 'ferese', 'der', 'medeq', 'pawn', 'rook', 'knight', 'bishop', 'queen', 'king']),
  player: PlayerSchema,
  position: PositionSchema,
  hasMoved: z.boolean().optional(),
});

/**
 * Board state schema for Gun sync
 * We sync the board as a simplified array of pieces
 */
export const BoardStateSchema = z.object({
  pieces: z.array(PieceSchema),
  lastUpdated: z.number(),
});
