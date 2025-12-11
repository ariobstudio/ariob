import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@ariob/ui';
const PIECE_SYMBOLS = {
    negus: { green: '♔', gold: '♚' },
    fers: { green: '♕', gold: '♛' },
    saba: { green: '♗', gold: '♝' },
    ferese: { green: '♘', gold: '♞' },
    der: { green: '♖', gold: '♜' },
    medeq: { green: '♙', gold: '♟' }
};
export const PieceView = ({ piece }) => {
    const symbol = PIECE_SYMBOLS[piece.type][piece.player];
    const color = piece.player === 'green' ? 'text-green-200' : 'text-yellow-600';
    return (_jsx("text", { className: cn('text-4xl select-none', color), "data-slot": "senterej-piece", children: symbol }));
};
