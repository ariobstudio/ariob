import * as React from '@lynx-js/react';
import type { Move } from '@ariob/senterej/engine';
interface MoveHistoryProps {
    moves: Move[];
    localPlayer?: 'green' | 'gold';
}
export declare const MoveHistory: React.FC<MoveHistoryProps>;
export {};
