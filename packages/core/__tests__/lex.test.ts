/**
 * Lex - Lexical ordering utilities tests
 *
 * Tests for Gun's lexicographical key generation and sorting utilities.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { lex } from '../lex';

describe('lex', () => {
  // ─────────────────────────────────────────────────────────────────────────
  // lex.time()
  // ─────────────────────────────────────────────────────────────────────────

  describe('time()', () => {
    it('returns a 16-character string', () => {
      const result = lex.time();
      expect(result).toHaveLength(16);
    });

    it('returns only numeric characters', () => {
      const result = lex.time();
      expect(result).toMatch(/^\d{16}$/);
    });

    it('returns chronologically sortable keys', async () => {
      const key1 = lex.time();
      await new Promise((r) => setTimeout(r, 10));
      const key2 = lex.time();

      expect(key1 < key2).toBe(true);
    });

    it('pads smaller timestamps with leading zeros', () => {
      vi.useFakeTimers();
      vi.setSystemTime(1000);

      const result = lex.time();
      expect(result).toBe('0000000000001000');

      vi.useRealTimers();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // lex.reverse()
  // ─────────────────────────────────────────────────────────────────────────

  describe('reverse()', () => {
    it('returns a 16-character string', () => {
      const result = lex.reverse();
      expect(result).toHaveLength(16);
    });

    it('returns reverse chronologically sortable keys', async () => {
      const key1 = lex.reverse();
      await new Promise((r) => setTimeout(r, 10));
      const key2 = lex.reverse();

      // Newer should sort before older
      expect(key2 < key1).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // lex.id()
  // ─────────────────────────────────────────────────────────────────────────

  describe('id()', () => {
    it('returns timestamp without prefix', () => {
      vi.useFakeTimers();
      vi.setSystemTime(1234567890);

      const result = lex.id();
      expect(result).toBe('0000001234567890');

      vi.useRealTimers();
    });

    it('returns prefixed timestamp', () => {
      vi.useFakeTimers();
      vi.setSystemTime(1234567890);

      const result = lex.id('msg');
      expect(result).toBe('msg_0000001234567890');

      vi.useRealTimers();
    });

    it('supports reverse order', () => {
      const normal = lex.id('msg', false);
      const reversed = lex.id('msg', true);

      expect(normal).toMatch(/^msg_\d{16}$/);
      expect(reversed).toMatch(/^msg_\d{16}$/);
      expect(reversed > normal).toBe(true); // Reversed has larger timestamp
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // lex.user()
  // ─────────────────────────────────────────────────────────────────────────

  describe('user()', () => {
    it('creates user-namespaced key with tilde prefix', () => {
      const result = lex.user('ABC123');
      expect(result).toBe('~ABC123');
    });

    it('appends suffix when provided', () => {
      const result = lex.user('ABC123', 'settings');
      expect(result).toBe('~ABC123/settings');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // lex.key()
  // ─────────────────────────────────────────────────────────────────────────

  describe('key()', () => {
    it('joins parts with slash separator', () => {
      const result = lex.key('users', 'alice', 'posts');
      expect(result).toBe('users/alice/posts');
    });

    it('handles single part', () => {
      const result = lex.key('users');
      expect(result).toBe('users');
    });

    it('handles numbers', () => {
      const result = lex.key('posts', 123);
      expect(result).toBe('posts/123');
    });

    it('filters null and undefined values', () => {
      const result = lex.key('posts', null as any, 'draft');
      expect(result).toBe('posts/draft');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // lex.random()
  // ─────────────────────────────────────────────────────────────────────────

  describe('random()', () => {
    it('includes timestamp and random suffix', () => {
      const result = lex.random();
      expect(result).toMatch(/^\d{16}_[a-z0-9]{6}$/);
    });

    it('includes prefix when provided', () => {
      const result = lex.random('item');
      expect(result).toMatch(/^item_\d{16}_[a-z0-9]{6}$/);
    });

    it('generates unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(lex.random());
      }
      expect(ids.size).toBe(100);
    });

    it('supports reverse order', () => {
      const normal = lex.random('msg', false);
      const reversed = lex.random('msg', true);

      // Both should have valid format
      expect(normal).toMatch(/^msg_\d{16}_[a-z0-9]{6}$/);
      expect(reversed).toMatch(/^msg_\d{16}_[a-z0-9]{6}$/);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // lex.timestamp()
  // ─────────────────────────────────────────────────────────────────────────

  describe('timestamp()', () => {
    it('extracts timestamp from simple ID', () => {
      vi.useFakeTimers();
      vi.setSystemTime(1234567890);

      const id = lex.time();
      const result = lex.timestamp(id);
      expect(result).toBe(1234567890);

      vi.useRealTimers();
    });

    it('extracts timestamp from prefixed ID', () => {
      vi.useFakeTimers();
      vi.setSystemTime(1234567890);

      const id = lex.id('msg');
      const result = lex.timestamp(id);
      expect(result).toBe(1234567890);

      vi.useRealTimers();
    });

    it('extracts timestamp from random ID', () => {
      vi.useFakeTimers();
      vi.setSystemTime(1234567890);

      const id = lex.random('msg');
      const result = lex.timestamp(id);
      expect(result).toBe(1234567890);

      vi.useRealTimers();
    });

    it('handles reverse timestamps', () => {
      vi.useFakeTimers();
      vi.setSystemTime(1234567890);

      const id = lex.id('msg', true);
      const result = lex.timestamp(id);
      expect(result).toBe(1234567890);

      vi.useRealTimers();
    });

    it('returns null for invalid format', () => {
      expect(lex.timestamp('invalid')).toBe(null);
      expect(lex.timestamp('a_b_c_d')).toBe(null);
      expect(lex.timestamp('')).toBe(null);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // lex.sort()
  // ─────────────────────────────────────────────────────────────────────────

  describe('sort()', () => {
    it('sorts items by id lexicographically', () => {
      const items = [
        { id: 'msg_002', text: 'Third' },
        { id: 'msg_000', text: 'First' },
        { id: 'msg_001', text: 'Second' },
      ];

      const result = lex.sort(items);

      expect(result[0]!.text).toBe('First');
      expect(result[1]!.text).toBe('Second');
      expect(result[2]!.text).toBe('Third');
    });

    it('does not mutate original array', () => {
      const items = [{ id: 'b' }, { id: 'a' }];
      const result = lex.sort(items);

      expect(items[0]!.id).toBe('b');
      expect(result[0]!.id).toBe('a');
    });

    it('supports reverse order', () => {
      const items = [
        { id: 'msg_000', text: 'First' },
        { id: 'msg_001', text: 'Second' },
        { id: 'msg_002', text: 'Third' },
      ];

      const result = lex.sort(items, true);

      expect(result[0]!.text).toBe('Third');
      expect(result[1]!.text).toBe('Second');
      expect(result[2]!.text).toBe('First');
    });

    it('handles empty array', () => {
      const result = lex.sort([]);
      expect(result).toEqual([]);
    });

    it('handles single item', () => {
      const items = [{ id: 'a' }];
      const result = lex.sort(items);
      expect(result).toEqual([{ id: 'a' }]);
    });
  });
});
