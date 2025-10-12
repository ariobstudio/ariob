import * as React from '@lynx-js/react';
import { type ViewProps } from '@lynx-js/types';
import type { GameState, Position } from '@ariob/senterej/engine';
interface BoardProps extends ViewProps {
    gameState: GameState;
    selectedSquare?: Position;
    validMoves?: Position[];
    onSquarePress: (position: Position) => void;
    localPlayer?: 'green' | 'gold';
}
export declare const Board: React.ForwardRefExoticComponent<Omit<BoardProps, "ref"> & React.RefAttributes<import("@lynx-js/types").NodesRef>>;
export {};
