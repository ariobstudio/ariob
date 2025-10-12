/**
 * Helper for discovering and listing available game sessions
 * UNIX: Single purpose - session discovery
 */
export class SessionDiscovery {
    constructor(gun) {
        this.gun = gun;
    }
    /**
     * List all active game sessions
     */
    async listSessions() {
        return new Promise((resolve) => {
            const sessions = [];
            this.gun.get('senterej').get('games').map().once((session) => {
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
    watchSessions(callback) {
        const sessionsMap = new Map();
        const ref = this.gun.get('senterej').get('games').map();
        ref.on((session) => {
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
