import { z } from 'zod';
import { ThingSchema } from '@ariob/core';
import type { GameState } from '@ariob/senterej/engine';

/**
 * Player Info Schema
 */
export const PlayerInfoSchema = z.object({
  id: z.string(),
  pub: z.string(),
  name: z.string(),
  joinedAt: z.number(),
});

export type PlayerInfo = z.infer<typeof PlayerInfoSchema>;

/**
 * Game Session Schema
 * Extends Thing to use core infrastructure
 */
export const GameSessionSchema = ThingSchema.extend({
  schema: z.literal('senterej/session'),

  // Players stored as JSON strings to avoid Gun.js serialization issues
  greenPlayer: z.string().optional(), // JSON.stringify(PlayerInfo)
  goldPlayer: z.string().optional(), // JSON.stringify(PlayerInfo)

  // Game state stored as JSON string to avoid Gun.js serialization issues
  gameState: z.string(), // JSON.stringify(GameState)

  // Session metadata
  status: z.enum(['waiting', 'playing', 'ended']),
});

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

export function thingToSession(thing: GameSessionThing): GameSession {
  return {
    id: thing.id,
    createdAt: thing.createdAt,
    players: {
      green: thing.greenPlayer ? JSON.parse(thing.greenPlayer) : undefined,
      gold: thing.goldPlayer ? JSON.parse(thing.goldPlayer) : undefined,
    },
    state: JSON.parse(thing.gameState),
  };
}

export function sessionToThing(session: GameSession, soul: string): GameSessionThing {
  return {
    id: session.id,
    soul,
    schema: 'senterej/session',
    createdAt: session.createdAt,
    updatedAt: Date.now(),
    public: true,
    greenPlayer: session.players.green ? JSON.stringify(session.players.green) : undefined,
    goldPlayer: session.players.gold ? JSON.stringify(session.players.gold) : undefined,
    gameState: JSON.stringify(session.state),
    status: session.players.green && session.players.gold ? 'playing' : 'waiting',
  };
}
