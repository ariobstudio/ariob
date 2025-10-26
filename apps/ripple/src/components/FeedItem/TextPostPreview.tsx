/**
 * TextPostPreview
 *
 * Preview card for blog-style text posts.
 * Shows title/content snippet, author, and timestamp.
 */

import { Column, Row, Text, cn } from '@ariob/ui';
import type { Post } from '@ariob/ripple';
import { TypeBadge } from '../MediaSignatures/TypeBadge';
import { AccentStrip } from '../MediaSignatures/AccentStrip';

export interface TextPostPreviewProps {
  /** Post data */
  post: Post;
  /** Whether this preview is focused */
  isFocused?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Formats timestamp as relative time (e.g., "2h ago")
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * TextPostPreview displays a blog post in the unified feed.
 * Includes media signature (icon, accent strip) and content preview.
 */
export function TextPostPreview({ post, isFocused = false, className }: TextPostPreviewProps) {
  // Truncate content for preview (max 3 lines, ~150 chars)
  const previewContent = post.content.length > 150
    ? post.content.substring(0, 150) + '...'
    : post.content;

  return (
    <view className={cn('relative w-full bg-card border border-border rounded-lg overflow-hidden', className)}>
      {/* Accent strip (left edge) */}
      <AccentStrip color="blue" />

      {/* Content */}
      <Column className="p-4" spacing="sm">
        {/* Header */}
        <Row className="items-center justify-between">
          <Row className="items-center gap-2">
            <TypeBadge type="post" />
            <Text size="sm" weight="semibold">
              {post.authorAlias || 'Anonymous'}
            </Text>
          </Row>

          <Text size="xs" variant="muted">
            {formatRelativeTime(post.created)}
          </Text>
        </Row>

        {/* Content preview */}
        <view className="w-full">
          <Text className="line-clamp-3 whitespace-pre-wrap">
            {previewContent}
          </Text>
        </view>

        {/* Metadata (shown when focused) */}
        {isFocused && (
          <Row className="items-center gap-3 pt-2 border-t border-border animate-fadeIn">
            <Text size="xs" variant="muted">
              Degree: {post.degree}°
            </Text>
            {post.tags && post.tags.length > 0 && (
              <Row className="items-center gap-1">
                {post.tags.slice(0, 3).map((tag: string) => (
                  <view key={tag} className="px-2 py-0.5 bg-muted rounded-full">
                    <Text size="xs" variant="muted">#{tag}</Text>
                  </view>
                ))}
              </Row>
            )}
          </Row>
        )}
      </Column>
    </view>
  );
}
