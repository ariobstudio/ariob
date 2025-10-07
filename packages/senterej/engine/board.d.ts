import type { Piece, Position } from './types';
export declare function createInitialBoard(): (Piece | null)[][];
export declare function positionEquals(a: Position, b: Position): boolean;
export declare function isValidPosition(pos: Position): boolean;
