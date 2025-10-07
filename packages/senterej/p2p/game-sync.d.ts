import type { Player, Position } from '@ariob/senterej/engine';
import type { P2PGameConfig } from './types';
export declare class SenterejP2PSync {
    private gun;
    private user;
    private sessionRef;
    private onGameUpdate;
    private onError;
    private currentSessionId?;
    private localPlayer?;
    constructor(config: P2PGameConfig);
    /**
     * Create a new game session
     * UNIX: Do one thing well - create and return session ID
     */
    createSession(playerName: string): Promise<string>;
    /**
     * Join an existing game session
     * UNIX: Single responsibility - join and subscribe
     */
    joinSession(sessionId: string, playerName: string): Promise<void>;
    /**
     * Subscribe to real-time game updates
     * UNIX: Separate concerns - subscription logic isolated
     */
    private subscribeToSession;
    /**
     * Make a move and sync to peers
     * UNIX: Pipeline approach - validate, execute, sync
     */
    makeMove(from: Position, to: Position): Promise<void>;
    /**
     * Leave the current session
     * UNIX: Clean separation - unsubscribe and cleanup
     */
    leaveSession(): void;
    /**
     * Get local player color
     */
    getLocalPlayer(): Player | undefined;
    /**
     * Get current session ID
     */
    getSessionId(): string | undefined;
}
