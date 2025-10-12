import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Column, Row, Card, CardContent, CardHeader, CardTitle, cn } from '@ariob/ui';
const PIECE_SYMBOLS = {
    negus: { green: '♔', gold: '♚' },
    fers: { green: '♕', gold: '♛' },
    saba: { green: '♗', gold: '♝' },
    ferese: { green: '♘', gold: '♞' },
    der: { green: '♖', gold: '♜' },
    medeq: { green: '♙', gold: '♟' }
};
export const GameInfo = ({ gameState, localPlayer, opponentName = 'Opponent' }) => {
    const phaseText = {
        werera: '⚡ Werera Phase (Free Movement)',
        normal: '♟️ Normal Phase',
        ended: '🏁 Game Ended'
    };
    return (_jsxs(Column, { className: "gap-3", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Game Status" }) }), _jsx(CardContent, { children: _jsxs(Column, { className: "gap-2", children: [_jsxs(Row, { className: "justify-between", children: [_jsx("text", { className: "text-sm text-muted-foreground", children: "Phase:" }), _jsx("text", { className: "text-sm font-semibold", children: phaseText[gameState.phase] })] }), gameState.phase === 'normal' && (_jsxs(Row, { className: "justify-between", children: [_jsx("text", { className: "text-sm text-muted-foreground", children: "Turn:" }), _jsx("text", { className: cn('text-sm font-semibold', gameState.currentPlayer === 'green' ? 'text-green-600' : 'text-yellow-600'), children: localPlayer
                                                ? (gameState.currentPlayer === localPlayer ? 'Your Turn' : `${opponentName}'s Turn`)
                                                : (gameState.currentPlayer === 'green' ? 'Green\'s Turn' : 'Gold\'s Turn') })] })), gameState.check && (_jsx("text", { className: "text-sm font-bold text-red-600", children: localPlayer
                                        ? (gameState.check === localPlayer ? 'You are in Check!' : 'Opponent in Check!')
                                        : `${gameState.check === 'green' ? 'Green' : 'Gold'} is in Check!` })), gameState.winner && (_jsx("text", { className: "text-lg font-bold text-center text-primary", children: localPlayer
                                        ? (gameState.winner === localPlayer ? '🎉 You Won!' : `${opponentName} Won`)
                                        : `${gameState.winner === 'green' ? 'Green' : 'Gold'} Won!` })), _jsxs(Row, { className: "justify-between pt-2 border-t", children: [_jsx("text", { className: "text-xs text-muted-foreground", children: "Total Moves:" }), _jsx("text", { className: "text-xs", children: gameState.moves.length })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Captured Pieces" }) }), _jsx(CardContent, { children: _jsxs(Column, { className: "gap-3", children: [_jsxs("view", { children: [_jsx("text", { className: "text-xs text-muted-foreground mb-1", children: localPlayer
                                                ? (localPlayer === 'green' ? 'Your Captures:' : "Opponent's Captures:")
                                                : "Green's Captures:" }), _jsx(Row, { className: "flex-wrap gap-1", children: gameState.capturedPieces.green.map((piece, i) => (_jsx("text", { className: "text-xl", children: PIECE_SYMBOLS[piece.type].gold }, i))) })] }), _jsxs("view", { children: [_jsx("text", { className: "text-xs text-muted-foreground mb-1", children: localPlayer
                                                ? (localPlayer === 'gold' ? 'Your Captures:' : "Opponent's Captures:")
                                                : "Gold's Captures:" }), _jsx(Row, { className: "flex-wrap gap-1", children: gameState.capturedPieces.gold.map((piece, i) => (_jsx("text", { className: "text-xl", children: PIECE_SYMBOLS[piece.type].green }, i))) })] })] }) })] })] }));
};
