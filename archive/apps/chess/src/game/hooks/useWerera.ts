/**
 * useWerera Hook
 *
 * Manages the Werera (mobilization) phase where both players can move simultaneously.
 * Leverages Gun's HAM for automatic conflict resolution via timestamps.
 *
 * Key concept: In Werera phase, both players move without turn restrictions.
 * First capture ends Werera and transitions to normal turn-based play.
 */

import { useMemo, useCallback, useRef } from '@lynx-js/react';
import { authStore } from '@ariob/core';
import type { Session, Move, Player, Position, PieceType, GameState } from '../../types';

export interface UseWereraOptions {
  session: Session | null;
  moves: Move[];
  addMove: (move: Omit<Move, 'timestamp'>) => Promise<void>;
  updateSession: (updates: Partial<Session>) => Promise<void>;
  myRole: 'player1' | 'player2' | 'spectator' | 'none';
}

export interface UseWereraReturn {
  isWerera: boolean;
  canMove: boolean;
  makeMove: (from: Position, to: Position, captured: boolean, pieceType: PieceType) => Promise<void>;
  processedMoves: Move[];
  myPlayer: Player | null;
}

/**
 * Hook for managing Werera phase logic
 */
export function useWerera({
  session,
  moves,
  addMove,
  updateSession,
  myRole,
}: UseWereraOptions): UseWereraReturn {
  const user = authStore.getState().user;

  // Track last move to prevent duplicates (500ms debounce)
  const lastMoveRef = useRef<{
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
    timestamp: number;
  } | null>(null);

  // Determine if currently in Werera phase
  const isWerera = session?.phase === 'werera';

  // Determine player color based on role
  const myPlayer: Player | null = useMemo(() => {
    if (!user || !session) return null;
    if (myRole === 'player1') return 'white'; // Player 1 is always white
    if (myRole === 'player2') return 'black';  // Player 2 is always black
    return null;
  }, [user, session, myRole]);

  // Determine if user can move
  const canMove = useMemo(() => {
    if (!myPlayer || !session) return false;
    if (myRole === 'spectator') return false;

    // In Werera: both players can move
    if (isWerera) return true;

    // In normal mode: only if it's your turn
    return session.currentTurn === myPlayer;
  }, [myPlayer, session, myRole, isWerera]);

  /**
   * Process moves in Gun's HAM order (sorted by timestamp)
   * Gun ensures all clients see moves in same order
   */
  const processedMoves = useMemo(() => {
    return [...moves].sort((a, b) => a.timestamp - b.timestamp);
  }, [moves]);

  /**
   * Make a move in the current session
   *
   * In Werera phase:
   * - Both players can move simultaneously
   * - First capture ends Werera
   *
   * In normal phase:
   * - Standard turn-based chess
   */
  const makeMove = useCallback(async (
    from: Position,
    to: Position,
    captured: boolean,
    pieceType: PieceType
  ) => {
    'background only';

    if (!canMove || !myPlayer) {
      console.warn('[Werera] Cannot move - not your turn or invalid player');
      return;
    }

    // Check for duplicate move within 500ms
    const now = Date.now();
    const lastMove = lastMoveRef.current;
    if (
      lastMove &&
      lastMove.fromRow === from.row &&
      lastMove.fromCol === from.col &&
      lastMove.toRow === to.row &&
      lastMove.toCol === to.col &&
      now - lastMove.timestamp < 500
    ) {
      console.log('[Werera] Ignoring duplicate move within 500ms');
      return;
    }

    // Update last move tracker
    lastMoveRef.current = {
      fromRow: from.row,
      fromCol: from.col,
      toRow: to.row,
      toCol: to.col,
      timestamp: now,
    };

    // Flatten positions for Gun storage
    // Note: FEN will be generated when replaying moves in useGameLogic
    const move: Omit<Move, 'timestamp'> = {
      fromRow: from.row,
      fromCol: from.col,
      toRow: to.row,
      toCol: to.col,
      player: myPlayer,
      captured,
      pieceType,
    };

    console.log('[Werera] Making move:', move, isWerera ? '(Werera)' : '(Normal)');

    // Add move to Gun (HAM handles ordering)
    await addMove(move);

    // If this move captured in Werera phase, end Werera
    if (captured && isWerera && session) {
      console.log('[Werera] First capture! Ending Werera phase');

      // Transition to normal mode
      // Next turn goes to opposite player
      const nextTurn: Player = myPlayer === 'white' ? 'black' : 'white';

      await updateSession({
        phase: 'normal',
        currentTurn: nextTurn,
      });
    } else if (!isWerera && session) {
      // Normal mode: switch turns
      const nextTurn: Player = myPlayer === 'white' ? 'black' : 'white';

      await updateSession({
        currentTurn: nextTurn,
      });
    }
  }, [canMove, myPlayer, isWerera, session, addMove, updateSession]);

  return {
    isWerera,
    canMove,
    makeMove,
    processedMoves,
    myPlayer,
  };
}
