import type { Piece, Position, Player, GamePhase } from './types';
export declare function getValidMoves(piece: Piece, board: (Piece | null)[][], phase: GamePhase): Position[];
export declare function isInCheck(player: Player, board: (Piece | null)[][], phase: GamePhase): boolean;
