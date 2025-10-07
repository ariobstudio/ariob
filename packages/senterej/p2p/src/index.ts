// New core-based implementation
export { useGameSession } from './hooks/useGameSession';
export type { UseGameSessionOptions, UseGameSessionReturn } from './hooks/useGameSession';

// Schema and types
export type { GameSession, PlayerInfo, GameSessionThing } from './schema';
export { thingToSession, sessionToThing } from './schema';

// Services
export { sessionService, createSession, joinSession, updateGameState } from './service';

// Store
export { useSessionStore } from './store';

// Legacy exports (deprecated)
export { useP2PGame } from './hooks/useP2PGame';
export type { UseP2PGameOptions } from './hooks/useP2PGame';
