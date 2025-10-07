import type { Position } from '@ariob/senterej/engine';
import type { GameSession } from '../types';
export interface UseP2PGameOptions {
    gun: any;
    user: any;
    sessionId?: string;
    playerName: string;
    autoJoin?: boolean;
}
export declare function useP2PGame(options: UseP2PGameOptions): {
    session: GameSession | null;
    error: Error | null;
    loading: boolean;
    localPlayer: import("@ariob/senterej/engine").Player | undefined;
    createGame: () => Promise<string | undefined>;
    joinGame: (sessionId: string) => Promise<void>;
    makeMove: (from: Position, to: Position) => Promise<void>;
    leaveGame: () => void;
};
