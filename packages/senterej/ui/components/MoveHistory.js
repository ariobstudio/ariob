import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Scrollable, List, ListItem, Card, CardHeader, CardTitle, CardContent } from '@ariob/ui';
const PIECE_SYMBOLS = {
    negus: { green: '♔', gold: '♚' },
    fers: { green: '♕', gold: '♛' },
    saba: { green: '♗', gold: '♝' },
    ferese: { green: '♘', gold: '♞' },
    der: { green: '♖', gold: '♜' },
    medeq: { green: '♙', gold: '♟' }
};
export const MoveHistory = ({ moves, localPlayer }) => {
    const formatPosition = (pos) => {
        const file = String.fromCharCode(97 + pos.col);
        const rank = pos.row + 1;
        return `${file}${rank}`;
    };
    const formatMove = (move, index) => {
        const piece = PIECE_SYMBOLS[move.piece.type][move.piece.player];
        const from = formatPosition(move.from);
        const to = formatPosition(move.to);
        const capture = move.captured ? 'x' : '-';
        const player = move.player === localPlayer ? 'You' : 'Opponent';
        return {
            title: `${index + 1}. ${piece} ${from}${capture}${to}`,
            subtitle: player,
            time: new Date(move.timestamp).toLocaleTimeString()
        };
    };
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Move History" }) }), _jsx(CardContent, { className: "p-0", children: _jsx(Scrollable, { className: "max-h-64", children: _jsx(List, { children: moves.length === 0 ? (_jsx(ListItem, { title: "No moves yet", subtitle: "Game hasn't started" })) : (moves.map((move, i) => {
                            const formatted = formatMove(move, i);
                            return (_jsx(ListItem, { title: formatted.title, subtitle: `${formatted.subtitle} • ${formatted.time}` }, i));
                        })) }) }) })] }));
};
