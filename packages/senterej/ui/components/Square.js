import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from '@lynx-js/react';
import { cn } from '@ariob/ui';
import { PieceView } from './PieceView';
export const Square = React.memo(({ piece, isSelected, isValidMove, onTap }) => {
    // Traditional Senterej board is red with black lines
    const bgColor = 'bg-red-700';
    return (_jsxs("view", { className: cn('flex-1 items-center justify-center border border-gray-900', bgColor, isSelected && 'bg-yellow-400', isValidMove && 'bg-green-400 bg-opacity-50'), bindtap: onTap, "data-slot": "senterej-square", children: [piece && _jsx(PieceView, { piece: piece }), isValidMove && !piece && (_jsx("view", { className: "w-3 h-3 rounded-full bg-gray-600 opacity-50" }))] }));
});
Square.displayName = 'Square';
