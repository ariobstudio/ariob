// packages/senterej-engine/src/types.ts
export type PieceType = ‘negus’ | ‘fers’ | ‘saba’ | ‘ferese’ | ‘der’ | ‘medeq’;
export type Player = ‘green’ | ‘gold’;
export type GamePhase = ‘werera’ | ‘normal’ | ‘ended’;

export interface Position {
row: number;
col: number;
}

export interface Piece {
type: PieceType;
player: Player;
position: Position;
hasMoved?: boolean;
}

export interface Move {
from: Position;
to: Position;
piece: Piece;
captured?: Piece;
timestamp: number;
player: Player;
}

export interface GameState {
board: (Piece | null)[][];
phase: GamePhase;
currentPlayer: Player;
moves: Move[];
capturedPieces: { green: Piece[]; gold: Piece[] };
winner?: Player;
check?: Player;
checkmate?: boolean;
}

// packages/senterej-engine/src/board.ts
export function createInitialBoard(): (Piece | null)[][] {
const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

// Green pieces (bottom, rows 0-1)
const greenBack: PieceType[] = [‘der’, ‘ferese’, ‘saba’, ‘fers’, ‘negus’, ‘saba’, ‘ferese’, ‘der’];
greenBack.forEach((type, col) => {
board[0][col] = { type, player: ‘green’, position: { row: 0, col } };
});
for (let col = 0; col < 8; col++) {
board[1][col] = { type: ‘medeq’, player: ‘green’, position: { row: 1, col } };
}

// Gold pieces (top, rows 6-7)
const goldBack: PieceType[] = [‘der’, ‘ferese’, ‘saba’, ‘negus’, ‘fers’, ‘saba’, ‘ferese’, ‘der’];
goldBack.forEach((type, col) => {
board[7][col] = { type, player: ‘gold’, position: { row: 7, col } };
});
for (let col = 0; col < 8; col++) {
board[6][col] = { type: ‘medeq’, player: ‘gold’, position: { row: 6, col } };
}

return board;
}

export function positionEquals(a: Position, b: Position): boolean {
return a.row === b.row && a.col === b.col;
}

export function isValidPosition(pos: Position): boolean {
return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

// packages/senterej-engine/src/moves.ts
export function getValidMoves(
piece: Piece,
board: (Piece | null)[][],
phase: GamePhase
): Position[] {
const moves: Position[] = [];
const { row, col } = piece.position;

switch (piece.type) {
case ‘negus’: // King - moves one square in any direction
for (let dr = -1; dr <= 1; dr++) {
for (let dc = -1; dc <= 1; dc++) {
if (dr === 0 && dc === 0) continue;
const pos = { row: row + dr, col: col + dc };
if (isValidPosition(pos)) {
const target = board[pos.row][pos.col];
if (!target || target.player !== piece.player) {
moves.push(pos);
}
}
}
}

```
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
      if (!isValidPosition(pos)) break;
      const target = board[pos.row][pos.col];
      if (target) {
        if (target.player !== piece.player) moves.push(pos);
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
```

}

return moves;
}

export function isInCheck(
player: Player,
board: (Piece | null)[][],
phase: GamePhase
): boolean {
// Find king position
let kingPos: Position | null = null;
for (let r = 0; r < 8; r++) {
for (let c = 0; c < 8; c++) {
const piece = board[r][c];
if (piece?.type === ‘negus’ && piece.player === player) {
kingPos = piece.position;
break;
}
}
if (kingPos) break;
}

if (!kingPos) return false;

// Check if any opponent piece can attack the king
const opponent = player === ‘green’ ? ‘gold’ : ‘green’;
for (let r = 0; r < 8; r++) {
for (let c = 0; c < 8; c++) {
const piece = board[r][c];
if (piece?.player === opponent) {
const moves = getValidMoves(piece, board, phase);
if (moves.some(m => positionEquals(m, kingPos!))) {
return true;
}
}
}
}

return false;
}

// packages/senterej-engine/src/game.ts
export function createGame(): GameState {
return {
board: createInitialBoard(),
phase: ‘werera’,
currentPlayer: ‘green’,
moves: [],
capturedPieces: { green: [], gold: [] }
};
}

export function makeMove(
state: GameState,
from: Position,
to: Position
): GameState | null {
const piece = state.board[from.row][from.col];
if (!piece) return null;

// In werera phase, players can move any of their pieces freely
// In normal phase, only the current player can move
if (state.phase === ‘normal’ && piece.player !== state.currentPlayer) {
return null;
}

const validMoves = getValidMoves(piece, state.board, state.phase);
if (!validMoves.some(m => positionEquals(m, to))) {
return null;
}

// Clone state
const newBoard = state.board.map(row => […row]);
const captured = newBoard[to.row][to.col];

// Handle castling
if (piece.type === ‘negus’ && Math.abs(to.col - from.col) === 2) {
const rookCol = to.col > from.col ? 7 : 0;
const newRookCol = to.col > from.col ? to.col - 1 : to.col + 1;
const rook = newBoard[from.row][rookCol];
if (rook) {
newBoard[from.row][newRookCol] = { …rook, position: { row: from.row, col: newRookCol }, hasMoved: true };
newBoard[from.row][rookCol] = null;
}
}

// Move piece
newBoard[to.row][to.col] = { …piece, position: to, hasMoved: true };
newBoard[from.row][from.col] = null;

const move: Move = {
from,
to,
piece,
captured: captured || undefined,
timestamp: Date.now(),
player: piece.player
};

// First capture ends werera phase
const newPhase = state.phase === ‘werera’ && captured ? ‘normal’ : state.phase;

const newState: GameState = {
…state,
board: newBoard,
phase: newPhase,
currentPlayer: newPhase === ‘normal’ ? (state.currentPlayer === ‘green’ ? ‘gold’ : ‘green’) : state.currentPlayer,
moves: […state.moves, move],
capturedPieces: captured
? {
…state.capturedPieces,
[captured.player]: […state.capturedPieces[captured.player], captured]
}
: state.capturedPieces,
check: undefined,
checkmate: false
};

// Check for check/checkmate (only in normal phase)
if (newPhase === ‘normal’) {
const opponent = piece.player === ‘green’ ? ‘gold’ : ‘green’;
if (isInCheck(opponent, newBoard, newPhase)) {
newState.check = opponent;

```
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
    if (hasLegalMove) break;
  }
  
  if (!hasLegalMove) {
    newState.checkmate = true;
    newState.winner = piece.player;
    newState.phase = 'ended';
  }
}
```

}

return newState;
}

// packages/senterej-engine/src/index.ts
export * from ‘./types’;
export * from ‘./board’;
export * from ‘./moves’;
export * from ‘./game’;