import { isValidPosition, positionEquals } from './board';
export function getValidMoves(piece, board, phase) {
    const moves = [];
    const { row, col } = piece.position;
    switch (piece.type) {
        case 'negus': // King - moves one square in any direction
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0)
                        continue;
                    const pos = { row: row + dr, col: col + dc };
                    if (isValidPosition(pos)) {
                        const target = board[pos.row][pos.col];
                        if (!target || target.player !== piece.player) {
                            moves.push(pos);
                        }
                    }
                }
            }
            // Special werera castling (only to the right)
            if (phase === 'werera' && !piece.hasMoved && col === 4) {
                const rightRook = board[row][7];
                if (rightRook?.type === 'der' && !rightRook.hasMoved) {
                    const canCastle = board[row][5] === null && board[row][6] === null;
                    if (canCastle) {
                        moves.push({ row, col: col + 2 });
                    }
                }
            }
            break;
        case 'fers': // Minister - moves one square diagonally
            for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
                const pos = { row: row + dr, col: col + dc };
                if (isValidPosition(pos)) {
                    const target = board[pos.row][pos.col];
                    if (!target || target.player !== piece.player) {
                        moves.push(pos);
                    }
                }
            }
            break;
        case 'saba': // Elephant - jumps exactly 2 squares diagonally
            for (const [dr, dc] of [[-2, -2], [-2, 2], [2, -2], [2, 2]]) {
                const pos = { row: row + dr, col: col + dc };
                if (isValidPosition(pos)) {
                    const target = board[pos.row][pos.col];
                    if (!target || target.player !== piece.player) {
                        moves.push(pos);
                    }
                }
            }
            break;
        case 'ferese': // Knight - standard L-shape
            for (const [dr, dc] of [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ]) {
                const pos = { row: row + dr, col: col + dc };
                if (isValidPosition(pos)) {
                    const target = board[pos.row][pos.col];
                    if (!target || target.player !== piece.player) {
                        moves.push(pos);
                    }
                }
            }
            break;
        case 'der': // Rook - horizontal and vertical lines
            for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                for (let i = 1; i < 8; i++) {
                    const pos = { row: row + dr * i, col: col + dc * i };
                    if (!isValidPosition(pos))
                        break;
                    const target = board[pos.row][pos.col];
                    if (target) {
                        if (target.player !== piece.player)
                            moves.push(pos);
                        break;
                    }
                    moves.push(pos);
                }
            }
            break;
        case 'medeq': // Pawn - forward one square only (no double move)
            const direction = piece.player === 'green' ? 1 : -1;
            const forward = { row: row + direction, col };
            // Forward move
            if (isValidPosition(forward) && !board[forward.row][forward.col]) {
                moves.push(forward);
            }
            // Diagonal captures
            for (const dc of [-1, 1]) {
                const capturePos = { row: row + direction, col: col + dc };
                if (isValidPosition(capturePos)) {
                    const target = board[capturePos.row][capturePos.col];
                    if (target && target.player !== piece.player) {
                        moves.push(capturePos);
                    }
                }
            }
            break;
    }
    return moves;
}
export function isInCheck(player, board, phase) {
    // Find king position
    let kingPos = null;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece?.type === 'negus' && piece.player === player) {
                kingPos = piece.position;
                break;
            }
        }
        if (kingPos)
            break;
    }
    if (!kingPos)
        return false;
    // Check if any opponent piece can attack the king
    const opponent = player === 'green' ? 'gold' : 'green';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece?.player === opponent) {
                const moves = getValidMoves(piece, board, phase);
                if (moves.some(m => positionEquals(m, kingPos))) {
                    return true;
                }
            }
        }
    }
    return false;
}
