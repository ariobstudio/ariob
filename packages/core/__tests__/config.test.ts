/**
 * Config - Peer configuration tests
 *
 * Tests for Gun.js peer configuration management.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPeers,
  setPeers,
  addPeer,
  removePeer,
  resetPeers,
  getPeerConfig,
  loadProfile,
  getCurrentProfile,
  DEFAULT_PEERS,
  PEER_PROFILES,
} from '../config';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

describe('Config', () => {
  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.clear();
    vi.clearAllMocks();

    // Set up globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // getPeers()
  // ─────────────────────────────────────────────────────────────────────────

  describe('getPeers()', () => {
    it('returns default peers when storage is empty', () => {
      const peers = getPeers();
      expect(peers).toEqual(DEFAULT_PEERS);
    });

    it('returns stored peers when available', () => {
      const storedPeers = ['ws://custom.relay.com/gun'];
      localStorageMock.setItem('gun-peers', JSON.stringify(storedPeers));

      const peers = getPeers();
      expect(peers).toEqual(storedPeers);
    });

    it('returns defaults for invalid stored data', () => {
      localStorageMock.setItem('gun-peers', 'not valid json');

      const peers = getPeers();
      expect(peers).toEqual(DEFAULT_PEERS);
    });

    it('returns defaults for non-array stored data', () => {
      localStorageMock.setItem('gun-peers', JSON.stringify({ not: 'array' }));

      const peers = getPeers();
      expect(peers).toEqual(DEFAULT_PEERS);
    });

    it('returns defaults for array with non-string items', () => {
      localStorageMock.setItem('gun-peers', JSON.stringify([123, 456]));

      const peers = getPeers();
      expect(peers).toEqual(DEFAULT_PEERS);
    });

    it('returns defaults for empty array', () => {
      localStorageMock.setItem('gun-peers', JSON.stringify([]));

      const peers = getPeers();
      expect(peers).toEqual(DEFAULT_PEERS);
    });

    it('returns copy of peers (not reference)', () => {
      const peers1 = getPeers();
      const peers2 = getPeers();

      expect(peers1).not.toBe(peers2);
      expect(peers1).toEqual(peers2);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // setPeers()
  // ─────────────────────────────────────────────────────────────────────────

  describe('setPeers()', () => {
    it('saves peers to storage', () => {
      const peers = ['ws://relay1.com/gun', 'ws://relay2.com/gun'];
      setPeers(peers);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'gun-peers',
        JSON.stringify(peers)
      );
    });

    it('throws for non-array input', () => {
      expect(() => setPeers('not an array' as any)).toThrow('Peers must be an array');
    });

    it('throws for array with non-string items', () => {
      expect(() => setPeers([123, 456] as any)).toThrow('All peers must be strings');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // addPeer()
  // ─────────────────────────────────────────────────────────────────────────

  describe('addPeer()', () => {
    it('adds new peer to list', () => {
      const newPeer = 'ws://new-relay.com/gun';
      addPeer(newPeer);

      const peers = getPeers();
      expect(peers).toContain(newPeer);
    });

    it('does not add duplicate peers', () => {
      const existingPeer = DEFAULT_PEERS[0]!;
      const initialPeers = getPeers();

      addPeer(existingPeer);

      const peers = getPeers();
      expect(peers.filter((p) => p === existingPeer).length).toBe(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // removePeer()
  // ─────────────────────────────────────────────────────────────────────────

  describe('removePeer()', () => {
    it('removes existing peer', () => {
      // First add an extra peer so we have more than defaults
      const extraPeer = 'ws://extra-relay.com/gun';
      addPeer(extraPeer);

      // Verify it was added
      expect(getPeers()).toContain(extraPeer);

      // Now remove it
      removePeer(extraPeer);

      // Verify it's gone
      const peers = getPeers();
      expect(peers).not.toContain(extraPeer);
      // Should still have default peers
      expect(peers).toContain(DEFAULT_PEERS[0]!);
    });

    it('handles non-existent peer gracefully', () => {
      const originalPeers = getPeers();
      removePeer('ws://non-existent.com/gun');

      // Should still have original peers
      expect(getPeers().length).toBe(originalPeers.length);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // resetPeers()
  // ─────────────────────────────────────────────────────────────────────────

  describe('resetPeers()', () => {
    it('resets to default peers', () => {
      // First, set custom peers
      setPeers(['ws://custom.com/gun']);
      expect(getPeers()).toEqual(['ws://custom.com/gun']);

      // Then reset
      resetPeers();

      expect(getPeers()).toEqual(DEFAULT_PEERS);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // getPeerConfig()
  // ─────────────────────────────────────────────────────────────────────────

  describe('getPeerConfig()', () => {
    it('returns config object with peers array', () => {
      const config = getPeerConfig();

      expect(config).toHaveProperty('peers');
      expect(Array.isArray(config.peers)).toBe(true);
    });

    it('uses current peers', () => {
      const customPeers = ['ws://custom.com/gun'];
      setPeers(customPeers);

      const config = getPeerConfig();
      expect(config.peers).toEqual(customPeers);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // PEER_PROFILES
  // ─────────────────────────────────────────────────────────────────────────

  describe('PEER_PROFILES', () => {
    it('has local profile', () => {
      expect(PEER_PROFILES.local).toBeDefined();
      expect(PEER_PROFILES.local.name).toBe('Local Development');
      expect(PEER_PROFILES.local.peers).toContain('http://localhost:8765/gun');
    });

    it('has dev profile', () => {
      expect(PEER_PROFILES.dev).toBeDefined();
      expect(PEER_PROFILES.dev.name).toBe('Development');
    });

    it('has staging profile', () => {
      expect(PEER_PROFILES.staging).toBeDefined();
      expect(PEER_PROFILES.staging.peers.length).toBeGreaterThan(0);
    });

    it('has prod profile with multiple relays', () => {
      expect(PEER_PROFILES.prod).toBeDefined();
      expect(PEER_PROFILES.prod.peers.length).toBeGreaterThan(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // loadProfile()
  // ─────────────────────────────────────────────────────────────────────────

  describe('loadProfile()', () => {
    it('loads local profile', () => {
      loadProfile('local');

      const peers = getPeers();
      expect(peers).toEqual(PEER_PROFILES.local.peers);
    });

    it('loads prod profile', () => {
      loadProfile('prod');

      const peers = getPeers();
      expect(peers).toEqual(PEER_PROFILES.prod.peers);
    });

    it('throws for unknown profile', () => {
      expect(() => loadProfile('unknown' as any)).toThrow('Unknown profile: unknown');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // getCurrentProfile()
  // ─────────────────────────────────────────────────────────────────────────

  describe('getCurrentProfile()', () => {
    it('returns profile name when matching', () => {
      loadProfile('local');

      const profile = getCurrentProfile();
      expect(profile).toBe('local');
    });

    it('returns null for custom peers', () => {
      setPeers(['ws://custom.relay.com/gun']);

      const profile = getCurrentProfile();
      expect(profile).toBe(null);
    });

    it('returns dev profile when using default peers', () => {
      // Reset to defaults (which match dev profile)
      resetPeers();

      const profile = getCurrentProfile();
      expect(profile).toBe('dev');
    });
  });
});
