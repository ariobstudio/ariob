/**
 * CreatePost Screen
 *
 * Compose and publish text posts with degree selection.
 */

import { useState } from '@lynx-js/react';
import { Column, Row, Button, Text, useTheme } from '@ariob/ui';
import { PageLayout } from '../components/Layout';
import { graph, useAuth, Result } from '@ariob/core';
import { useFeed, type Degree, type Post } from '@ariob/ripple';

export interface CreatePostProps {
  /** Initial degree for the post (defaults to '1') */
  initialDegree?: Degree;
  /** Called when post is successfully published */
  onSuccess?: () => void;
  /** Called when user cancels */
  onCancel?: () => void;
}

/**
 * CreatePost allows users to compose and publish text posts
 */
export function CreatePost({ initialDegree = '1', onSuccess, onCancel }: CreatePostProps) {
  const { withTheme } = useTheme();
  const g = graph();
  const { user } = useAuth(g);

  const [content, setContent] = useState('');
  const [degree, setDegree] = useState<Degree>(initialDegree);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { post: publishPost } = useFeed({ degree });

  const handleCancel = () => {
    'background only';
    if (onCancel) onCancel();
  };

  const handlePost = async () => {
    'background only';

    if (!user) {
      setError('You must be logged in to post');
      return;
    }

    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      const postData: Omit<Post, 'type' | 'created' | '#'> = {
        content: content.trim(),
        author: user.pub,
        authorAlias: user.alias,
        degree,
      };

      const result = await publishPost(postData);

      if (result.ok) {
        console.log('[CreatePost] Post published:', result.value);
        if (onSuccess) onSuccess();
      } else {
        console.error('[CreatePost] Error publishing post:', result.error);
        setError(result.error.message || 'Failed to publish post');
      }
    } catch (err) {
      console.error('[CreatePost] Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'Unexpected error occurred');
    } finally {
      setIsPosting(false);
    }
  };

  const degreeOptions: { value: Degree; label: string; description: string }[] = [
    { value: '0', label: 'Personal', description: 'Only visible to you' },
    { value: '1', label: 'Friends', description: 'Visible to your direct connections' },
    { value: '2', label: 'Extended', description: 'Visible to friends-of-friends' },
  ];

  const characterCount = content.length;
  const maxCharacters = 10000;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <PageLayout>
      <Column className="w-full h-full" spacing="none">
        {/* Header */}
        <view className="w-full px-4 py-3 border-b border-border">
          <Row className="w-full items-center justify-between">
            <Button variant="ghost" size="sm" bindtap={handleCancel}>
              Cancel
            </Button>
            <Text weight="semibold">Create Post</Text>
            <Button
              variant="default"
              size="sm"
              disabled={isPosting || !content.trim() || isOverLimit}
              bindtap={handlePost}
            >
              {isPosting ? 'Posting...' : 'Post'}
            </Button>
          </Row>
        </view>

        {/* Content Area */}
        <Column className="flex-1 w-full px-4 py-4" spacing="md">
          {/* Text Input */}
          <textarea
            className={withTheme(
              'w-full h-48 p-3 bg-muted rounded-lg border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring',
              'dark w-full h-48 p-3 bg-muted rounded-lg border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring'
            )}
            placeholder="What's on your mind?"
            value={content}
            maxlength={maxCharacters}
            bindinput={(e: any) => {
              'background only';
              setContent(e.detail.value || '');
            }}
          />

          {/* Character Count */}
          <Row className="w-full justify-end">
            <Text
              size="sm"
              variant={isOverLimit ? 'destructive' : 'muted'}
            >
              {characterCount} / {maxCharacters}
            </Text>
          </Row>

          {/* Degree Selector */}
          <Column spacing="sm">
            <Text size="sm" weight="medium">Visibility</Text>
            <Row className="w-full gap-2">
              {degreeOptions.map((option) => {
                const isSelected = degree === option.value;
                return (
                  <view
                    key={option.value}
                    className={withTheme(
                      isSelected
                        ? 'flex-1 p-3 rounded-lg border-2 border-primary bg-primary/10'
                        : 'flex-1 p-3 rounded-lg border border-input bg-muted',
                      isSelected
                        ? 'dark flex-1 p-3 rounded-lg border-2 border-primary bg-primary/10'
                        : 'dark flex-1 p-3 rounded-lg border border-input bg-muted'
                    )}
                    bindtap={() => {
                      'background only';
                      setDegree(option.value);
                    }}
                  >
                    <Column spacing="xs">
                      <Text size="sm" weight="semibold">
                        {option.label}
                      </Text>
                      <Text size="xs" variant="muted">
                        {option.description}
                      </Text>
                    </Column>
                  </view>
                );
              })}
            </Row>
          </Column>

          {/* Error Message */}
          {error && (
            <view className="w-full p-3 rounded-lg bg-destructive/10 border border-destructive">
              <Text size="sm" variant="destructive">{error}</Text>
            </view>
          )}
        </Column>
      </Column>
    </PageLayout>
  );
}
