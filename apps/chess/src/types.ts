// Senterej (Ethiopian Chess) Type Definitions

export type PieceType = 'negus' | 'fers' | 'saba' | 'ferese' | 'der' | 'medeq';
export type Player = 'green' | 'gold';

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
  selectedSquare: Position | null;
  validMoves: Position[];
  capturedPieces: {
    green: Piece[];
    gold: Piece[];
  };
  check: Player | null;
  checkmate: boolean;
  winner: Player | null;
  lastMove: { from: Position; to: Position } | null;
}

// Helper type for piece images
export type PieceImageKey = {
  [K in PieceType]: {
    green: string;
    gold: string;
  };
};
