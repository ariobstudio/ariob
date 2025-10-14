import { z } from 'zod';
import type { GameState } from '@ariob/senterej/engine';
/**
 * Player Info Schema
 */
export declare const PlayerInfoSchema: z.ZodObject<{
    id: z.ZodString;
    pub: z.ZodString;
    name: z.ZodString;
    joinedAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    pub: string;
    name: string;
    joinedAt: number;
}, {
    id: string;
    pub: string;
    name: string;
    joinedAt: number;
}>;
export type PlayerInfo = z.infer<typeof PlayerInfoSchema>;
/**
 * Game Session
 * Represents a P2P game session in Gun
 */
export interface GameSession {
    id: string;
    createdAt: number;
    players: {
        green?: PlayerInfo;
        gold?: PlayerInfo;
    };
    state: GameState;
    status?: 'waiting' | 'playing' | 'ended';
}
/**
 * Game Session stored in Gun
 * Uses JSON strings to avoid Gun serialization issues
 */
export interface GameSessionGunData {
    id: string;
    createdAt: number;
    greenPlayer?: string;
    goldPlayer?: string;
    gameState: string;
    status: 'waiting' | 'playing' | 'ended';
}
/**
 * Convert Gun data to GameSession
 */
export declare function gunDataToSession(data: GameSessionGunData): GameSession;
/**
 * Convert GameSession to Gun data
 */
export declare function sessionToGunData(session: GameSession): GameSessionGunData;
