import type { GameState, Position } from './types';
export declare function createGame(): GameState;
export declare function makeMove(state: GameState, from: Position, to: Position): GameState | null;
