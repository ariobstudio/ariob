/**
 * Thread Feature Bundle
 *
 * Full-screen viewer for posts and DM conversations.
 */

import { root, useState } from '@lynx-js/react';
import type { IGunChainReference } from '@ariob/core';
import { graph } from '@ariob/core';
import type { Navigator } from '../components';
import { createNavigator } from '../components';
import type { Post, ThreadMetadata } from '@ariob/ripple';

// Import thread screens
import { PostViewer } from '../screens/PostViewer';
import { MessageThread } from '../screens/MessageThread';

export interface ThreadFeatureProps {
  data?: {
    /** Type of thread to display */
    type?: 'post' | 'thread';
    /** Thread/Post ID */
    id?: string;
    /** Pre-loaded item data (optional) */
    item?: Post | ThreadMetadata;
    /** Recipient info for messages */
    recipientPub?: string;
    recipientAlias?: string;
    /** Current user's public key */
    currentUserPub?: string;
  };
  navigator: Navigator;
  graph: IGunChainReference;
}

/**
 * ThreadFeature routes to the appropriate thread viewer screen
 */
export function ThreadFeature({ data, navigator, graph }: ThreadFeatureProps) {
  const type = data?.type || 'post';

  const handleBack = () => {
    'background only';
    console.log('[Thread] Going back');
    navigator.goBack();
  };

  // Route to message thread viewer
  if (type === 'thread') {
    const thread = data?.item && 'threadId' in data.item ? data.item : undefined;

    return (
      <MessageThread
        threadId={data?.id || thread?.threadId}
        thread={thread}
        recipientPub={data?.recipientPub}
        recipientAlias={data?.recipientAlias}
        currentUserPub={data?.currentUserPub}
        onBack={handleBack}
      />
    );
  }

  // Default to post viewer
  const post = data?.item && 'content' in data.item ? data.item : undefined;

  return (
    <PostViewer
      postId={data?.id}
      post={post}
      onBack={handleBack}
    />
  );
}

export default function ThreadFeatureRoot() {
  const g = graph();
  const navigator = createNavigator('thread');
  return <ThreadFeature navigator={navigator} graph={g} />;
}
