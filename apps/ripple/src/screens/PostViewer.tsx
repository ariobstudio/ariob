/**
 * PostViewer Screen
 *
 * Display a single post with full content and metadata.
 * Future: Add comments/replies support.
 */

import { useState, useEffect } from '@lynx-js/react';
import { Column, Row, Button, Text, Icon, useTheme, cn } from '@ariob/ui';
import { graph, collection } from '@ariob/core';
import { PostSchema, type Post } from '@ariob/ripple';

export interface PostViewerProps {
  /** Post ID to display */
  postId?: string;
  /** Pre-loaded post data (optional) */
  post?: Post;
  /** Called when user wants to go back */
  onBack?: () => void;
}

/**
 * PostViewer displays a single post with full details
 */
export function PostViewer({ postId, post: initialPost, onBack }: PostViewerProps) {
  const { withTheme } = useTheme();
  const [post, setPost] = useState<Post | null>(initialPost || null);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState<string | null>(null);

  // Load post if not provided
  useEffect(() => {
    'background only';

    if (!initialPost && postId) {
      const g = graph();

      g.get('posts').get(postId).once((data: any) => {
        if (!data) {
          setError('Post not found');
          setLoading(false);
          return;
        }

        const validation = PostSchema.safeParse(data);
        if (validation.success) {
          setPost(validation.data);
          setLoading(false);
        } else {
          console.error('[PostViewer] Invalid post data:', validation.error);
          setError('Invalid post data');
          setLoading(false);
        }
      });
    }
  }, [postId, initialPost]);

  const handleBack = () => {
    'background only';
    if (onBack) onBack();
  };

  // Loading state
  if (loading) {
    return (
      <page className={cn(withTheme('', 'dark'), "bg-background w-full h-full pb-safe-bottom pt-safe-top")}>
        <Column className="w-full h-full items-center justify-center" spacing="md">
          <Text variant="muted">Loading post...</Text>
        </Column>
      </page>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <page className={withTheme('bg-background w-full h-full', 'dark bg-background w-full h-full')}>
        <Column className="w-full h-full" spacing="none">
          {/* Header */}
          <view className="w-full px-4 py-3 border-b border-border">
            <Row className="w-full items-center" spacing="sm">
              <Button variant="ghost" size="sm" bindtap={handleBack}>
                <Icon name="arrow-left" size="sm" />
              </Button>
              <Text weight="semibold">Post</Text>
            </Row>
          </view>

          {/* Error Content */}
          <Column className="flex-1 w-full items-center justify-center p-6" spacing="md">
            <Text variant="destructive">{error || 'Post not found'}</Text>
            <Button variant="outline" bindtap={handleBack}>
              Go Back
            </Button>
          </Column>
        </Column>
      </page>
    );
  }

  const formattedDate = new Date(post.created).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const degreeLabel = post.degree === '0' ? 'Personal' : post.degree === '1' ? 'Friends' : 'Extended';

  return (
    <page className={withTheme('bg-background w-full h-full', 'dark bg-background w-full h-full')}>
      <Column className="w-full h-full" spacing="none">
        {/* Header */}
        <view className="w-full px-4 py-3 border-b border-border">
          <Row className="w-full items-center" spacing="sm">
            <Button variant="ghost" size="sm" bindtap={handleBack}>
              <Icon name="arrow-left" size="sm" />
            </Button>
            <Text weight="semibold">Post</Text>
          </Row>
        </view>

        {/* Post Content */}
        <view className="flex-1 w-full overflow-auto">
          <Column className="w-full p-6" spacing="lg">
            {/* Author Info */}
            <Row className="items-center" spacing="sm">
              <view className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon name="user" size="sm" />
              </view>
              <Column spacing="xs">
                <Text weight="semibold">
                  {post.authorAlias || post.author.substring(0, 16) + '...'}
                </Text>
                <Text size="sm" variant="muted">{formattedDate}</Text>
              </Column>
            </Row>

            {/* Post Content */}
            <view className="w-full">
              <Text className="whitespace-pre-wrap">{post.content}</Text>
            </view>

            {/* Metadata */}
            <Row className="w-full gap-3">
              <view className="flex-1 p-3 rounded-lg bg-muted">
                <Column spacing="xs">
                  <Text size="xs" variant="muted">Visibility</Text>
                  <Text size="sm" weight="medium">{degreeLabel}</Text>
                </Column>
              </view>

              {post.tags && post.tags.length > 0 && (
                <view className="flex-1 p-3 rounded-lg bg-muted">
                  <Column spacing="xs">
                    <Text size="xs" variant="muted">Tags</Text>
                    <Text size="sm">{post.tags.join(', ')}</Text>
                  </Column>
                </view>
              )}
            </Row>

            {post.editedAt && (
              <Text size="xs" variant="muted">
                Edited {new Date(post.editedAt).toLocaleString()}
              </Text>
            )}

            {/* Future: Comments section */}
            <view className="w-full p-4 rounded-lg border border-dashed border-border">
              <Text size="sm" variant="muted" className="text-center">
                Comments coming soon...
              </Text>
            </view>
          </Column>
        </view>
      </Column>
    </page>
  );
}
