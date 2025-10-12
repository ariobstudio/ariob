import { make, createSoul } from '@ariob/core';
import { GameSessionSchema } from './schema';
/**
 * Game Session Service
 * Uses core thing service for Gun.js operations
 */
export const sessionService = make(GameSessionSchema, 'senterej/sessions');
/**
 * Create a new game session
 */
export async function createSession(playerName, userId, gameState) {
    console.log('----[service.ts][createSession called][Starting session creation][for Gun persistence]');
    console.log('----[service.ts][Parameters received][Function inputs][for]', { playerName, userId, gameState });
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    console.log('----[service.ts][Session ID generated][Unique session identifier][for]', sessionId);
    const soul = createSoul('senterej/sessions', sessionId);
    console.log('----[service.ts][Soul created][Gun path for session][for]', soul);
    const session = {
        id: sessionId,
        soul,
        schema: 'senterej/session',
        createdAt: Date.now(),
        public: true,
        greenPlayer: {
            id: userId,
            pub: userId,
            name: playerName,
            joinedAt: Date.now(),
        },
        gameState: JSON.stringify(gameState),
        status: 'waiting',
    };
    console.log('----[service.ts][Session object built][Complete session data structure][for]', session);
    console.log('----[service.ts][Calling sessionService.create][About to persist to Gun][for database storage]');
    const result = await sessionService.create(session);
    console.log('----[service.ts][sessionService.create returned][Result from Gun operation][for]', result);
    if (result.isErr()) {
        console.error('----[service.ts][Error result][Service returned error][for debugging]', result.error);
        throw new Error(result.error.message);
    }
    console.log('----[service.ts][Success][Session created successfully][for]', result.value);
    return result.value;
}
/**
 * Join an existing game session
 */
export async function joinSession(sessionId, playerName, userId) {
    const result = await sessionService.get(sessionId);
    if (result.isErr()) {
        throw new Error(result.error.message);
    }
    const session = result.value;
    if (!session) {
        throw new Error('Session not found');
    }
    if (session.goldPlayer) {
        throw new Error('Game is full');
    }
    const updatedSession = {
        ...session,
        goldPlayer: {
            id: userId,
            pub: userId,
            name: playerName,
            joinedAt: Date.now(),
        },
        status: 'playing',
        updatedAt: Date.now(),
    };
    const updateResult = await sessionService.update(sessionId, updatedSession);
    if (updateResult.isErr()) {
        throw new Error(updateResult.error.message);
    }
    if (!updateResult.value) {
        throw new Error('Failed to update session');
    }
    return updateResult.value;
}
/**
 * Update game state
 */
export async function updateGameState(sessionId, newState) {
    const result = await sessionService.get(sessionId);
    if (result.isErr()) {
        throw new Error(result.error.message);
    }
    const session = result.value;
    if (!session) {
        throw new Error('Session not found');
    }
    const updatedSession = {
        ...session,
        gameState: JSON.stringify(newState),
        updatedAt: Date.now(),
    };
    const updateResult = await sessionService.update(sessionId, updatedSession);
    if (updateResult.isErr()) {
        throw new Error(updateResult.error.message);
    }
    if (!updateResult.value) {
        throw new Error('Failed to update game state');
    }
    return updateResult.value;
}
