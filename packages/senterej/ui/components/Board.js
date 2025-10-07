import { jsx as _jsx } from "react/jsx-runtime";
import * as React from '@lynx-js/react';
import { cn } from '@ariob/ui';
import { Square } from './Square';
export const Board = React.forwardRef(({ gameState, selectedSquare, validMoves = [], onSquarePress, localPlayer, className, ...props }, ref) => {
    const isFlipped = localPlayer === 'gold';
    return (_jsx("view", { ref: ref, className: cn('flex flex-col w-full aspect-square', className), "data-slot": "senterej-board", ...props, children: gameState.board.map((row, rowIndex) => {
            const displayRow = isFlipped ? 7 - rowIndex : rowIndex;
            return (_jsx("view", { className: "flex flex-row flex-1", children: row.map((_, colIndex) => {
                    const displayCol = isFlipped ? 7 - colIndex : colIndex;
                    const position = { row: displayRow, col: displayCol };
                    const piece = gameState.board[displayRow][displayCol];
                    const isSelected = selectedSquare &&
                        selectedSquare.row === displayRow &&
                        selectedSquare.col === displayCol;
                    const isValidMove = validMoves.some(m => m.row === displayRow && m.col === displayCol);
                    return (_jsx(Square, { position: position, piece: piece, isSelected: isSelected, isValidMove: isValidMove, onTap: () => onSquarePress(position) }, displayCol));
                }) }, displayRow));
        }) }));
});
Board.displayName = 'Board';
