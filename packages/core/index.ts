/*** @ariob/core ***/

// ============================================================================
// Core Primitives
// ============================================================================

// Schema - Thing & Who base schemas
export { Thing, Who } from './schema';
export type { Thing as ThingType, Who as WhoType } from './schema';

// Graph - Singleton + instances
export { init, graph, createGraph, graphStore, addPeersToGraph } from './graph';
export type { GunOptions, GunInstance, GunUser, IGunChainReference, KeyPair } from './graph';

// Node - Single object management (imperative + reactive hooks)
export { node, useNode } from './node';
export type { NodeConfig } from './node';

// Collection - Sets/maps management (imperative + reactive hooks)
export { collection, useCollection, collectionStore } from './collection';
export type { Item, CollectionConfig, SortDirection } from './collection';

// Lex - Lexical ordering utilities for Gun
export { lex } from './lex';

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
export { useAuth, authStore, create, auth, leave, recall } from './auth';
export type { User, AuthResult } from './auth';

// User Profile - Profile management
export { useUserProfile } from './userProfile';
export type { UserProfile } from './userProfile';

// Result - Error handling
export { Result, isOk, isErr } from './result';
export type { Ok, Err } from './result';

// Zod - Schema validation
export { z } from 'zod';

// Store - Zustand-powered state management
export { store, define } from './utils/store';
export type { Store } from './utils/store';

// LocalStorage - Native storage wrapper
export { LocalStorage, getStorage, getLocalStorage, useLocalStorage } from './localStorage';

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
// Utility Hooks
// ============================================================================

export { default as useInput } from './hooks/useInput';
export { default as useDebounce } from './hooks/useDebounce';
export { default as useIntersection } from './hooks/useIntersection';
export { default as useTimeout } from './hooks/useTimeout';

export type { UseDebounceReturn } from './hooks/useDebounce';
export type { InputEvent, InputDetail, UseInputOptions } from './hooks/useInput';
export type { IntersectionResult, IntersectionOptions } from './hooks/useIntersection';
export type { UseTimeoutReturn } from './hooks/useTimeout';
export type { UseTimeoutFnReturn } from './hooks/useTimeoutFn';