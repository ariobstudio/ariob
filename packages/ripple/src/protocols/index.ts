/**
 * Protocols - Core interfaces for Ripple extensibility
 *
 * This module exports the type system for the block editor-inspired architecture:
 * - Bar protocol: Stack-based navigation with frames
 * - Node protocol: Nodes define their own bar context
 */

// Bar protocol
export {
  type ActionSlot,
  type BarMode,
  type BarFrame,
  type BarStoreState,
  type BarStoreActions,
  type BarStore,
  getCurrentFrame,
  canGoBack,
  createBaseFrame,
} from './bar';

// Node protocol
export {
  type NodeContext,
  type NodeProtocol,
  type CreateNodeContextParams,
  registerNode,
  getNode,
  getAllNodes,
  hasNode,
  createNode,
  createNodeContext,
} from './node';
