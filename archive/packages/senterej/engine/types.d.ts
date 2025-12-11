export type PieceType = 'negus' | 'fers' | 'saba' | 'ferese' | 'der' | 'medeq';
export type Player = 'green' | 'gold';
export type GamePhase = 'werera' | 'normal' | 'ended';
export interface Position {
    row: number;
    col: number;
}
export interface Piece {
    type: PieceType;
    player: Player;
    position: Position;
    hasMoved?: boolean;
}
export interface Move {
    from: Position;
    to: Position;
    piece: Piece;
    captured?: Piece;
    timestamp: number;
    player: Player;
}
export interface GameState {
    board: (Piece | null)[][];
    phase: GamePhase;
    currentPlayer: Player;
    moves: Move[];
    capturedPieces: {
        green: Piece[];
        gold: Piece[];
    };
    winner?: Player;
    check?: Player;
    checkmate?: boolean;
}
