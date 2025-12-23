/**
 * Schema - Base schema tests
 *
 * Tests for Thing and Who base schemas.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { Thing, Who } from '../schema';

describe('Schema', () => {
  // ─────────────────────────────────────────────────────────────────────────
  // Thing
  // ─────────────────────────────────────────────────────────────────────────

  describe('Thing', () => {
    it('validates minimal object', () => {
      const result = Thing.safeParse({});
      expect(result.success).toBe(true);
    });

    it('accepts optional soul (#)', () => {
      const result = Thing.safeParse({ '#': 'abc123' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data['#']).toBe('abc123');
      }
    });

    it('rejects non-string soul', () => {
      const result = Thing.safeParse({ '#': 123 });
      expect(result.success).toBe(false);
    });

    it('can be extended', () => {
      const TodoSchema = Thing.extend({
        title: z.string(),
        done: z.boolean(),
      });

      const result = TodoSchema.safeParse({
        '#': 'todo-1',
        title: 'Buy milk',
        done: false,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Buy milk');
        expect(result.data.done).toBe(false);
      }
    });

    it('strips unknown properties', () => {
      const result = Thing.safeParse({
        '#': 'abc',
        unknown: 'value',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('unknown');
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Who
  // ─────────────────────────────────────────────────────────────────────────

  describe('Who', () => {
    const validWho = {
      pub: 'publicKey123',
      epub: 'encryptionKey456',
      alias: 'alice',
    };

    it('validates complete Who object', () => {
      const result = Who.safeParse(validWho);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pub).toBe('publicKey123');
        expect(result.data.epub).toBe('encryptionKey456');
        expect(result.data.alias).toBe('alice');
      }
    });

    it('accepts optional soul', () => {
      const result = Who.safeParse({
        ...validWho,
        '#': 'user-1',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data['#']).toBe('user-1');
      }
    });

    it('rejects missing pub', () => {
      const result = Who.safeParse({
        epub: 'encryptionKey456',
        alias: 'alice',
      });

      expect(result.success).toBe(false);
    });

    it('rejects missing epub', () => {
      const result = Who.safeParse({
        pub: 'publicKey123',
        alias: 'alice',
      });

      expect(result.success).toBe(false);
    });

    it('rejects missing alias', () => {
      const result = Who.safeParse({
        pub: 'publicKey123',
        epub: 'encryptionKey456',
      });

      expect(result.success).toBe(false);
    });

    it('extends Thing', () => {
      // Who should include Thing's optional soul
      const result = Who.safeParse({
        '#': 'soul-123',
        pub: 'pub',
        epub: 'epub',
        alias: 'name',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data['#']).toBe('soul-123');
      }
    });

    it('can be extended for profiles', () => {
      const ProfileSchema = Who.extend({
        bio: z.string().optional(),
        avatar: z.string().url().optional(),
      });

      const result = ProfileSchema.safeParse({
        pub: 'pub',
        epub: 'epub',
        alias: 'alice',
        bio: 'Hello world!',
        avatar: 'https://example.com/avatar.png',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bio).toBe('Hello world!');
        expect(result.data.avatar).toBe('https://example.com/avatar.png');
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Type inference
  // ─────────────────────────────────────────────────────────────────────────

  describe('Type inference', () => {
    it('Thing type is inferable', () => {
      type ThingType = z.infer<typeof Thing>;
      const thing: ThingType = { '#': 'abc' };
      expect(thing['#']).toBe('abc');
    });

    it('Who type is inferable', () => {
      type WhoType = z.infer<typeof Who>;
      const who: WhoType = {
        pub: 'pub',
        epub: 'epub',
        alias: 'alice',
      };
      expect(who.alias).toBe('alice');
    });
  });
});
