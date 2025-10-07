import { useState, useEffect, useCallback } from '@lynx-js/react';
import { SenterejP2PSync } from '../game-sync';
export function useP2PGame(options) {
    console.log('[useP2PGame] Hook initialized with options:', {
        hasGun: !!options.gun,
        hasUser: !!options.user,
        userIs: options.user?.is,
        userPub: options.user?.is?.pub,
        sessionId: options.sessionId,
        playerName: options.playerName,
    });
    const [session, setSession] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sync, setSync] = useState(null);
    // Initialize sync
    useEffect(() => {
        console.log('[useP2PGame] Initializing P2P sync');
        const p2pSync = new SenterejP2PSync({
            gun: options.gun,
            user: options.user,
            onGameUpdate: (session) => {
                console.log('[useP2PGame] Game update received:', session);
                setSession(session);
            },
            onError: (err) => {
                console.error('[useP2PGame] Error received:', err);
                setError(err);
            }
        });
        setSync(p2pSync);
        return () => {
            console.log('[useP2PGame] Cleaning up sync');
            p2pSync.leaveSession();
        };
    }, [options.gun, options.user]);
    // Auto-join if sessionId provided
    useEffect(() => {
        if (sync && options.sessionId && options.autoJoin && !session) {
            setLoading(true);
            sync.joinSession(options.sessionId, options.playerName)
                .catch(setError)
                .finally(() => setLoading(false));
        }
    }, [sync, options.sessionId, options.autoJoin, options.playerName, session]);
    const createGame = useCallback(async () => {
        console.log('[useP2PGame] createGame called');
        if (!sync) {
            console.warn('[useP2PGame] No sync available, cannot create game');
            return undefined;
        }
        setLoading(true);
        try {
            const id = await sync.createSession(options.playerName);
            console.log('[useP2PGame] Game created successfully:', id);
            return id;
        }
        catch (err) {
            console.error('[useP2PGame] Error creating game:', err);
            setError(err);
            return undefined;
        }
        finally {
            setLoading(false);
        }
    }, [sync, options.playerName]);
    const joinGame = useCallback(async (sessionId) => {
        if (!sync)
            return;
        setLoading(true);
        try {
            await sync.joinSession(sessionId, options.playerName);
        }
        catch (err) {
            setError(err);
        }
        finally {
            setLoading(false);
        }
    }, [sync, options.playerName]);
    const makeMove = useCallback(async (from, to) => {
        if (!sync)
            return;
        try {
            await sync.makeMove(from, to);
        }
        catch (err) {
            setError(err);
        }
    }, [sync]);
    const leaveGame = useCallback(() => {
        if (sync) {
            sync.leaveSession();
            setSession(null);
        }
    }, [sync]);
    return {
        session,
        error,
        loading,
        localPlayer: sync?.getLocalPlayer(),
        createGame,
        joinGame,
        makeMove,
        leaveGame
    };
}
