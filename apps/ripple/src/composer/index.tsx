/**
 * Composer Feature Bundle
 *
 * Create posts and send messages.
 */

import { root, useState } from '@lynx-js/react';
import type { IGunChainReference } from '@ariob/core';
import { graph } from '@ariob/core';
import type { Navigator } from '../components';
import { createNavigator } from '../components';
import type { Degree } from '@ariob/ripple';

// Import composer screens
import { CreatePost } from '../screens/CreatePost';
import { CreateMessage } from '../screens/CreateMessage';

export interface ComposerFeatureProps {
  data?: {
    /** Type of content to create */
    type?: 'post' | 'message';
    /** Initial degree for posts */
    degree?: Degree;
    /** Recipient public key for messages */
    recipientPub?: string;
    /** Recipient alias for messages */
    recipientAlias?: string;
  };
  navigator: Navigator;
  graph: IGunChainReference;
}

/**
 * ComposerFeature routes to the appropriate composer screen
 */
export function ComposerFeature({ data, navigator, graph }: ComposerFeatureProps) {
  const type = data?.type || 'post';

  const handleSuccess = () => {
    'background only';
    console.log('[Composer] Content created successfully, going back');
    navigator.goBack();
  };

  const handleCancel = () => {
    'background only';
    console.log('[Composer] Cancelled, going back');
    navigator.goBack();
  };

  // Route to the appropriate composer screen
  if (type === 'message') {
    return (
      <CreateMessage
        recipientPub={data?.recipientPub}
        recipientAlias={data?.recipientAlias}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  // Default to post composer
  return (
    <CreatePost
      initialDegree={data?.degree}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}

export default function ComposerFeatureRoot() {
  const g = graph();
  const navigator = createNavigator('composer');
  return <ComposerFeature navigator={navigator} graph={g} />;
}
