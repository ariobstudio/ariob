/**
 * Mesh - DAM-Aware Peer Management
 *
 * Utilities for managing Gun's mesh network (DAM layer).
 * Monitor peer health, manage connections, handle reconnections.
 *
 * @module mesh
 */

import React from 'react';
import { graph } from './graph';
import { define } from './utils/store';

/**
 * Peer status tracking
 */
export interface PeerStatus {
  /** Peer URL */
  url: string;
  /** Whether peer is connected */
  connected: boolean;
  /** Last message timestamp */
  lastSeen: number;
  /** Round-trip latency in ms (optional) */
  latency?: number;
  /** Messages pending in queue */
  queueSize?: number;
  /** Incoming message count */
  messagesIn: number;
  /** Outgoing message count */
  messagesOut: number;
}

/**
 * Mesh store state
 */
interface MeshState {
  /** Map of peer URL to status */
  peers: Record<string, PeerStatus>;
  /** Total messages received from all peers */
  totalMessagesIn: number;
  /** Total messages sent to all peers */
  totalMessagesOut: number;
  /** Whether monitoring is active */
  monitoring: boolean;
}

/**
 * Mesh store instance
 */
const meshStore = define<MeshState>({
  peers: {},
  totalMessagesIn: 0,
  totalMessagesOut: 0,
  monitoring: false,
});

/**
 * Initialize mesh monitoring on Gun instance.
 * Called automatically by useMesh() and usePeer() hooks.
 * Can also be called manually during app initialization for early setup.
 *
 * @example
 * ```typescript
 * import { initMeshMonitoring } from '@ariob/core';
 *
 * // Optional: Initialize early for immediate tracking
 * initMeshMonitoring();
 * ```
 */
export function initMeshMonitoring(): void {
  const state = meshStore.getState();
  if (state.monitoring) {
    return; // Already initialized
  }

  const gun = graph();

  // Monitor outgoing messages
  gun.on('out', () => {
    const state = meshStore.getState();
    meshStore.setState({
      totalMessagesOut: state.totalMessagesOut + 1,
    });

    // Update per-peer counters if we can identify the peer
    // Gun's wire protocol doesn't always expose peer info here
    // This is a limitation of Gun's DAM layer
  });

  // Monitor incoming messages
  gun.on('in', () => {
    const state = meshStore.getState();
    meshStore.setState({
      totalMessagesIn: state.totalMessagesIn + 1,
    });

    // Update last seen for all connected peers
    const now = Date.now();
    const updatedPeers: Record<string, PeerStatus> = {};
    for (const [url, peer] of Object.entries(state.peers)) {
      if (peer.connected) {
        updatedPeers[url] = {
          ...peer,
          lastSeen: now,
          messagesIn: peer.messagesIn + 1,
        };
      } else {
        updatedPeers[url] = peer;
      }
    }

    meshStore.setState({
      peers: updatedPeers,
    });
  });

  meshStore.setState({ monitoring: true });
  console.log('[Mesh] Monitoring initialized');
}

/**
 * Get current peer status.
 *
 * @param url - Peer URL
 * @returns Peer status or null if not found
 *
 * @example
 * ```typescript
 * const status = getPeerStatus('http://localhost:8765/gun');
 * if (status) {
 *   console.log('Connected:', status.connected);
 *   console.log('Messages:', status.messagesIn, status.messagesOut);
 * }
 * ```
 */
export function getPeerStatus(url: string): PeerStatus | null {
  return meshStore.getState().peers[url] || null;
}

/**
 * Get all peers status.
 *
 * @returns Array of peer statuses
 *
 * @example
 * ```typescript
 * const peers = getAllPeers();
 * console.log(`Connected peers: ${peers.filter(p => p.connected).length}`);
 * ```
 */
export function getAllPeers(): PeerStatus[] {
  return Object.values(meshStore.getState().peers);
}

/**
 * Add peer dynamically (uses Gun.opt()).
 * The peer will be added to Gun's mesh network immediately.
 *
 * @param url - Peer URL to add
 *
 * @example
 * ```typescript
 * // Add a new relay peer
 * addPeer('wss://relay.example.com/gun');
 *
 * // In a component
 * function AddPeerButton() {
 *   return (
 *     <button onTap={() => addPeer('wss://relay2.com/gun')}>
 *       Add Peer
 *     </button>
 *   );
 * }
 * ```
 */
export function addPeer(url: string): void {
  const gun = graph();
  gun.opt({ peers: [url] });

  // Initialize peer status
  const state = meshStore.getState();
  meshStore.setState({
    peers: {
      ...state.peers,
      [url]: {
        url,
        connected: false,
        lastSeen: 0,
        messagesIn: 0,
        messagesOut: 0,
      },
    },
  });

  console.log('[Mesh] Peer added:', url);
}

/**
 * Remove peer from tracking.
 * Note: Gun doesn't provide a direct way to disconnect a peer,
 * so this only removes it from our tracking.
 *
 * @param url - Peer URL to remove
 *
 * @example
 * ```typescript
 * removePeer('wss://old-relay.com/gun');
 * ```
 */
export function removePeer(url: string): void {
  const state = meshStore.getState();
  const { [url]: removed, ...rest } = state.peers;

  meshStore.setState({
    peers: rest,
  });

  console.log('[Mesh] Peer removed from tracking:', url);
}

/**
 * React hook for mesh status.
 * Provides real-time updates on peer connections and message counts.
 * Auto-initializes monitoring on first call.
 *
 * @returns Mesh status with peers array and message counters
 *
 * @example
 * ```typescript
 * function NetworkStatus() {
 *   const { peers, totalIn, totalOut } = useMesh();
 *
 *   const connectedCount = peers.filter(p => p.connected).length;
 *
 *   return (
 *     <view>
 *       <text>Peers: {connectedCount}/{peers.length}</text>
 *       <text>Messages: ↓{totalIn} ↑{totalOut}</text>
 *     </view>
 *   );
 * }
 * ```
 */
export function useMesh() {
  // Get peers object (stable reference)
  const peersObj = meshStore((s) => s.peers);
  const totalIn = meshStore((s) => s.totalMessagesIn);
  const totalOut = meshStore((s) => s.totalMessagesOut);
  const monitoring = meshStore((s) => s.monitoring);

  // Convert to array with useMemo to prevent infinite re-renders
  // Object.values() creates a new array each time, triggering re-renders
  const peers = React.useMemo(() => Object.values(peersObj), [peersObj]);

  // Auto-initialize monitoring on first use
  if (!monitoring) {
    initMeshMonitoring();
  }

  return { peers, totalIn, totalOut, monitoring };
}

/**
 * React hook for specific peer status.
 * Subscribe to a single peer's connection status and metrics.
 * Auto-initializes monitoring on first call.
 *
 * @param url - Peer URL to monitor
 * @returns Peer status or null if not found
 *
 * @example
 * ```typescript
 * function PeerMonitor({ url }: { url: string }) {
 *   const peer = usePeer(url);
 *
 *   if (!peer) return <text>Peer not found</text>;
 *
 *   return (
 *     <view>
 *       <text>URL: {peer.url}</text>
 *       <text>Status: {peer.connected ? '🟢' : '🔴'}</text>
 *       <text>Last seen: {new Date(peer.lastSeen).toLocaleTimeString()}</text>
 *       <text>Messages: ↓{peer.messagesIn} ↑{peer.messagesOut}</text>
 *     </view>
 *   );
 * }
 * ```
 */
export function usePeer(url: string) {
  const monitoring = meshStore((s) => s.monitoring);

  // Auto-initialize monitoring on first use
  if (!monitoring) {
    initMeshMonitoring();
  }

  return meshStore((s) => s.peers[url] || null);
}

/**
 * Reset mesh statistics.
 * Clears message counters but keeps peer list.
 *
 * @example
 * ```typescript
 * // Reset counters for new monitoring session
 * resetMeshStats();
 * ```
 */
export function resetMeshStats(): void {
  const state = meshStore.getState();
  const resetPeers: Record<string, PeerStatus> = {};

  for (const [url, peer] of Object.entries(state.peers)) {
    resetPeers[url] = {
      ...peer,
      messagesIn: 0,
      messagesOut: 0,
    };
  }

  meshStore.setState({
    peers: resetPeers,
    totalMessagesIn: 0,
    totalMessagesOut: 0,
  });

  console.log('[Mesh] Statistics reset');
}

// Export store for advanced use
export { meshStore };
