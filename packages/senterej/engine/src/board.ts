import type { Piece, PieceType, Position } from './types';

export function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  // Green pieces (bottom, rows 0-1)
  const greenBack: PieceType[] = ['der', 'ferese', 'saba', 'fers', 'negus', 'saba', 'ferese', 'der'];
  greenBack.forEach((type, col) => {
    board[0][col] = { type, player: 'green', position: { row: 0, col } };
  });
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'medeq', player: 'green', position: { row: 1, col } };
  }

  // Gold pieces (top, rows 6-7)
  const goldBack: PieceType[] = ['der', 'ferese', 'saba', 'negus', 'fers', 'saba', 'ferese', 'der'];
  goldBack.forEach((type, col) => {
    board[7][col] = { type, player: 'gold', position: { row: 7, col } };
  });
  for (let col = 0; col < 8; col++) {
    board[6][col] = { type: 'medeq', player: 'gold', position: { row: 6, col } };
  }

  return board;
}

export function positionEquals(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}
