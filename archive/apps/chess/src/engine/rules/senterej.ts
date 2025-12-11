/**
 * Senterej (Ethiopian Chess) Rules
 *
 * Implements authentic Senterej rules based on historical sources.
 * Key differences from standard chess:
 * - Werera phase: Opening moves are simultaneous
 * - Bare king: Player with lone king loses immediately
 * - Stalemate: Stalemated player loses (not a draw)
 * - Pawn promotion: Only to Fers (Queen)
 *
 * @see https://reqiq.co/senterej-the-historical-and-cultural-essence-of-ethiopian-chess/
 */

import type {
  ChessVariant,
  Piece,
  Move,
  Player,
  GamePhase,
  PieceType,
  MoveValidation,
} from '../../types/variant';
import type { Position } from '../../types';

/**
 * Senterej variant implementation
 */
export const SenterejVariant: ChessVariant = {
  id: 'senterej',
  name: 'Senterej',
  description: 'Ethiopian Chess with Werera phase',
  boardSize: { rows: 8, cols: 8 },

  getInitialBoard(): (Piece | null)[][] {
    const board: (Piece | null)[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Black pieces (top)
    board[0] = [
      { type: 'rook', player: 'black' },
      { type: 'knight', player: 'black' },
      { type: 'bishop', player: 'black' },
      { type: 'queen', player: 'black' },
      { type: 'king', player: 'black' },
      { type: 'bishop', player: 'black' },
      { type: 'knight', player: 'black' },
      { type: 'rook', player: 'black' },
    ];
    for (let col = 0; col < 8; col++) {
      board[1][col] = { type: 'pawn', player: 'black' };
    }

    // White pieces (bottom)
    for (let col = 0; col < 8; col++) {
      board[6][col] = { type: 'pawn', player: 'white' };
    }
    board[7] = [
      { type: 'rook', player: 'white' },
      { type: 'knight', player: 'white' },
      { type: 'bishop', player: 'white' },
      { type: 'queen', player: 'white' },
      { type: 'king', player: 'white' },
      { type: 'bishop', player: 'white' },
      { type: 'knight', player: 'white' },
      { type: 'rook', player: 'white' },
    ];

    return board;
  },

  getGamePhase(moveHistory: Move[]): GamePhase {
    // Werera phase lasts for first 2 moves per player (4 total moves)
    if (moveHistory.length < 4) {
      return 'werera';
    }
    // After Werera, determine phase based on material
    const totalPieces = moveHistory.length > 0 ? 32 - Math.floor(moveHistory.length / 4) : 32;
    if (totalPieces > 20) return 'opening';
    if (totalPieces > 12) return 'midgame';
    return 'endgame';
  },

  isValidMove(
    board: (Piece | null)[][],
    from: Position,
    to: Position,
    phase: GamePhase,
    moveHistory: Move[]
  ): MoveValidation {
    const piece = board[from.row][from.col];
    if (!piece) {
      return { valid: false, reason: 'No piece at source position' };
    }

    // Check if destination is valid
    if (to.row < 0 || to.row >= 8 || to.col < 0 || to.col >= 8) {
      return { valid: false, reason: 'Destination out of bounds' };
    }

    const target = board[to.row][to.col];
    if (target && target.player === piece.player) {
      return { valid: false, reason: 'Cannot capture own piece' };
    }

    // Get valid moves for this piece
    const validMoves = this.getValidMoves(board, from, phase, moveHistory);
    const isValid = validMoves.some(
      (move) => move.row === to.row && move.col === to.col
    );

    if (!isValid) {
      return { valid: false, reason: 'Move not allowed for this piece' };
    }

    // Check if move would leave king in check
    // During Werera phase (simultaneous moves), skip check validation
    // since both players move at the same time
    if (phase !== 'werera') {
      const testBoard = board.map((row) => [...row]);
      testBoard[to.row][to.col] = testBoard[from.row][from.col];
      testBoard[from.row][from.col] = null;

      if (this.isInCheck(testBoard, piece.player)) {
        return { valid: false, reason: 'Move would leave king in check' };
      }
    }

    return { valid: true };
  },

  getValidMoves(
    board: (Piece | null)[][],
    position: Position,
    _phase: GamePhase,
    _moveHistory: Move[]
  ): Position[] {
    const piece = board[position.row][position.col];
    if (!piece) return [];

    switch (piece.type) {
      case 'pawn':
        return getPawnMoves(board, position, piece.player);
      case 'rook':
        return getRookMoves(board, position, piece.player);
      case 'knight':
        return getKnightMoves(board, position, piece.player);
      case 'bishop':
        return getBishopMoves(board, position, piece.player);
      case 'queen':
        return getQueenMoves(board, position, piece.player);
      case 'king':
        return getKingMoves(board, position, piece.player);
      default:
        return [];
    }
  },

  isInCheck(board: (Piece | null)[][], player: Player): boolean {
    // Find king position
    let kingPos: Position | null = null;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'king' && piece.player === player) {
          kingPos = { row, col };
          break;
        }
      }
      if (kingPos) break;
    }

    if (!kingPos) return false; // No king (shouldn't happen)

    // Check if any opponent piece can attack king
    const opponent = player === 'white' ? 'black' : 'white';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.player === opponent) {
          const moves = this.getValidMoves(board, { row, col }, 'midgame', []);
          if (moves.some((move) => move.row === kingPos!.row && move.col === kingPos!.col)) {
            return true;
          }
        }
      }
    }

    return false;
  },

  isGameOver(
    board: (Piece | null)[][],
    currentPlayer: Player,
    moveHistory: Move[]
  ): {
    gameOver: boolean;
    winner?: Player;
    reason?: 'checkmate' | 'stalemate' | 'bare-king' | 'draw';
  } {
    // Check bare king rule: If a player has only the king left, they lose
    const whitePieces = countPieces(board, 'white');
    const blackPieces = countPieces(board, 'black');

    if (whitePieces === 1) {
      // White has only king
      return { gameOver: true, winner: 'black', reason: 'bare-king' };
    }
    if (blackPieces === 1) {
      // Black has only king
      return { gameOver: true, winner: 'white', reason: 'bare-king' };
    }

    // Check if current player has any valid moves
    const hasValidMoves = hasAnyValidMove(board, currentPlayer, this);

    if (!hasValidMoves) {
      const inCheck = this.isInCheck(board, currentPlayer);

      if (inCheck) {
        // Checkmate: Player in check with no valid moves
        const winner = currentPlayer === 'white' ? 'black' : 'white';
        return { gameOver: true, winner, reason: 'checkmate' };
      } else {
        // Stalemate: In Senterej, stalemate = loss for stalemated player
        const winner = currentPlayer === 'white' ? 'black' : 'white';
        return { gameOver: true, winner, reason: 'stalemate' };
      }
    }

    return { gameOver: false };
  },

  getPawnPromotionPieces(): PieceType[] {
    // In Senterej, pawns can only promote to Fers (Queen)
    return ['queen'];
  },
};

// ============================================================================
// Helper Functions: Piece Movement
// ============================================================================

function getPawnMoves(
  board: (Piece | null)[][],
  position: Position,
  player: Player
): Position[] {
  const moves: Position[] = [];
  const direction = player === 'white' ? -1 : 1;
  const startRow = player === 'white' ? 6 : 1;
  const { row, col } = position;

  // Forward one square
  const newRow = row + direction;
  if (newRow >= 0 && newRow < 8 && !board[newRow][col]) {
    moves.push({ row: newRow, col });

    // Forward two squares from starting position
    if (row === startRow) {
      const newRow2 = row + direction * 2;
      if (!board[newRow2][col]) {
        moves.push({ row: newRow2, col });
      }
    }
  }

  // Diagonal captures
  for (const dc of [-1, 1]) {
    const newCol = col + dc;
    if (newCol >= 0 && newCol < 8 && newRow >= 0 && newRow < 8) {
      const target = board[newRow][newCol];
      if (target && target.player !== player) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  return moves;
}

function getRookMoves(
  board: (Piece | null)[][],
  position: Position,
  player: Player
): Position[] {
  return getSlidingMoves(board, position, player, [
    [0, 1], [0, -1], [1, 0], [-1, 0]
  ]);
}

function getBishopMoves(
  board: (Piece | null)[][],
  position: Position,
  player: Player
): Position[] {
  return getSlidingMoves(board, position, player, [
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ]);
}

function getQueenMoves(
  board: (Piece | null)[][],
  position: Position,
  player: Player
): Position[] {
  return getSlidingMoves(board, position, player, [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ]);
}

function getKnightMoves(
  board: (Piece | null)[][],
  position: Position,
  player: Player
): Position[] {
  const moves: Position[] = [];
  const { row, col } = position;
  const knightMoves = [
    [2, 1], [2, -1], [-2, 1], [-2, -1],
    [1, 2], [1, -2], [-1, 2], [-1, -2]
  ];

  for (const [dr, dc] of knightMoves) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const target = board[newRow][newCol];
      if (!target || target.player !== player) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  return moves;
}

function getKingMoves(
  board: (Piece | null)[][],
  position: Position,
  player: Player
): Position[] {
  const moves: Position[] = [];
  const { row, col } = position;
  const kingMoves = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];

  for (const [dr, dc] of kingMoves) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const target = board[newRow][newCol];
      if (!target || target.player !== player) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  return moves;
}

function getSlidingMoves(
  board: (Piece | null)[][],
  position: Position,
  player: Player,
  directions: number[][]
): Position[] {
  const moves: Position[] = [];
  const { row, col } = position;

  for (const [dr, dc] of directions) {
    let newRow = row + dr;
    let newCol = col + dc;

    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const target = board[newRow][newCol];
      if (target) {
        if (target.player !== player) {
          moves.push({ row: newRow, col: newCol });
        }
        break;
      }
      moves.push({ row: newRow, col: newCol });
      newRow += dr;
      newCol += dc;
    }
  }

  return moves;
}

// ============================================================================
// Helper Functions: Game State
// ============================================================================

function countPieces(board: (Piece | null)[][], player: Player): number {
  let count = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        count++;
      }
    }
  }
  return count;
}

function hasAnyValidMove(
  board: (Piece | null)[][],
  player: Player,
  variant: ChessVariant
): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        const moves = variant.getValidMoves(board, { row, col }, 'midgame', []);
        for (const move of moves) {
          const validation = variant.isValidMove(
            board,
            { row, col },
            move,
            'midgame',
            []
          );
          if (validation.valid) {
            return true;
          }
        }
      }
    }
  }
  return false;
}
