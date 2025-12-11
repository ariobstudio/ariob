import type { GameState, Position } from '@ariob/senterej/engine';
export interface GameSession {
    id: string;
    createdAt: number;
    players: {
        green?: PlayerInfo;
        gold?: PlayerInfo;
    };
    state: GameState;
    lastMoveAt?: number;
}
export interface PlayerInfo {
    id: string;
    pub: string;
    name: string;
    joinedAt: number;
}
export interface P2PGameConfig {
    gun: any;
    user: any;
    onGameUpdate: (session: GameSession) => void;
    onError: (error: Error) => void;
}
export { Position };
