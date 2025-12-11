/**
 * useGameSession Hook
 *
 * Manages real-time game session synchronization via Gun.
 * Handles session joining, player/spectator management, and move sync.
 */

import { useEffect, useCallback } from '@lynx-js/react';
import {
  useNode,
  useCollection,
  collection,
  node,
  authStore,
  type IGunChainReference,
} from '@ariob/core';
import { SessionSchema, MoveSchema, type Session, type Move } from '../../types';

export interface UseGameSessionOptions {
  sessionId: string;
  graph: IGunChainReference;
  joining?: boolean;
  isCreator?: boolean;
}

export interface UseGameSessionReturn {
  session: Session | null;
  moves: Move[];
  loading: boolean;
  error: Error | null;
  joinAsPlayer: () => Promise<void>;
  joinAsSpectator: () => Promise<void>;
  addMove: (move: Omit<Move, 'timestamp'>) => Promise<void>;
  updateSession: (updates: Partial<Session>) => Promise<void>;
  myRole: 'player1' | 'player2' | 'spectator' | 'none';
}

/**
 * Hook for managing game session state with Gun
 */
export function useGameSession({
  sessionId,
  graph,
  joining = false,
  isCreator = false,
}: UseGameSessionOptions): UseGameSessionReturn {
  const user = authStore.getState().user;

  // Subscribe to session node
  const sessionNode = useNode<Session>(`session-${sessionId}`);
  const movesCollection = useCollection<Move>(`moves-${sessionId}`);

  useEffect(() => {
    'background only';

    if (!sessionId || !graph) return;

    const sessionRef = graph.get('senterej').get('sessions').get(sessionId);
    const movesRef = sessionRef.get('moves');

    console.log('[GameSession] Subscribing to session:', sessionId);

    // Subscribe using @ariob/core
    sessionNode.on(sessionRef, SessionSchema);
    movesCollection.map(movesRef, MoveSchema);

    return () => {
      sessionNode.off();
      movesCollection.off();
      console.log('[GameSession] Unsubscribed from session:', sessionId);
    };
  }, [sessionId, graph]);

  /**
   * Determine user's role in the session
   */
  const myRole = (() => {
    if (!user || !sessionNode.data) return 'none';

    if (sessionNode.data.player1Pub === user.pub) return 'player1';
    if (sessionNode.data.player2Pub === user.pub) return 'player2';

    return 'none';
  })();

  /**
   * Join session as player 2
   */
  const joinAsPlayer = useCallback(async () => {
    'background only';

    if (!user || !sessionNode.data) {
      console.error('[GameSession] Cannot join - no user or session data');
      return;
    }

    if (sessionNode.data.player2Pub) {
      console.warn('[GameSession] Game already has 2 players');
      return;
    }

    const sessionRef = graph.get('senterej').get('sessions').get(sessionId);

    const updatedSession: Session = {
      ...sessionNode.data,
      player2Pub: user.pub,
      player2Alias: user.alias,
      status: 'active',
    };

    console.log('[GameSession] Joining as player 2');
    await node(`session-${sessionId}`).put(sessionRef, updatedSession, SessionSchema);
  }, [user, sessionNode.data, graph, sessionId]);

  /**
   * Join session as spectator (removed - spectators not supported yet)
   */
  const joinAsSpectator = useCallback(async () => {
    'background only';
    console.log('[GameSession] Spectator mode not yet implemented');
  }, []);

  /**
   * Add a move to the session
   * Gun's HAM handles timestamp ordering automatically
   */
  const addMove = useCallback(async (moveData: Omit<Move, 'timestamp'>) => {
    'background only';

    const move: Move = {
      ...moveData,
      timestamp: Date.now(),
    };

    const movesRef = graph.get('senterej').get('sessions').get(sessionId).get('moves');

    console.log('[GameSession] Adding move:', move);
    await collection(`moves-${sessionId}`).set(movesRef, move, MoveSchema);
  }, [graph, sessionId]);

  /**
   * Update session data (e.g., phase transition, winner)
   */
  const updateSession = useCallback(async (updates: Partial<Session>) => {
    'background only';

    if (!sessionNode.data) {
      console.error('[GameSession] Cannot update - no session data');
      return;
    }

    const sessionRef = graph.get('senterej').get('sessions').get(sessionId);

    const updatedSession: Session = {
      ...sessionNode.data,
      ...updates,
    };

    console.log('[GameSession] Updating session:', updates);
    await node(`session-${sessionId}`).put(sessionRef, updatedSession, SessionSchema);
  }, [sessionNode.data, graph, sessionId]);

  // Auto-join on mount if joining flag is set
  useEffect(() => {
    'background only';

    if (!joining || myRole !== 'none') return;
    if (!sessionNode.data) return;

    // If game doesn't have player 2, join as player
    if (!sessionNode.data.player2Pub) {
      console.log('[GameSession] Auto-joining as player 2');
      joinAsPlayer();
    } else {
      // Otherwise, spectating not yet implemented
      console.log('[GameSession] Game full, spectating not yet implemented');
    }
  }, [joining, myRole, sessionNode.data, joinAsPlayer, joinAsSpectator]);

  // Debug logging
  console.log('[useGameSession] State:', {
    sessionId,
    hasData: !!sessionNode.data,
    sessionLoading: sessionNode.loading,
    movesLoading: movesCollection.loading,
    totalLoading: sessionNode.loading || movesCollection.loading,
    error: sessionNode.error || movesCollection.error,
    myRole,
    movesCount: movesCollection.items.length,
  });

  return {
    session: sessionNode.data,
    moves: movesCollection.items.map(item => item.data),
    loading: sessionNode.loading || movesCollection.loading,
    error: sessionNode.error || movesCollection.error,
    joinAsPlayer,
    joinAsSpectator,
    addMove,
    updateSession,
    myRole,
  };
}
