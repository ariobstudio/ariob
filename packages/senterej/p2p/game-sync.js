import { createGame, makeMove } from '@ariob/senterej/engine';
export class SenterejP2PSync {
    constructor(config) {
        console.log('[SenterejP2PSync] Constructor called with config:', {
            hasGun: !!config.gun,
            hasUser: !!config.user,
            userIs: config.user?.is,
            userPub: config.user?.is?.pub,
        });
        this.gun = config.gun;
        this.user = config.user;
        this.onGameUpdate = config.onGameUpdate;
        this.onError = config.onError;
    }
    /**
     * Create a new game session
     * UNIX: Do one thing well - create and return session ID
     */
    async createSession(playerName) {
        console.log('[SenterejP2PSync] createSession called with playerName:', playerName);
        console.log('[SenterejP2PSync] User object:', {
            user: this.user,
            hasIs: !!this.user?.is,
            pub: this.user?.is?.pub,
        });
        try {
            const sessionId = `senterej-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const initialState = createGame();
            // Get user ID - fallback to anonymous if not authenticated
            const userId = this.user?.is?.pub || `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            console.log('[SenterejP2PSync] Using userId:', userId);
            const playerInfo = {
                id: userId,
                pub: userId,
                name: playerName,
                joinedAt: Date.now()
            };
            const session = {
                id: sessionId,
                createdAt: Date.now(),
                players: {
                    green: playerInfo
                },
                state: initialState
            };
            // Store in Gun under games namespace
            console.log('[SenterejP2PSync] Session object to store:', JSON.stringify(session, null, 2));
            console.log('[SenterejP2PSync] Storing session in Gun:', sessionId);
            this.sessionRef = this.gun.get('senterej').get('games').get(sessionId);
            // Store each part separately to avoid circular reference issues
            await new Promise((resolve, reject) => {
                // Store session metadata
                this.sessionRef.get('id').put(session.id, (ack) => {
                    if (ack.err) {
                        console.error('[SenterejP2PSync] Error storing id:', ack.err);
                        reject(new Error(ack.err));
                        return;
                    }
                });
                this.sessionRef.get('createdAt').put(session.createdAt, (ack) => {
                    if (ack.err) {
                        console.error('[SenterejP2PSync] Error storing createdAt:', ack.err);
                        reject(new Error(ack.err));
                        return;
                    }
                });
                // Store player info
                this.sessionRef.get('players').get('green').put(playerInfo, (ack) => {
                    if (ack.err) {
                        console.error('[SenterejP2PSync] Error storing green player:', ack.err);
                        reject(new Error(ack.err));
                        return;
                    }
                });
                // Store game state as JSON string to avoid serialization issues
                const stateJSON = JSON.stringify(session.state);
                this.sessionRef.get('state').put(stateJSON, (ack) => {
                    console.log('[SenterejP2PSync] Gun put state ack:', ack);
                    if (ack.err) {
                        console.error('[SenterejP2PSync] Error storing state:', ack.err);
                        reject(new Error(ack.err));
                    }
                    else {
                        resolve();
                    }
                });
            });
            this.currentSessionId = sessionId;
            this.localPlayer = 'green';
            console.log('[SenterejP2PSync] Session created successfully:', sessionId);
            this.subscribeToSession(sessionId);
            return sessionId;
        }
        catch (error) {
            console.error('[SenterejP2PSync] Error creating session:', error);
            this.onError(error);
            throw error;
        }
    }
    /**
     * Join an existing game session
     * UNIX: Single responsibility - join and subscribe
     */
    async joinSession(sessionId, playerName) {
        console.log('[SenterejP2PSync] joinSession called:', { sessionId, playerName });
        try {
            this.sessionRef = this.gun.get('senterej').get('games').get(sessionId);
            // Get current session
            const session = await new Promise((resolve, reject) => {
                this.sessionRef.once((data) => {
                    console.log('[SenterejP2PSync] Retrieved session data:', data);
                    if (!data) {
                        reject(new Error('Session not found'));
                        return;
                    }
                    // Parse state if it's stored as JSON string
                    if (data.state && typeof data.state === 'string') {
                        try {
                            data.state = JSON.parse(data.state);
                        }
                        catch (e) {
                            console.error('[SenterejP2PSync] Error parsing state JSON:', e);
                            reject(new Error('Invalid session state'));
                            return;
                        }
                    }
                    resolve(data);
                });
            });
            // Check if gold slot is available
            if (session.players.gold) {
                throw new Error('Game is full');
            }
            // Get user ID - fallback to anonymous if not authenticated
            const userId = this.user?.is?.pub || `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            console.log('[SenterejP2PSync] Joining with userId:', userId);
            const playerInfo = {
                id: userId,
                pub: userId,
                name: playerName,
                joinedAt: Date.now()
            };
            // Update session with gold player
            await new Promise((resolve, reject) => {
                this.sessionRef.get('players').get('gold').put(playerInfo, (ack) => {
                    console.log('[SenterejP2PSync] Join session put ack:', ack);
                    if (ack.err)
                        reject(new Error(ack.err));
                    else
                        resolve();
                });
            });
            this.currentSessionId = sessionId;
            this.localPlayer = 'gold';
            console.log('[SenterejP2PSync] Joined session successfully:', sessionId);
            this.subscribeToSession(sessionId);
        }
        catch (error) {
            console.error('[SenterejP2PSync] Error joining session:', error);
            this.onError(error);
            throw error;
        }
    }
    /**
     * Subscribe to real-time game updates
     * UNIX: Separate concerns - subscription logic isolated
     */
    subscribeToSession(_sessionId) {
        this.sessionRef.on((session) => {
            if (!session)
                return;
            console.log('[SenterejP2PSync] Session update received:', session);
            // Parse state if it's stored as JSON string
            if (session.state && typeof session.state === 'string') {
                try {
                    session.state = JSON.parse(session.state);
                }
                catch (e) {
                    console.error('[SenterejP2PSync] Error parsing state JSON:', e);
                    return;
                }
            }
            // Validate session data
            if (!session.state || !session.players) {
                console.error('[SenterejP2PSync] Invalid session data:', session);
                return;
            }
            this.onGameUpdate(session);
        });
    }
    /**
     * Make a move and sync to peers
     * UNIX: Pipeline approach - validate, execute, sync
     */
    async makeMove(from, to) {
        if (!this.currentSessionId || !this.localPlayer) {
            throw new Error('Not in a game session');
        }
        try {
            // Get current state
            const session = await new Promise((resolve, reject) => {
                this.sessionRef.once((data) => {
                    if (!data)
                        reject(new Error('Session not found'));
                    else
                        resolve(data);
                });
            });
            // Validate it's the player's turn (in normal phase)
            if (session.state.phase === 'normal' &&
                session.state.currentPlayer !== this.localPlayer) {
                throw new Error('Not your turn');
            }
            // Make the move
            const newState = makeMove(session.state, from, to);
            if (!newState) {
                throw new Error('Invalid move');
            }
            // Update the session state
            await new Promise((resolve, reject) => {
                this.sessionRef.get('state').put(newState, (ack) => {
                    if (ack.err)
                        reject(new Error(ack.err));
                    else
                        resolve();
                });
            });
            // Update last move timestamp
            await new Promise((resolve, reject) => {
                this.sessionRef.get('lastMoveAt').put(Date.now(), (ack) => {
                    if (ack.err)
                        reject(new Error(ack.err));
                    else
                        resolve();
                });
            });
        }
        catch (error) {
            this.onError(error);
            throw error;
        }
    }
    /**
     * Leave the current session
     * UNIX: Clean separation - unsubscribe and cleanup
     */
    leaveSession() {
        if (this.sessionRef) {
            this.sessionRef.off();
            this.sessionRef = null;
        }
        this.currentSessionId = undefined;
        this.localPlayer = undefined;
    }
    /**
     * Get local player color
     */
    getLocalPlayer() {
        return this.localPlayer;
    }
    /**
     * Get current session ID
     */
    getSessionId() {
        return this.currentSessionId;
    }
}
