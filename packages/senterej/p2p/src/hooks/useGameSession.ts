import { useState, useCallback, useMemo } from '@lynx-js/react';
import { useNode } from '@ariob/core';
import type { GunInstance } from '@ariob/core';
import { createGame as engineCreateGame, makeMove as engineMakeMove } from '@ariob/senterej/engine';
import type { Position } from '@ariob/senterej/engine';
import { gunDataToSession } from '../schema';
import type { GameSession, GameSessionGunData, PlayerInfo } from '../schema';

export interface UseGameSessionOptions {
  graph: GunInstance;
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
  const { graph, playerName } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState(options.sessionId);

  // Generate a stable user ID for this session
  const [userId] = useState(() => `user-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  // Get Gun reference for the current session
  const sessionRef = useMemo(() => {
    if (!currentSessionId) return null;
    return graph.get('senterej').get('sessions').get(currentSessionId);
  }, [graph, currentSessionId]);

  // Use core useNode hook to subscribe to session updates
  const { data: sessionData, put, isLoading: sessionLoading } = useNode<GameSessionGunData>(sessionRef);

  // Convert Gun data to GameSession
  const session = useMemo(() => {
    if (!sessionData) return null;
    try {
      return gunDataToSession(sessionData);
    } catch (err) {
      console.error('Failed to parse session data:', err);
      return null;
    }
  }, [sessionData]);

  // Determine local player
  const localPlayer = useMemo(() => {
    if (!session) return null;
    if (session.players.green?.id === userId) return 'green';
    if (session.players.gold?.id === userId) return 'gold';
    return null;
  }, [session, userId]);

  const createGame = useCallback(async (): Promise<string | undefined> => {
    console.log('[useGameSession] createGame called', { userId, playerName });
    setLoading(true);
    setError(null);

    try {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      console.log('[useGameSession] Generated sessionId:', sessionId);

      const initialState = engineCreateGame();
      console.log('[useGameSession] Created initial game state');

      const playerInfo: PlayerInfo = {
        id: userId,
        pub: userId,
        name: playerName,
        joinedAt: Date.now(),
      };
      console.log('[useGameSession] Player info:', playerInfo);

      // Create session reference
      const newSessionRef = graph.get('senterej').get('sessions').get(sessionId);
      console.log('[useGameSession] Created Gun reference path: senterej/sessions/' + sessionId);

      const sessionData = {
        id: sessionId,
        createdAt: Date.now(),
        greenPlayer: JSON.stringify(playerInfo),
        gameState: JSON.stringify(initialState),
        status: 'waiting',
      };
      console.log('[useGameSession] Session data to store:', sessionData);

      // Use Gun's put directly with callback
      await new Promise<void>((resolve, reject) => {
        console.log('[useGameSession] Calling Gun.put()...');
        newSessionRef.put(sessionData, (ack: any) => {
          console.log('[useGameSession] Gun.put() callback:', ack);
          if (ack.err) {
            console.error('[useGameSession] Gun.put() error:', ack.err);
            reject(new Error(ack.err));
          } else {
            console.log('[useGameSession] Gun.put() success!');
            resolve();
          }
        });
      });

      console.log('[useGameSession] Setting currentSessionId to:', sessionId);
      setCurrentSessionId(sessionId);
      return sessionId;
    } catch (err) {
      console.error('[useGameSession] createGame error:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [graph, playerName, userId]);

  const joinGame = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Get session ref and check if it exists
      const joinRef = graph.get('senterej').get('sessions').get(sessionId);

      const currentData = await new Promise<GameSessionGunData>((resolve, reject) => {
        joinRef.once((data: any) => {
          if (!data) reject(new Error('Session not found'));
          else resolve(data as GameSessionGunData);
        });
      });

      if (currentData.goldPlayer) {
        throw new Error('Game is full');
      }

      const playerInfo: PlayerInfo = {
        id: userId,
        pub: userId,
        name: playerName,
        joinedAt: Date.now(),
      };

      // Update session with gold player using Gun's put
      await new Promise<void>((resolve, reject) => {
        joinRef.put({
          goldPlayer: JSON.stringify(playerInfo),
          status: 'playing',
        }, (ack: any) => {
          if (ack.err) reject(new Error(ack.err));
          else resolve();
        });
      });

      setCurrentSessionId(sessionId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [graph, playerName, userId]);

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

      // Update in Gun using put from useNode
      await put({ gameState: JSON.stringify(newState) });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [put, session, currentSessionId, localPlayer]);

  const leaveGame = useCallback(() => {
    setCurrentSessionId(undefined);
    setError(null);
  }, []);

  return {
    session,
    loading: loading || sessionLoading,
    error,
    localPlayer,
    createGame,
    joinGame,
    makeMove,
    leaveGame,
  };
}
