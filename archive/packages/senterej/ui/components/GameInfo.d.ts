import * as React from '@lynx-js/react';
import type { GameState } from '@ariob/senterej/engine';
interface GameInfoProps {
    gameState: GameState;
    localPlayer?: 'green' | 'gold';
    opponentName?: string;
}
export declare const GameInfo: React.FC<GameInfoProps>;
export {};
