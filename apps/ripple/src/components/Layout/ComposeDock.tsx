/**
 * ComposeDock
 *
 * Floating action button at the bottom of the feed.
 * Expands to show create options (post, message).
 */

import { useState } from '@lynx-js/react';
import { Row, Column, Button, Icon, Text, cn } from '@ariob/ui';

export interface ComposeDockProps {
  /** Create post handler */
  onCreatePost?: () => void;
  /** Create message handler */
  onCreateMessage?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ComposeDock provides a floating action button for content creation.
 * Expands to show post/message options.
 */
export function ComposeDock({
  onCreatePost,
  onCreateMessage,
  className,
}: ComposeDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCreatePost = () => {
    'background only';
    setIsExpanded(false);
    onCreatePost?.();
  };

  const handleCreateMessage = () => {
    'background only';
    setIsExpanded(false);
    onCreateMessage?.();
  };

  return (
    <view className={cn('absolute bottom-6 right-6 z-50', className)}>
      <Column className="items-end" spacing="sm">
        {/* Expanded options */}
        {isExpanded && (
          <Column spacing="xs" className="animate-slideInRight">
            {/* Create Post */}
            <Button
              onTap={handleCreatePost}
              variant="secondary"
            >
              <Row className="items-center gap-2">
                <Icon name="file-text" size="sm" />
                <Text>New Post</Text>
              </Row>
            </Button>

            {/* Create Message */}
            <Button
              onTap={handleCreateMessage}
              variant="secondary"
            >
              <Row className="items-center gap-2">
                <Icon name="message-circle" size="sm" />
                <Text>New Message</Text>
              </Row>
            </Button>
          </Column>
        )}

        {/* Main FAB */}
        <Button
          onTap={() => {
            'background only';
            setIsExpanded(!isExpanded);
          }}
          size="lg"
          className="rounded-full p-2"
          // className={cn('transition-transform', isExpanded && 'rotate-45')}
        >
          <Icon name="plus" size="lg" />
        </Button>
      </Column>
    </view>
  );
}
