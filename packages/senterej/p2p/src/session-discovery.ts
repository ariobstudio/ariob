import type { GameSession } from './types';

/**
 * Helper for discovering and listing available game sessions
 * UNIX: Single purpose - session discovery
 */
export class SessionDiscovery {
  private gun: any;

  constructor(gun: any) {
    this.gun = gun;
  }

  /**
   * List all active game sessions
   */
  async listSessions(): Promise<GameSession[]> {
    return new Promise((resolve) => {
      const sessions: GameSession[] = [];

      this.gun.get('senterej').get('games').map().once((session: GameSession) => {
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
   * Watch for new sessions
   * Returns cleanup function (UNIX: provide tools to compose)
   */
  watchSessions(callback: (sessions: GameSession[]) => void): () => void {
    const sessionsMap = new Map<string, GameSession>();

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
  }
}
