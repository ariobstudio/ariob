// New core-based implementation
export { useGameSession } from './hooks/useGameSession';
export { thingToSession, sessionToThing } from './schema';
// Services
export { sessionService, createSession, joinSession, updateGameState } from './service';
// Store
export { useSessionStore } from './store';
// Legacy exports (deprecated)
export { useP2PGame } from './hooks/useP2PGame';
