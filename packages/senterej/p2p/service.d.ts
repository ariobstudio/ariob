import { type GameSessionThing } from './schema';
/**
 * Game Session Service
 * Uses core thing service for Gun.js operations
 */
export declare const sessionService: import("@ariob/core").ThingService<{
    id: string;
    createdAt: number;
    soul: string;
    schema: "senterej/session";
    public: boolean;
    status: "ended" | "waiting" | "playing";
    gameState: string;
    updatedAt?: number | undefined;
    createdBy?: string | undefined;
    greenPlayer?: {
        id: string;
        pub: string;
        name: string;
        joinedAt: number;
    } | undefined;
    goldPlayer?: {
        id: string;
        pub: string;
        name: string;
        joinedAt: number;
    } | undefined;
}>;
/**
 * Create a new game session
 */
export declare function createSession(playerName: string, userId: string, gameState: any): Promise<GameSessionThing>;
/**
 * Join an existing game session
 */
export declare function joinSession(sessionId: string, playerName: string, userId: string): Promise<GameSessionThing>;
/**
 * Update game state
 */
export declare function updateGameState(sessionId: string, newState: any): Promise<GameSessionThing>;
