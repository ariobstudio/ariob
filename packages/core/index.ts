/**
 * @ariob/core
 *
 * Minimal, modular Gun.js primitives for LynxJS.
 * 8 core exports following Gun/SEA coding style.
 */

// ============================================================================
// Core Primitives
// ============================================================================

// Schema - Thing & Who base schemas
export { Thing, Who } from './schema';
export type { Thing as ThingType, Who as WhoType } from './schema';

// Graph - Singleton + instances
export { graph, createGraph, graphStore, addPeersToGraph } from './graph';
export type { GunOptions, GunInstance, GunUser, IGunChainReference, KeyPair } from './graph';

// Node - Single object management (imperative + reactive hooks)
export { node, useNode, createNode } from './node';
export type { NodeConfig } from './node';

// Collection - Sets/maps management (imperative + reactive hooks)
export { collection, useCollection, createCollection } from './collection';
export type { Item, CollectionConfig } from './collection';

// Crypto - SEA primitives
export {
  pair,
  sign,
  verify,
  encrypt,
  decrypt,
  work,
  secret,
  certify,
  encryptData,
  decryptData,
  isEncrypted,
} from './crypto';

// Auth - Authentication
export { useAuth, authStore, createAccount, login, logout, recall } from './auth';
export type { User, AuthResult } from './auth';

// Result - Error handling
export { Result, isOk, isErr } from './result';
export type { Ok, Err } from './result';

// Zod - Schema validation
export { z } from 'zod';

// Store - State management utilities
export { createStore, useStore, useStoreSelector } from './utils/createStore';
export type { Store } from './utils/createStore';

// Config - Configuration management
export {
  getPeers,
  setPeers,
  addPeer,
  removePeer,
  resetPeers,
  getPeerConfig,
  DEFAULT_PEERS,
  PEER_PROFILES,
  loadProfile,
  getCurrentProfile,
} from './config';
export type { PeerConfig, PeerProfile } from './config';

// Mesh - DAM layer peer management and monitoring
export {
  initMeshMonitoring,
  getPeerStatus,
  getAllPeers,
  addPeer as addMeshPeer,
  removePeer as removeMeshPeer,
  resetMeshStats,
  useMesh,
  usePeer,
  meshStore,
} from './mesh';
export type { PeerStatus } from './mesh';

// ============================================================================
// Utility Hooks (Optional - separate import)
// ============================================================================

export { default as useTapLock } from './hooks/useTapLock';
export { default as useInput } from './hooks/useInput';
export { default as useDebounce } from './hooks/useDebounce';
export { default as useIntersection } from './hooks/useIntersection';
export { default as useMainThreadImperativeHandle } from './hooks/useMainThreadImperativeHandle';
export { default as useTimeout } from './hooks/useTimeout';
export { default as useTimeoutFn } from './hooks/useTimeoutFn';
export { default as useUpdate } from './hooks/useUpdate';
export { useKeyboard } from './hooks/useKeyboard';

export type { TapLockDirection, UseTapLockOptions } from './hooks/useTapLock';
export type { UseDebounceReturn } from './hooks/useDebounce';
export type { InputEvent, InputInputEvent, UseInputOptions } from './hooks/useInput';
export type { IntersectionObserverOptions } from './hooks/useIntersection';
export type { UseTimeoutReturn } from './hooks/useTimeout';
export type { UseTimeoutFnReturn } from './hooks/useTimeoutFn';
export type { UseKeyboardResult } from './hooks/useKeyboard';
