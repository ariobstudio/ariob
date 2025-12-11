// Core-based implementation
export { useGameSession } from './hooks/useGameSession';
export type { UseGameSessionOptions, UseGameSessionReturn } from './hooks/useGameSession';

// Schema and types
export type { GameSession, PlayerInfo, GameSessionGunData } from './schema';
export { gunDataToSession, sessionToGunData } from './schema';

// Legacy exports (deprecated, will be removed)
export { useP2PGame } from './hooks/useP2PGame';
export type { UseP2PGameOptions } from './hooks/useP2PGame';
