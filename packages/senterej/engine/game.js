import { createInitialBoard, positionEquals } from './board';
import { getValidMoves, isInCheck } from './moves';
export function createGame() {
    return {
        board: createInitialBoard(),
        phase: 'werera',
        currentPlayer: 'green',
        moves: [],
        capturedPieces: { green: [], gold: [] }
    };
}
export function makeMove(state, from, to) {
    const piece = state.board[from.row][from.col];
    if (!piece)
        return null;
    // In werera phase, players can move any of their pieces freely
    // In normal phase, only the current player can move
    if (state.phase === 'normal' && piece.player !== state.currentPlayer) {
        return null;
    }
    const validMoves = getValidMoves(piece, state.board, state.phase);
    if (!validMoves.some(m => positionEquals(m, to))) {
        return null;
    }
    // Clone state
    const newBoard = state.board.map(row => [...row]);
    const captured = newBoard[to.row][to.col];
    // Handle castling
    if (piece.type === 'negus' && Math.abs(to.col - from.col) === 2) {
        const rookCol = to.col > from.col ? 7 : 0;
        const newRookCol = to.col > from.col ? to.col - 1 : to.col + 1;
        const rook = newBoard[from.row][rookCol];
        if (rook) {
            newBoard[from.row][newRookCol] = { ...rook, position: { row: from.row, col: newRookCol }, hasMoved: true };
            newBoard[from.row][rookCol] = null;
        }
    }
    // Move piece
    newBoard[to.row][to.col] = { ...piece, position: to, hasMoved: true };
    newBoard[from.row][from.col] = null;
    const move = {
        from,
        to,
        piece,
        captured: captured || undefined,
        timestamp: Date.now(),
        player: piece.player
    };
    // First capture ends werera phase
    const newPhase = state.phase === 'werera' && captured ? 'normal' : state.phase;
    const newState = {
        ...state,
        board: newBoard,
        phase: newPhase,
        currentPlayer: newPhase === 'normal' ? (state.currentPlayer === 'green' ? 'gold' : 'green') : state.currentPlayer,
        moves: [...state.moves, move],
        capturedPieces: captured
            ? {
                ...state.capturedPieces,
                [captured.player]: [...state.capturedPieces[captured.player], captured]
            }
            : state.capturedPieces,
        check: undefined,
        checkmate: false
    };
    // Check for check/checkmate (only in normal phase)
    if (newPhase === 'normal') {
        const opponent = piece.player === 'green' ? 'gold' : 'green';
        if (isInCheck(opponent, newBoard, newPhase)) {
            newState.check = opponent;
            // Check if checkmate (opponent has no legal moves)
            let hasLegalMove = false;
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const p = newBoard[r][c];
                    if (p?.player === opponent) {
                        const moves = getValidMoves(p, newBoard, newPhase);
                        if (moves.length > 0) {
                            hasLegalMove = true;
                            break;
                        }
                    }
                }
                if (hasLegalMove)
                    break;
            }
            if (!hasLegalMove) {
                newState.checkmate = true;
                newState.winner = piece.player;
                newState.phase = 'ended';
            }
        }
    }
    return newState;
}
