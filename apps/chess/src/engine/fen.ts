/**
 * FEN (Forsyth–Edwards Notation) for Senterej
 *
 * Converts between board state and FEN string format.
 * Uses standard chess piece letters while preserving Senterej piece mapping:
 * - K/k = Negus (King)
 * - Q/q = Fers (Minister)
 * - B/b = Saba (Elephant)
 * - N/n = Ferese (Knight)
 * - R/r = Der (Rook)
 * - P/p = Medeq (Pawn)
 *
 * FEN Format: [board] [active_color] [phase] [move_count]
 * Example: "dedsefsnd/mmmmmmmm/8/8/8/8/MMMMMMMM/DEDSEFSND w werera 0"
 */

import type { PieceType, Player, Piece, GamePhase, GameState, ChessVariant } from '../types';

/**
 * Piece type to FEN character mapping (supports both variants)
 */
const PIECE_TO_FEN: Record<PieceType, string> = {
  // Senterej pieces
  negus: 'K',
  fers: 'Q',
  saba: 'B',
  ferese: 'N',
  der: 'R',
  medeq: 'P',
  // Standard chess pieces (same FEN notation)
  king: 'K',
  queen: 'Q',
  bishop: 'B',
  knight: 'N',
  rook: 'R',
  pawn: 'P',
};

/**
 * FEN character to piece type mapping for Senterej
 */
const FEN_TO_SENTEREJ: Record<string, PieceType> = {
  K: 'negus',
  Q: 'fers',
  B: 'saba',
  N: 'ferese',
  R: 'der',
  P: 'medeq',
  k: 'negus',
  q: 'fers',
  b: 'saba',
  n: 'ferese',
  r: 'der',
  p: 'medeq',
};

/**
 * FEN character to piece type mapping for Standard chess
 */
const FEN_TO_STANDARD: Record<string, PieceType> = {
  K: 'king',
  Q: 'queen',
  B: 'bishop',
  N: 'knight',
  R: 'rook',
  P: 'pawn',
  k: 'king',
  q: 'queen',
  b: 'bishop',
  n: 'knight',
  r: 'rook',
  p: 'pawn',
};

/**
 * Convert piece to FEN character
 */
function pieceToFEN(piece: Piece): string {
  const char = PIECE_TO_FEN[piece.type];
  return piece.player === 'white' ? char : char.toLowerCase();
}

/**
 * Convert FEN character to piece (variant-aware)
 */
function fenToPiece(char: string, row: number, col: number, variant: ChessVariant = 'senterej'): Piece | null {
  const upperChar = char.toUpperCase();
  const mapping = variant === 'standard' ? FEN_TO_STANDARD : FEN_TO_SENTEREJ;

  if (!(upperChar in mapping)) return null;

  const type = mapping[upperChar];
  const player: Player = char === upperChar ? 'white' : 'black';

  return {
    type,
    player,
    position: { row, col },
    hasMoved: false, // FEN doesn't track this
  };
}

/**
 * Convert board state to FEN string
 *
 * @param board - The game board (8x8 array)
 * @param activePlayer - Current player to move
 * @param phase - Current game phase (werera or normal)
 * @param moveCount - Number of moves made
 * @returns FEN string representation
 */
export function boardToFEN(
  board: (Piece | null)[][],
  activePlayer: Player,
  phase: GamePhase = 'normal',
  moveCount: number = 0
): string {
  const rows: string[] = [];

  // Process each rank (row) from top to bottom (0 to 7)
  for (let row = 0; row < 8; row++) {
    let rankStr = '';
    let emptyCount = 0;

    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];

      if (piece === null) {
        emptyCount++;
      } else {
        // Add accumulated empty squares
        if (emptyCount > 0) {
          rankStr += emptyCount.toString();
          emptyCount = 0;
        }
        // Add piece character
        rankStr += pieceToFEN(piece);
      }
    }

    // Add remaining empty squares
    if (emptyCount > 0) {
      rankStr += emptyCount.toString();
    }

    rows.push(rankStr);
  }

  // Join ranks with /
  const boardFEN = rows.join('/');

  // Active player: 'w' for white, 'b' for black
  const activeColor = activePlayer === 'white' ? 'w' : 'b';

  // Phase: 'werera' or 'normal'
  const phaseStr = phase === 'werera' ? 'werera' : 'normal';

  // Combine all parts
  return `${boardFEN} ${activeColor} ${phaseStr} ${moveCount}`;
}

/**
 * Parse FEN string to board state
 *
 * @param fen - FEN string to parse
 * @param variant - Chess variant ('senterej' or 'standard')
 * @returns Object containing board, active player, phase, and move count
 * @throws Error if FEN string is invalid
 */
export function fenToBoard(fen: string, variant: ChessVariant = 'senterej'): {
  board: (Piece | null)[][];
  activePlayer: Player;
  phase: GamePhase;
  moveCount: number;
} {
  const parts = fen.trim().split(/\s+/);

  if (parts.length < 2) {
    throw new Error('Invalid FEN: must have at least board and active player');
  }

  const [boardFEN, activeColor, phaseStr, moveCountStr] = parts;

  // Parse board
  const board: (Piece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const ranks = boardFEN.split('/');
  if (ranks.length !== 8) {
    throw new Error(`Invalid FEN: expected 8 ranks, got ${ranks.length}`);
  }

  for (let row = 0; row < 8; row++) {
    const rankStr = ranks[row];
    let col = 0;

    for (const char of rankStr) {
      if (col >= 8) {
        throw new Error(`Invalid FEN: rank ${row} has too many squares`);
      }

      // Check if it's a number (empty squares)
      if (/[1-8]/.test(char)) {
        const emptyCount = parseInt(char, 10);
        col += emptyCount;
      } else {
        // It's a piece
        const piece = fenToPiece(char, row, col, variant);
        if (!piece) {
          throw new Error(`Invalid FEN: unknown piece character '${char}'`);
        }
        board[row][col] = piece;
        col++;
      }
    }

    if (col !== 8) {
      throw new Error(`Invalid FEN: rank ${row} has ${col} squares instead of 8`);
    }
  }

  // Parse active player
  if (activeColor !== 'w' && activeColor !== 'b') {
    throw new Error(`Invalid FEN: active color must be 'w' or 'b', got '${activeColor}'`);
  }
  const activePlayer: Player = activeColor === 'w' ? 'white' : 'black';

  // Parse phase (default to 'normal' if not specified)
  const phase: GamePhase = phaseStr === 'werera' ? 'werera' : 'normal';

  // Parse move count (default to 0 if not specified)
  const moveCount = moveCountStr ? parseInt(moveCountStr, 10) : 0;

  return {
    board,
    activePlayer,
    phase,
    moveCount,
  };
}

/**
 * Get FEN for initial Senterej position
 */
export function getInitialFEN(): string {
  return 'defsesnd/mmmmmmmm/8/8/8/8/MMMMMMMM/DEFSESND w werera 0';
}

/**
 * Convert FEN to complete GameState
 * Creates a full game state with all necessary fields from FEN notation
 */
export function fenToGameState(fen: string, variant: ChessVariant = 'senterej'): GameState {
  const { board, activePlayer, phase, moveCount } = fenToBoard(fen, variant);

  // Count captured pieces by comparing to starting position
  const capturedPieces = {
    white: [] as Piece[],
    black: [] as Piece[],
  };

  // Create game state
  const gameState: GameState = {
    board,
    currentPlayer: activePlayer,
    variant,
    capturedPieces,
    selectedSquare: null,
    validMoves: [],
    check: null,
    checkmate: false,
    winner: null,
    lastMove: null,
    fen,
    phase,
    moveCount,
  };

  return gameState;
}

/**
 * Validate FEN string
 *
 * @param fen - FEN string to validate
 * @returns true if valid, error message if invalid
 */
export function validateFEN(fen: string): { valid: boolean; error?: string } {
  try {
    fenToBoard(fen);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get FEN snapshot from game state
 * Convenience function for extracting FEN from full game state
 */
export function getFENFromGameState(gameState: {
  board: (Piece | null)[][];
  currentPlayer: Player;
  phase?: GamePhase;
  moveCount?: number;
}): string {
  return boardToFEN(
    gameState.board,
    gameState.currentPlayer,
    gameState.phase || 'normal',
    gameState.moveCount || 0
  );
}

/**
 * Compare two FEN strings for equality (ignoring move count)
 */
export function compareFEN(fen1: string, fen2: string): boolean {
  const parts1 = fen1.trim().split(/\s+/);
  const parts2 = fen2.trim().split(/\s+/);

  // Compare board, active player, and phase (ignore move count)
  return (
    parts1[0] === parts2[0] && // board
    parts1[1] === parts2[1] && // active player
    (parts1[2] || 'normal') === (parts2[2] || 'normal') // phase
  );
}

/**
 * Get FEN for common starting positions
 */
export const STARTING_POSITIONS = {
  standard: 'defsesnd/mmmmmmmm/8/8/8/8/MMMMMMMM/DEFSESND w werera 0',
  midgame: 'de2esnd/1m1m2mm/2f3m1/8/3M4/2F3M1/MM1M2MM/DE2ESND w normal 8',
  endgame: '6nd/8/5m2/8/3M4/8/8/6ND w normal 24',
};
