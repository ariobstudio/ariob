/**
 * Lex - Lexical ordering utilities for Gun
 *
 * Gun uses lexicographical (alphabetical) ordering for keys in sets and maps.
 * These utilities make it easy to create sortable keys for common patterns.
 *
 * Based on: https://github.com/amark/gun/wiki/Strings,-Keys-and-Lex-Rules
 *
 * @example Time-based ordering
 * ```ts
 * import { lex } from '@ariob/core';
 *
 * // Chronological (oldest first)
 * const key1 = lex.time(); // '0000001234567890'
 *
 * // Reverse chronological (newest first)
 * const key2 = lex.reverseTime(); // '9999998765432109'
 * ```
 *
 * @example User-namespaced keys
 * ```ts
 * // Gun convention: ~ prefix for user data
 * const userKey = lex.user(pub); // '~ABC123...'
 * ```
 *
 * @example Prefixed IDs
 * ```ts
 * // Messages sorted by time
 * const msgId = lex.id('msg'); // 'msg_0000001234567890'
 *
 * // Tasks sorted reverse chronologically
 * const taskId = lex.id('task', true); // 'task_9999998765432109'
 * ```
 */

/**
 * Maximum safe integer for reverse timestamps
 * @internal
 */
const MAX_SAFE_INT = Number.MAX_SAFE_INTEGER;

/**
 * Pad number to fixed width for lexical sorting
 * @internal
 */
function padNumber(num: number, width: number = 16): string {
  return num.toString().padStart(width, '0');
}

/**
 * Lexical ordering utilities
 *
 * @namespace lex
 */
export const lex = {
  /**
   * Generate a chronologically sortable timestamp key (oldest first)
   *
   * Uses current timestamp, padded to ensure lexical sorting.
   * Earlier timestamps sort before later ones.
   *
   * @returns Sortable timestamp string
   *
   * @example
   * ```ts
   * const key1 = lex.time(); // '0000001234567890' (earlier)
   * // ... wait a bit ...
   * const key2 = lex.time(); // '0000001234567999' (later)
   * // key1 < key2 (chronological order)
   * ```
   */
  time: (): string => {
    return padNumber(Date.now());
  },

  /**
   * Generate a reverse chronologically sortable timestamp key (newest first)
   *
   * Uses inverted timestamp so newer items sort before older ones.
   * Perfect for feeds, messages, or activity logs.
   *
   * @returns Reverse sortable timestamp string
   *
   * @example
   * ```ts
   * const key1 = lex.reverse(); // '9999998765432109' (earlier)
   * // ... wait a bit ...
   * const key2 = lex.reverse(); // '9999998765432100' (later)
   * // key2 < key1 (newest first)
   * ```
   */
  reverse: (): string => {
    return padNumber(MAX_SAFE_INT - Date.now());
  },

  /**
   * Generate a sortable ID with optional prefix
   *
   * Combines a prefix with a timestamp for grouped, sorted items.
   * Useful for categorizing different types of items.
   *
   * @param prefix - Optional prefix (e.g., 'msg', 'task', 'user')
   * @param reverse - Use reverse chronological order (newest first)
   * @returns Prefixed sortable ID
   *
   * @example
   * ```ts
   * // Messages sorted oldest first
   * const msgId = lex.id('msg');
   * // 'msg_0000001234567890'
   *
   * // Tasks sorted newest first
   * const taskId = lex.id('task', true);
   * // 'task_9999998765432109'
   *
   * // No prefix (just timestamp)
   * const id = lex.id();
   * // '0000001234567890'
   * ```
   */
  id: (prefix?: string, reverse: boolean = false): string => {
    const timestamp = reverse ? lex.reverse() : lex.time();
    return prefix ? `${prefix}_${timestamp}` : timestamp;
  },

  /**
   * Generate a user-namespaced key (Gun convention)
   *
   * Uses Gun's `~` prefix convention for user-specific data.
   * Each user's data is isolated by their public key.
   *
   * @param pub - User's public key
   * @param suffix - Optional suffix to append
   * @returns User-namespaced key
   *
   * @example
   * ```ts
   * // User's profile
   * const profileKey = lex.user(pub);
   * // '~ABC123...'
   *
   * // User's specific data
   * const settingsKey = lex.user(pub, 'settings');
   * // '~ABC123.../settings'
   * ```
   */
  user: (pub: string, suffix?: string): string => {
    return suffix ? `~${pub}/${suffix}` : `~${pub}`;
  },

  /**
   * Join multiple parts into a sortable key
   *
   * Combines parts with '/' separator for hierarchical keys.
   * Each part can be a string, number, or timestamp.
   *
   * @param parts - Array of key parts (strings or numbers)
   * @returns Joined key
   *
   * @example
   * ```ts
   * // Hierarchical structure
   * const key1 = lex.key(['users', 'alice', 'posts']);
   * // 'users/alice/posts'
   *
   * // With timestamp
   * const key2 = lex.key(['posts', lex.time()]);
   * // 'posts/0000001234567890'
   *
   * // Category + reverse time
   * const key3 = lex.key(['messages', lex.reverseTime()]);
   * // 'messages/9999998765432109'
   * ```
   */
  key: (...parts: (string | number)[]): string => {
    return parts.filter(p => p != null).join('/');
  },

  /**
   * Generate a random sortable ID
   *
   * Combines timestamp with random suffix for uniqueness.
   * Maintains chronological ordering while preventing collisions.
   *
   * @param prefix - Optional prefix
   * @param reverse - Use reverse chronological order
   * @returns Random sortable ID
   *
   * @example
   * ```ts
   * const id1 = lex.random();
   * // '0000001234567890_a3f9d2'
   *
   * const id2 = lex.random('item');
   * // 'item_0000001234567890_b8e4c1'
   *
   * const id3 = lex.random('msg', true);
   * // 'msg_9999998765432109_f2d8a7'
   * ```
   */
  random: (prefix?: string, reverse: boolean = false): string => {
    const timestamp = reverse ? lex.reverse() : lex.time();
    const random = Math.random().toString(36).substring(2, 8);
    const id = `${timestamp}_${random}`;
    return prefix ? `${prefix}_${id}` : id;
  },

  /**
   * Extract timestamp from a lex-generated ID
   *
   * Parses timestamp from IDs created by lex.time(), lex.id(), etc.
   * Returns null if ID format is invalid.
   *
   * @param id - Lex-generated ID
   * @returns Timestamp in milliseconds, or null if invalid
   *
   * @example
   * ```ts
   * const id = lex.time(); // '0000001234567890'
   * const timestamp = lex.timestamp(id); // 1234567890
   *
   * const msgId = lex.id('msg'); // 'msg_0000001234567890'
   * const msgTime = lex.timestamp(msgId); // 1234567890
   * ```
   */
  timestamp: (id: string): number | null => {
    try {
      // Extract timestamp portion (handle prefixes and suffixes)
      const parts = id.split('_');
      let timestampStr: string;

      if (parts.length === 1) {
        // No prefix: '0000001234567890'
        timestampStr = parts[0]!;
      } else if (parts.length === 2) {
        // With prefix: 'msg_0000001234567890'
        timestampStr = parts[1]!;
      } else if (parts.length === 3) {
        // With prefix and random: 'msg_0000001234567890_a3f9d2'
        timestampStr = parts[1]!;
      } else {
        return null;
      }

      const timestamp = parseInt(timestampStr, 10);
      if (isNaN(timestamp)) return null;

      // Check if it's a reverse timestamp
      if (timestamp > MAX_SAFE_INT / 2) {
        return MAX_SAFE_INT - timestamp;
      }

      return timestamp;
    } catch {
      return null;
    }
  },

  /**
   * Sort items by their lex keys
   *
   * Sorts array of items by their ID property.
   * Useful for ensuring consistent ordering after Gun updates.
   *
   * @param items - Array of items with id property
   * @param reverse - Reverse the sort order
   * @returns Sorted array (new array, does not mutate)
   *
   * @example
   * ```ts
   * const messages = [
   *   { id: 'msg_002', text: 'Third' },
   *   { id: 'msg_000', text: 'First' },
   *   { id: 'msg_001', text: 'Second' },
   * ];
   *
   * const sorted = lex.sort(messages);
   * // [
   * //   { id: 'msg_000', text: 'First' },
   * //   { id: 'msg_001', text: 'Second' },
   * //   { id: 'msg_002', text: 'Third' },
   * // ]
   *
   * const reversed = lex.sort(messages, true);
   * // [
   * //   { id: 'msg_002', text: 'Third' },
   * //   { id: 'msg_001', text: 'Second' },
   * //   { id: 'msg_000', text: 'First' },
   * // ]
   * ```
   */
  sort: <T extends { id: string }>(items: T[], reverse: boolean = false): T[] => {
    const sorted = [...items].sort((a, b) => {
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0;
    });
    return reverse ? sorted.reverse() : sorted;
  },
};