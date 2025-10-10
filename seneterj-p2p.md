// packages/senterej-p2p/src/types.ts
import type { GameState, Move, Player } from ‘@ariob/senterej-engine’;

export interface GameSession {
id: string;
createdAt: number;
players: {
green?: PlayerInfo;
gold?: PlayerInfo;
};
state: GameState;
lastMoveAt?: number;
}

export interface PlayerInfo {
id: string;
pub: string;
name: string;
joinedAt: number;
}

export interface P2PGameConfig {
gun: any; // Gun instance from @ariob/core
user: any; // Gun.user instance
onGameUpdate: (session: GameSession) => void;
onError: (error: Error) => void;
}

// packages/senterej-p2p/src/game-sync.ts
import { createGame, makeMove } from ‘@ariob/senterej-engine’;

export class SenterejP2PSync {
private gun: any;
private user: any;
private sessionRef: any;
private onGameUpdate: (session: GameSession) => void;
private onError: (error: Error) => void;
private currentSessionId?: string;
private localPlayer?: Player;

constructor(config: P2PGameConfig) {
this.gun = config.gun;
this.user = config.user;
this.onGameUpdate = config.onGameUpdate;
this.onError = config.onError;
}

/**

- Create a new game session
- UNIX: Do one thing well - create and return session ID
  */
  async createSession(playerName: string): Promise<string> {
  try {
  const sessionId = `senterej-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const initialState = createGame();
  
  const playerInfo: PlayerInfo = {
  id: this.user.is.pub,
  pub: this.user.is.pub,
  name: playerName,
  joinedAt: Date.now()
  };
  
  const session: GameSession = {
  id: sessionId,
  createdAt: Date.now(),
  players: {
  green: playerInfo
  },
  state: initialState
  };
  
  // Store in Gun under games namespace
  this.sessionRef = this.gun.get(‘senterej’).get(‘games’).get(sessionId);
  await new Promise<void>((resolve, reject) => {
  this.sessionRef.put(session, (ack: any) => {
  if (ack.err) reject(new Error(ack.err));
  else resolve();
  });
  });
  
  this.currentSessionId = sessionId;
  this.localPlayer = ‘green’;
  this.subscribeToSession(sessionId);
  
  return sessionId;
  } catch (error) {
  this.onError(error as Error);
  throw error;
  }
  }

/**

- Join an existing game session
- UNIX: Single responsibility - join and subscribe
  */
  async joinSession(sessionId: string, playerName: string): Promise<void> {
  try {
  this.sessionRef = this.gun.get(‘senterej’).get(‘games’).get(sessionId);
  
  // Get current session
  const session = await new Promise<GameSession>((resolve, reject) => {
  this.sessionRef.once((data: GameSession) => {
  if (!data) reject(new Error(‘Session not found’));
  else resolve(data);
  });
  });
  
  // Check if gold slot is available
  if (session.players.gold) {
  throw new Error(‘Game is full’);
  }
  
  const playerInfo: PlayerInfo = {
  id: this.user.is.pub,
  pub: this.user.is.pub,
  name: playerName,
  joinedAt: Date.now()
  };
  
  // Update session with gold player
  await new Promise<void>((resolve, reject) => {
  this.sessionRef.get(‘players’).get(‘gold’).put(playerInfo, (ack: any) => {
  if (ack.err) reject(new Error(ack.err));
  else resolve();
  });
  });
  
  this.currentSessionId = sessionId;
  this.localPlayer = ‘gold’;
  this.subscribeToSession(sessionId);
  } catch (error) {
  this.onError(error as Error);
  throw error;
  }
  }

/**

- Subscribe to real-time game updates
- UNIX: Separate concerns - subscription logic isolated
  */
  private subscribeToSession(sessionId: string): void {
  this.sessionRef.on((session: GameSession) => {
  if (!session) return;
  
  // Validate session data
  if (!session.state || !session.players) {
  console.error(‘Invalid session data’);
  return;
  }
  
  this.onGameUpdate(session);
  });
  }

/**

- Make a move and sync to peers
- UNIX: Pipeline approach - validate, execute, sync
  */
  async makeMove(from: Position, to: Position): Promise<void> {
  if (!this.currentSessionId || !this.localPlayer) {
  throw new Error(‘Not in a game session’);
  }

```
try {
  // Get current state
  const session = await new Promise<GameSession>((resolve, reject) => {
    this.sessionRef.once((data: GameSession) => {
      if (!data) reject(new Error('Session not found'));
      else resolve(data);
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
  await new Promise<void>((resolve, reject) => {
    this.sessionRef.get('state').put(newState, (ack: any) => {
      if (ack.err) reject(new Error(ack.err));
      else resolve();
    });
  });
  
  // Update last move timestamp
  await new Promise<void>((resolve, reject) => {
    this.sessionRef.get('lastMoveAt').put(Date.now(), (ack: any) => {
      if (ack.err) reject(new Error(ack.err));
      else resolve();
    });
  });
} catch (error) {
  this.onError(error as Error);
  throw error;
}
```

}

/**

- Leave the current session
- UNIX: Clean separation - unsubscribe and cleanup
  */
  leaveSession(): void {
  if (this.sessionRef) {
  this.sessionRef.off();
  this.sessionRef = null;
  }
  this.currentSessionId = undefined;
  this.localPlayer = undefined;
  }

/**

- Get local player color
  */
  getLocalPlayer(): Player | undefined {
  return this.localPlayer;
  }

/**

- Get current session ID
  */
  getSessionId(): string | undefined {
  return this.currentSessionId;
  }
  }

// packages/senterej-p2p/src/session-discovery.ts

/**

- Helper for discovering and listing available game sessions
- UNIX: Single purpose - session discovery
  */
  export class SessionDiscovery {
  private gun: any;

constructor(gun: any) {
this.gun = gun;
}

/**

- List all active game sessions
  */
  async listSessions(): Promise<GameSession[]> {
  return new Promise((resolve) => {
  const sessions: GameSession[] = [];
  
  this.gun.get(‘senterej’).get(‘games’).map().once((session: GameSession) => {
  if (session && session.id) {
  // Only include sessions with available slots
  if (!session.players.gold) {
  sessions.push(session);
  }
  }
  });
  
  // Wait a bit for all sessions to be collected
  setTimeout(() => resolve(sessions), 500);
  });
  }

/**

- Watch for new sessions
- Returns cleanup function (UNIX: provide tools to compose)
  */
  watchSessions(callback: (sessions: GameSession[]) => void): () => void {
  const sessionsMap = new Map<string, GameSession>();

```
const ref = this.gun.get('senterej').get('games').map();

ref.on((session: GameSession) => {
  if (session && session.id) {
    sessionsMap.set(session.id, session);
    callback(Array.from(sessionsMap.values()));
  }
});

// Return cleanup function
return () => {
  ref.off();
};
```

}
}

// packages/senterej-p2p/src/hooks/useP2PGame.ts
import { useState, useEffect, useCallback } from ‘@lynx-js/react’;
import type { GameSession } from ‘../types’;
import { SenterejP2PSync } from ‘../game-sync’;

export interface UseP2PGameOptions {
gun: any;
user: any;
sessionId?: string;
playerName: string;
autoJoin?: boolean;
}

export function useP2PGame(options: UseP2PGameOptions) {
const [session, setSession] = useState<GameSession | null>(null);
const [error, setError] = useState<Error | null>(null);
const [loading, setLoading] = useState(false);
const [sync, setSync] = useState<SenterejP2PSync | null>(null);

// Initialize sync
useEffect(() => {
const p2pSync = new SenterejP2PSync({
gun: options.gun,
user: options.user,
onGameUpdate: setSession,
onError: setError
});

```
setSync(p2pSync);

return () => {
  p2pSync.leaveSession();
};
```

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
if (!sync) return;
setLoading(true);
try {
const id = await sync.createSession(options.playerName);
return id;
} catch (err) {
setError(err as Error);
} finally {
setLoading(false);
}
}, [sync, options.playerName]);

const joinGame = useCallback(async (sessionId: string) => {
if (!sync) return;
setLoading(true);
try {
await sync.joinSession(sessionId, options.playerName);
} catch (err) {
setError(err as Error);
} finally {
setLoading(false);
}
}, [sync, options.playerName]);

const makeMove = useCallback(async (from: Position, to: Position) => {
if (!sync) return;
try {
await sync.makeMove(from, to);
} catch (err) {
setError(err as Error);
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

// packages/senterej-p2p/src/index.ts
export { SenterejP2PSync } from ‘./game-sync’;
export { SessionDiscovery } from ‘./session-discovery’;
export { useP2PGame } from ‘./hooks/useP2PGame’;
export type { GameSession, PlayerInfo, P2PGameConfig } from ‘./types’;