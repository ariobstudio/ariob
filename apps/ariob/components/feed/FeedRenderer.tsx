/**
 * FeedRenderer - Config-driven feed item renderer
 *
 * Renders feed items based on their configuration type.
 */

import type { User } from '@ariob/core';
import type { FeedItemConfig } from '../../config/feed.config';
import { AICard } from '../../features/ai';
import { ProfileCard } from '../../features/profile';

export interface FeedRendererProps {
  config: FeedItemConfig;
  user: User | null;
  onProfilePress: () => void;
  onAIPress: () => void;
}

export function FeedRenderer({
  config,
  user,
  onProfilePress,
  onAIPress,
}: FeedRendererProps) {
  switch (config.type) {
    case 'profile':
      return user ? <ProfileCard user={user} onPress={onProfilePress} /> : null;
    case 'ai':
      return <AICard onPress={onAIPress} />;
    default:
      return null;
  }
}
