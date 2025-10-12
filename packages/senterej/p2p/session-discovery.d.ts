import type { GameSession } from './types';
/**
 * Helper for discovering and listing available game sessions
 * UNIX: Single purpose - session discovery
 */
export declare class SessionDiscovery {
    private gun;
    constructor(gun: any);
    /**
     * List all active game sessions
     */
    listSessions(): Promise<GameSession[]>;
    /**
     * Watch for new sessions
     * Returns cleanup function (UNIX: provide tools to compose)
     */
    watchSessions(callback: (sessions: GameSession[]) => void): () => void;
}
