import * as React from '@lynx-js/react';
import type { Position, Piece } from '@ariob/senterej/engine';
interface SquareProps {
    position: Position;
    piece: Piece | null;
    isSelected?: boolean;
    isValidMove?: boolean;
    onTap: () => void;
}
export declare const Square: React.NamedExoticComponent<SquareProps>;
export {};
