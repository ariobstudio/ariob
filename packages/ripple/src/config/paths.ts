/**
 * Graph Paths Configuration
 *
 * Single source of truth for GUN graph paths.
 * Never hardcode paths in components - import from here.
 */

/** User space paths (gun.user()) */
export const user = {
  profile: 'profile',
  posts: 'posts',
  connections: 'connections',
  messages: 'messages',
  saved: 'saved',
  settings: 'settings',
} as const;

/** Public space paths (gun.get()) */
export const pub = {
  feeds: {
    friends: 'feeds/friends',
    world: 'feeds/world',
    discover: 'feeds/discover',
    noise: 'feeds/noise',
  },
  users: 'users',
  posts: 'posts',
  threads: 'threads',
} as const;

/** Get user-scoped path */
export function getUserPath(pubKey: string, key: keyof typeof user): string {
  return `users/${pubKey}/${user[key]}`;
}

/** Get thread path */
export function getThreadPath(threadId: string): string {
  return `${pub.threads}/${threadId}`;
}

/** Get message path within thread */
export function getMessagePath(threadId: string, messageId: string): string {
  return `${pub.threads}/${threadId}/messages/${messageId}`;
}

/** All paths for reference */
export const paths = { user, pub } as const;
