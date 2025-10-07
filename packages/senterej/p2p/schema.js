import { z } from 'zod';
import { ThingSchema } from '@ariob/core';
/**
 * Player Info Schema
 */
export const PlayerInfoSchema = z.object({
    id: z.string(),
    pub: z.string(),
    name: z.string(),
    joinedAt: z.number(),
});
/**
 * Game Session Schema
 * Extends Thing to use core infrastructure
 */
export const GameSessionSchema = ThingSchema.extend({
    schema: z.literal('senterej/session'),
    // Players
    greenPlayer: PlayerInfoSchema.optional(),
    goldPlayer: PlayerInfoSchema.optional(),
    // Game state stored as JSON string to avoid Gun.js serialization issues
    gameState: z.string(), // JSON.stringify(GameState)
    // Session metadata
    status: z.enum(['waiting', 'playing', 'ended']),
});
export function thingToSession(thing) {
    return {
        id: thing.id,
        createdAt: thing.createdAt,
        players: {
            green: thing.greenPlayer,
            gold: thing.goldPlayer,
        },
        state: JSON.parse(thing.gameState),
    };
}
export function sessionToThing(session, soul) {
    return {
        id: session.id,
        soul,
        schema: 'senterej/session',
        createdAt: session.createdAt,
        updatedAt: Date.now(),
        public: true,
        greenPlayer: session.players.green,
        goldPlayer: session.players.gold,
        gameState: JSON.stringify(session.state),
        status: session.players.green && session.players.gold ? 'playing' : 'waiting',
    };
}
