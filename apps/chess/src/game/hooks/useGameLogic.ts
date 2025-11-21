/**
 * useGameLogic Hook
 *
 * Processes synced moves from Gun and maintains game board state.
 * Applies moves in Gun's HAM timestamp order to ensure consistency.
 */

import { useMemo } from '@lynx-js/react';
import { createInitialBoard, makeMove as applyMove } from '../../engine';
import { boardToFEN } from '../../engine/fen';
import type { GameState, Move, Player, Position, GamePhase, ChessVariant } from '../../types';

export interface UseGameLogicOptions {
  processedMoves: Move[];
  myPlayer: Player | null;
  variant: ChessVariant;
}

export interface UseGameLogicReturn {
  gameState: GameState;
  getValidMoves: (from: Position) => Position[];
  isValidMove: (from: Position, to: Position) => boolean;
}

/**
 * Hook for processing moves and maintaining game state
 */
export function useGameLogic({
  processedMoves,
  myPlayer,
  variant,
}: UseGameLogicOptions): UseGameLogicReturn {
  /**
   * Compute current game state by replaying all moves
   * Memoized to avoid recomputation on every render
   */
  const gameState = useMemo((): GameState => {
    console.log('[GameLogic] Processing', processedMoves.length, 'moves for variant:', variant);

    // Start with initial board
    const initialBoard = createInitialBoard();
    // Determine initial phase based on variant
    const initialPhase: GamePhase = variant === 'senterej' ? 'werera' : 'normal';

    let state: GameState = {
      board: initialBoard,
      currentPlayer: 'white', // White always starts
      variant: variant,
      selectedSquare: null,
      validMoves: [],
      capturedPieces: {
        white: [],
        black: [],
      },
      check: null,
      checkmate: false,
      winner: null,
      lastMove: null,
      fen: boardToFEN(initialBoard, 'white', initialPhase, 0),
      phase: initialPhase,
      moveCount: 0,
    };

    // Apply each move in order
    for (const move of processedMoves) {
      // Convert flattened move back to Position objects
      const from: Position = { row: move.fromRow, col: move.fromCol };
      const to: Position = { row: move.toRow, col: move.toCol };

      const nextState = applyMove(state, from, to);
      if (nextState) {
        state = nextState;
      } else {
        console.warn('[GameLogic] Invalid move skipped:', move);
      }
    }

    // Count pieces on board for debugging
    let pieceCount = 0;
    for (const row of state.board) {
      for (const piece of row) {
        if (piece) pieceCount++;
      }
    }

    console.log('[GameLogic] Final state:', {
      currentPlayer: state.currentPlayer,
      check: state.check,
      checkmate: state.checkmate,
      pieceCount,
      boardSize: `${state.board.length}x${state.board[0]?.length || 0}`,
    });

    return state;
  }, [processedMoves, variant]);

  /**
   * Get valid moves for a piece at given position
   */
  const getValidMoves = (from: Position): Position[] => {
    'background only';

    const piece = gameState.board[from.row][from.col];
    if (!piece) return [];

    // Only show moves for own pieces
    if (myPlayer && piece.player !== myPlayer) return [];

    // Use engine to get possible moves
    const { getPossibleMoves } = require('../../engine');
    return getPossibleMoves(piece, gameState.board);
  };

  /**
   * Check if a move is valid
   */
  const isValidMove = (from: Position, to: Position): boolean => {
    'background only';

    const validMoves = getValidMoves(from);
    return validMoves.some(
      (move) => move.row === to.row && move.col === to.col
    );
  };

  return {
    gameState,
    getValidMoves,
    isValidMove,
  };
}
