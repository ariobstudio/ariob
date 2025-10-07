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
 * Game Session Schema
 * Extends Thing to use core infrastructure
 */
export declare const GameSessionSchema: z.ZodObject<{
    id: z.ZodString;
    soul: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodOptional<z.ZodNumber>;
    public: z.ZodBoolean;
    createdBy: z.ZodOptional<z.ZodString>;
} & {
    schema: z.ZodLiteral<"senterej/session">;
    greenPlayer: z.ZodOptional<z.ZodObject<{
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
    }>>;
    goldPlayer: z.ZodOptional<z.ZodObject<{
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
    }>>;
    gameState: z.ZodString;
    status: z.ZodEnum<["waiting", "playing", "ended"]>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
export type GameSessionThing = z.infer<typeof GameSessionSchema>;
/**
 * Helper to convert GameSessionThing to GameSession for backwards compatibility
 */
export interface GameSession {
    id: string;
    createdAt: number;
    players: {
        green?: PlayerInfo;
        gold?: PlayerInfo;
    };
    state: GameState;
}
export declare function thingToSession(thing: GameSessionThing): GameSession;
export declare function sessionToThing(session: GameSession, soul: string): GameSessionThing;
