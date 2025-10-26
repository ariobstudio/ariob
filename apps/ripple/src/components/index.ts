/**
 * Shared Components
 *
 * Reusable components for Ripple features.
 */

// FeedItem components
export { FeedItemWrapper, type FeedItemWrapperProps } from './FeedItem/FeedItemWrapper';
export { FeedItemSkeleton, type FeedItemSkeletonProps } from './FeedItem/FeedItemSkeleton';
export { TextPostPreview, type TextPostPreviewProps } from './FeedItem/TextPostPreview';
export { MessagePreview, type MessagePreviewProps } from './FeedItem/MessagePreview';

// Layout components
export { DiscoveryBar, type DiscoveryBarProps } from './Layout/DiscoveryBar';
export { DegreeIndicator, type DegreeIndicatorProps } from './Layout/DegreeIndicator';
export { ComposeDock, type ComposeDockProps } from './Layout/ComposeDock';

// Media Signatures
export { TypeBadge, type TypeBadgeProps } from './MediaSignatures/TypeBadge';
export { AccentStrip, type AccentStripProps } from './MediaSignatures/AccentStrip';

// Navigation
export {
  useNavigator,
  NavigatorContainer,
  createNavigator,
  type Navigator,
  type FeatureName,
  type NavigationFrame,
  type NavigatorProps,
  type NavigationEvent,
  type NavigationEventPayload,
  type NavigationListener,
} from './Navigation';
