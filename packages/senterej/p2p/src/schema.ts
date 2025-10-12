import { z } from 'zod';
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
  greenPlayer?: string; // JSON.stringify(PlayerInfo)
  goldPlayer?: string; // JSON.stringify(PlayerInfo)
  gameState: string; // JSON.stringify(GameState)
  status: 'waiting' | 'playing' | 'ended';
}

/**
 * Convert Gun data to GameSession
 */
export function gunDataToSession(data: GameSessionGunData): GameSession {
  return {
    id: data.id,
    createdAt: data.createdAt,
    players: {
      green: data.greenPlayer ? JSON.parse(data.greenPlayer) : undefined,
      gold: data.goldPlayer ? JSON.parse(data.goldPlayer) : undefined,
    },
    state: JSON.parse(data.gameState),
    status: data.status,
  };
}

/**
 * Convert GameSession to Gun data
 */
export function sessionToGunData(session: GameSession): GameSessionGunData {
  return {
    id: session.id,
    createdAt: session.createdAt,
    greenPlayer: session.players.green ? JSON.stringify(session.players.green) : undefined,
    goldPlayer: session.players.gold ? JSON.stringify(session.players.gold) : undefined,
    gameState: JSON.stringify(session.state),
    status: session.status || (session.players.green && session.players.gold ? 'playing' : 'waiting'),
  };
}
