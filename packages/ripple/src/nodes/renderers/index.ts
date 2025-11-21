/**
 * Node Renderers Registry
 *
 * Registers all node renderers and provides initialization function.
 */

import { registerNodes } from '../registry';
import type { NodeRegistryEntry } from '../types';

// Import all node renderers
import { TextPostNodeRenderer } from './TextPostNode';
import { ImagePostNodeRenderer } from './ImagePostNode';
import { VideoPostNodeRenderer } from './VideoPostNode';
import { PollNodeRenderer } from './PollNode';
import { ShareNodeRenderer } from './ShareNode';
import { MessageThreadNodeRenderer } from './MessageThreadNode';

/**
 * All node registry entries
 */
const ALL_NODES: NodeRegistryEntry[] = [
  // Text Post
  {
    type: 'post',
    renderer: TextPostNodeRenderer,
    metadata: {
      supportsImmersive: false,
      defaultView: 'full',
      displayName: 'Text Post',
      icon: 'document-text',
    },
  },

  // Image Post
  {
    type: 'image-post',
    renderer: ImagePostNodeRenderer,
    metadata: {
      supportsImmersive: false,
      defaultView: 'full',
      displayName: 'Image Post',
      icon: 'image',
    },
  },

  // Video Post (with TikTok immersive)
  {
    type: 'video-post',
    renderer: VideoPostNodeRenderer,
    metadata: {
      supportsImmersive: true,
      defaultView: 'immersive',
      displayName: 'Video Post',
      icon: 'videocam',
    },
  },

  // Poll
  {
    type: 'poll',
    renderer: PollNodeRenderer,
    metadata: {
      supportsImmersive: false,
      defaultView: 'full',
      displayName: 'Poll',
      icon: 'bar-chart',
    },
  },

  // Share
  {
    type: 'share',
    renderer: ShareNodeRenderer,
    metadata: {
      supportsImmersive: false,
      defaultView: 'full',
      displayName: 'Shared Post',
      icon: 'repeat',
    },
  },

  // Message Thread (with chat immersive)
  {
    type: 'thread',
    renderer: MessageThreadNodeRenderer,
    metadata: {
      supportsImmersive: true,
      defaultView: 'immersive',
      displayName: 'Message',
      icon: 'chatbubbles',
    },
  },
];

/**
 * Initialize all node renderers
 *
 * Call this once at app startup before rendering any nodes.
 *
 * @example
 * ```typescript
 * import { initializeNodeRenderers } from '@ariob/ripple/nodes';
 *
 * // In your app entry point
 * initializeNodeRenderers();
 * ```
 */
export function initializeNodeRenderers(): void {
  registerNodes(ALL_NODES);
  console.log(`[Ripple] Registered ${ALL_NODES.length} node renderers`);
}

/**
 * Re-export individual renderers for custom use
 */
export {
  TextPostNodeRenderer,
  ImagePostNodeRenderer,
  VideoPostNodeRenderer,
  PollNodeRenderer,
  ShareNodeRenderer,
  MessageThreadNodeRenderer,
};
