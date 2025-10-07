import { useState, useCallback, useEffect } from '@lynx-js/react';
import { useThing, useWhoStore } from '@ariob/core';
import { createGame as engineCreateGame, makeMove as engineMakeMove } from '@ariob/senterej/engine';
import type { Position } from '@ariob/senterej/engine';
import { useSessionStore } from '../store';
import { createSession, joinSession, updateGameState } from '../service';
import { thingToSession } from '../schema';
import type { GameSession } from '../schema';

export interface UseGameSessionOptions {
  sessionId?: string;
  playerName: string;
}

export interface UseGameSessionReturn {
  session: GameSession | null;
  loading: boolean;
  error: Error | null;
  localPlayer: 'green' | 'gold' | null;
  createGame: () => Promise<string | undefined>;
  joinGame: (sessionId: string) => Promise<void>;
  makeMove: (from: Position, to: Position) => Promise<void>;
  leaveGame: () => void;
}

/**
 * Hook for managing game sessions using core infrastructure
 */
export function useGameSession(options: UseGameSessionOptions): UseGameSessionReturn {
  console.log('----[useGameSession.ts][Hook called][useGameSession initializing][for session management]');
  console.log('----[useGameSession.ts][Options][Hook options received][for]', options);

  console.log('----[useGameSession.ts][Calling useWhoStore][Getting user from who store][for authentication]');
  const { user } = useWhoStore();
  console.log('----[useGameSession.ts][User from store][useWhoStore returned][for]', user);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState(options.sessionId);
  const [optimisticSession, setOptimisticSession] = useState<GameSession | null>(null);

  console.log('----[useGameSession.ts][State initialized][Local state setup][for]', { loading, error, currentSessionId });

  // Use core useThing hook to watch session
  console.log('----[useGameSession.ts][Calling useThing][Watching session thing][for]', currentSessionId || null);
  const { item: sessionThing } = useThing(useSessionStore, currentSessionId || null);
  console.log('----[useGameSession.ts][useThing result][Session thing from store][for]', sessionThing);

  // Convert thing to session
  const sessionFromStore = sessionThing ? thingToSession(sessionThing) : null;
  const session = sessionFromStore ?? optimisticSession;
  console.log('----[useGameSession.ts][Session converted][thingToSession result][for]', session);

  // Determine local player
  const [generatedAnonId] = useState(() => `anon-${Date.now()}`);
  const userId = user?.pub || generatedAnonId;
  console.log('----[useGameSession.ts][User ID][Determined user identifier][for]', userId);

  const localPlayer = session?.players.green?.id === userId ? 'green' :
                     session?.players.gold?.id === userId ? 'gold' :
                     null;
  console.log('----[useGameSession.ts][Local player][Determined player side][for]', localPlayer);

  const createGame = useCallback(async (): Promise<string | undefined> => {
    console.log('----[useGameSession.ts][createGame hook called][Starting game creation in hook][for P2P session setup]');
    console.log('----[useGameSession.ts][User ID][Current user identifier][for]', userId);
    console.log('----[useGameSession.ts][Player name][Name to use for session][for]', options.playerName);

    setLoading(true);
    setError(null);

    try {
      console.log('----[useGameSession.ts][Creating initial state][Calling engine createGame][for game board initialization]');
      const initialState = engineCreateGame();
      console.log('----[useGameSession.ts][Initial state created][Game engine state ready][for]', initialState);

      console.log('----[useGameSession.ts][Creating session][Calling service createSession][for Gun storage]');

      // Add timeout to detect hanging Promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('createSession timed out after 5 seconds')), 5000)
      );

      const sessionThing = await Promise.race([
        createSession(options.playerName, userId, initialState),
        timeoutPromise
      ]);

      console.log('----[useGameSession.ts][Session created][Service returned session thing][for]', sessionThing);

      setCurrentSessionId(sessionThing.id);
      console.log('----[useGameSession.ts][Session ID set][Updated local state][for]', sessionThing.id);
      setOptimisticSession(thingToSession(sessionThing));
      console.log('----[useGameSession.ts][Optimistic session set][Local session state][for]', sessionThing.id);
      return sessionThing.id;
    } catch (err) {
      console.error('----[useGameSession.ts][Error occurred][Exception during creation][for debugging]', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return undefined;
    } finally {
      setLoading(false);
      console.log('----[useGameSession.ts][Loading complete][Finished create game flow][for UI state]');
    }
  }, [options.playerName, userId]);

  const joinGame = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const joinedThing = await joinSession(sessionId, options.playerName, userId);
      setCurrentSessionId(sessionId);
      setOptimisticSession(thingToSession(joinedThing));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options.playerName, userId]);

  const makeMove = useCallback(async (from: Position, to: Position) => {
    if (!session || !currentSessionId) {
      throw new Error('Not in a game session');
    }

    if (!localPlayer) {
      throw new Error('Not a player in this game');
    }

    try {
      // Validate turn in normal phase
      if (session.state.phase === 'normal' &&
          session.state.currentPlayer !== localPlayer) {
        throw new Error('Not your turn');
      }

      // Make the move
      const newState = engineMakeMove(session.state, from, to);
      if (!newState) {
        throw new Error('Invalid move');
      }

      // Update in Gun
      await updateGameState(currentSessionId, newState);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [session, currentSessionId, localPlayer]);

  const leaveGame = useCallback(() => {
    setCurrentSessionId(undefined);
    setError(null);
    setOptimisticSession(null);
  }, []);

  useEffect(() => {
    if (sessionFromStore && optimisticSession) {
      setOptimisticSession(null);
    }
  }, [sessionFromStore, optimisticSession]);

  return {
    session,
    loading,
    error,
    localPlayer,
    createGame,
    joinGame,
    makeMove,
    leaveGame,
  };
}
