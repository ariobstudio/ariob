import { z } from 'zod';
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
 * Convert Gun data to GameSession
 */
export function gunDataToSession(data) {
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
export function sessionToGunData(session) {
    return {
        id: session.id,
        createdAt: session.createdAt,
        greenPlayer: session.players.green ? JSON.stringify(session.players.green) : undefined,
        goldPlayer: session.players.gold ? JSON.stringify(session.players.gold) : undefined,
        gameState: JSON.stringify(session.state),
        status: session.status || (session.players.green && session.players.gold ? 'playing' : 'waiting'),
    };
}
