import type { Position } from '@ariob/senterej/engine';
import type { GameSession } from '../schema';
export interface UseGameSessionOptions {
    sessionId?: string;
    playerName: string;
}
export interface UseGameSessionReturn {
    session: GameSession | null;
    loading: boolean;
    error: Error | null;
    localPlayer: 'green' | 'gold' | null;
    createGame: () => Promise<string | undefined>;
    joinGame: (sessionId: string) => Promise<void>;
    makeMove: (from: Position, to: Position) => Promise<void>;
    leaveGame: () => void;
}
/**
 * Hook for managing game sessions using core infrastructure
 */
export declare function useGameSession(options: UseGameSessionOptions): UseGameSessionReturn;
