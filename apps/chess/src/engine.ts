// Senterej Game Engine - Core Logic

import type { GameState, Piece, Position, Player, PieceType } from './types';

// Helper: Check if position is within board bounds
export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

// Helper: Check if two positions are equal
export function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

// Create initial Senterej board setup
export function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Senterej starting position (king is to the right of center)
  const backRow: PieceType[] = ['der', 'ferese', 'saba', 'fers', 'negus', 'saba', 'ferese', 'der'];

  // Gold pieces (top, rows 0-1)
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRow[col], player: 'gold', position: { row: 0, col } };
    board[1][col] = { type: 'medeq', player: 'gold', position: { row: 1, col } };
  }

  // Green pieces (bottom, rows 6-7)
  for (let col = 0; col < 8; col++) {
    board[6][col] = { type: 'medeq', player: 'green', position: { row: 6, col } };
    board[7][col] = { type: backRow[col], player: 'green', position: { row: 7, col } };
  }

  return board;
}

// Get all possible moves for a piece
export function getPossibleMoves(
  piece: Piece,
  board: (Piece | null)[][]
): Position[] {
  const moves: Position[] = [];
  const { row, col } = piece.position;

  switch (piece.type) {
    case 'negus': // King - moves one square in any direction
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const pos = { row: row + dr, col: col + dc };
          if (isValidPosition(pos)) {
            const target = board[pos.row][pos.col];
            if (!target || target.player !== piece.player) {
              moves.push(pos);
            }
          }
        }
      }
      break;

    case 'fers': // Minister/Vizier - moves one square diagonally only
      for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        const pos = { row: row + dr, col: col + dc };
        if (isValidPosition(pos)) {
          const target = board[pos.row][pos.col];
          if (!target || target.player !== piece.player) {
            moves.push(pos);
          }
        }
      }
      break;

    case 'saba': // Elephant - jumps exactly 2 squares diagonally
      for (const [dr, dc] of [[-2, -2], [-2, 2], [2, -2], [2, 2]]) {
        const pos = { row: row + dr, col: col + dc };
        if (isValidPosition(pos)) {
          const target = board[pos.row][pos.col];
          if (!target || target.player !== piece.player) {
            moves.push(pos);
          }
        }
      }
      break;

    case 'ferese': // Knight - standard L-shape
      for (const [dr, dc] of [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ]) {
        const pos = { row: row + dr, col: col + dc };
        if (isValidPosition(pos)) {
          const target = board[pos.row][pos.col];
          if (!target || target.player !== piece.player) {
            moves.push(pos);
          }
        }
      }
      break;

    case 'der': // Rook - horizontal and vertical lines
      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        for (let i = 1; i < 8; i++) {
          const pos = { row: row + dr * i, col: col + dc * i };
          if (!isValidPosition(pos)) break;
          const target = board[pos.row][pos.col];
          if (target) {
            if (target.player !== piece.player) moves.push(pos);
            break;
          }
          moves.push(pos);
        }
      }
      break;

    case 'medeq': // Pawn - forward one square, captures diagonally (no double move)
      const direction = piece.player === 'green' ? -1 : 1;
      const forward = { row: row + direction, col };

      // Forward move
      if (isValidPosition(forward) && !board[forward.row][forward.col]) {
        moves.push(forward);
      }

      // Diagonal captures
      for (const dc of [-1, 1]) {
        const capturePos = { row: row + direction, col: col + dc };
        if (isValidPosition(capturePos)) {
          const target = board[capturePos.row][capturePos.col];
          if (target && target.player !== piece.player) {
            moves.push(capturePos);
          }
        }
      }
      break;
  }

  return moves;
}

// Check if a player's king is in check
export function isInCheck(player: Player, board: (Piece | null)[][]): boolean {
  // Find king position
  let kingPos: Position | null = null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece?.type === 'negus' && piece.player === player) {
        kingPos = piece.position;
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return false;

  // Check if any opponent piece can attack the king
  const opponent = player === 'green' ? 'gold' : 'green';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece?.player === opponent) {
        const moves = getPossibleMoves(piece, board);
        if (moves.some(m => positionsEqual(m, kingPos!))) {
          return true;
        }
      }
    }
  }

  return false;
}

// Make a move and return new game state (or null if invalid)
export function makeMove(
  state: GameState,
  from: Position,
  to: Position
): GameState | null {
  const piece = state.board[from.row][from.col];
  if (!piece) return null;

  // Check if it's the current player's piece
  if (piece.player !== state.currentPlayer) return null;

  // Check if move is valid
  const validMoves = getPossibleMoves(piece, state.board);
  if (!validMoves.some(m => positionsEqual(m, to))) {
    return null;
  }

  // Clone board
  const newBoard = state.board.map(row => [...row]);
  const captured = newBoard[to.row][to.col];

  // Move piece
  newBoard[to.row][to.col] = { ...piece, position: to, hasMoved: true };
  newBoard[from.row][from.col] = null;

  // Check if move puts own king in check (invalid)
  if (isInCheck(piece.player, newBoard)) {
    return null; // Illegal move
  }

  // Update captured pieces
  const newCapturedPieces = { ...state.capturedPieces };
  if (captured) {
    newCapturedPieces[piece.player] = [...newCapturedPieces[piece.player], captured];
  }

  // Switch turn
  const nextPlayer = piece.player === 'green' ? 'gold' : 'green';

  // Check if opponent is in check/checkmate
  const opponentInCheck = isInCheck(nextPlayer, newBoard);
  let checkmate = false;

  if (opponentInCheck) {
    // Check if opponent has any legal moves
    let hasLegalMove = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = newBoard[r][c];
        if (p?.player === nextPlayer) {
          const moves = getPossibleMoves(p, newBoard);
          for (const move of moves) {
            // Simulate move
            const testBoard = newBoard.map(row => [...row]);
            testBoard[move.row][move.col] = { ...p, position: move };
            testBoard[r][c] = null;
            if (!isInCheck(nextPlayer, testBoard)) {
              hasLegalMove = true;
              break;
            }
          }
          if (hasLegalMove) break;
        }
      }
      if (hasLegalMove) break;
    }
    checkmate = !hasLegalMove;
  }

  return {
    ...state,
    board: newBoard,
    currentPlayer: nextPlayer,
    selectedSquare: null,
    validMoves: [],
    capturedPieces: newCapturedPieces,
    check: opponentInCheck ? nextPlayer : null,
    checkmate,
    winner: checkmate ? piece.player : null,
    lastMove: { from, to },
  };
}

// Create initial game state
export function createGame(): GameState {
  return {
    board: createInitialBoard(),
    currentPlayer: 'green',
    selectedSquare: null,
    validMoves: [],
    capturedPieces: { green: [], gold: [] },
    check: null,
    checkmate: false,
    winner: null,
    lastMove: null,
  };
}
