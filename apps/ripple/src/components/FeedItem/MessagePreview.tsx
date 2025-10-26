/**
 * MessagePreview
 *
 * Preview card for DM threads.
 * Shows last message, participants, and unread count.
 */

import { Column, Row, Text, Icon, cn } from '@ariob/ui';
import type { ThreadMetadata } from '@ariob/ripple';
import { TypeBadge } from '../MediaSignatures/TypeBadge';
import { AccentStrip } from '../MediaSignatures/AccentStrip';

export interface MessagePreviewProps {
  /** Thread metadata */
  thread: ThreadMetadata;
  /** Current user's public key (to determine other participant) */
  currentUserPub?: string;
  /** Whether this preview is focused */
  isFocused?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Formats timestamp as relative time
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * MessagePreview displays a DM thread in the unified feed.
 * Shows chat bubble stack, lock icon for E2E, and unread badge.
 */
export function MessagePreview({ thread, currentUserPub, isFocused = false, className }: MessagePreviewProps) {
  // Get other participant (for now, just show count)
  const participantCount = thread.participants?.length || 2;
  const isGroup = participantCount > 2;

  // Truncate last message
  const previewMessage = thread.lastMessage && thread.lastMessage.length > 60
    ? thread.lastMessage.substring(0, 60) + '...'
    : thread.lastMessage || 'No messages yet';

  return (
    <view className={cn('relative w-full bg-card border border-border rounded-lg overflow-hidden', className)}>
      {/* Accent strip (left edge) */}
      <AccentStrip color="green" />

      {/* Content */}
      <Column className="p-4" spacing="sm">
        {/* Header */}
        <Row className="items-center justify-between">
          <Row className="items-center gap-2">
            <TypeBadge type="message" />
            <Text size="sm" weight="semibold">
              {isGroup ? `Group (${participantCount})` : 'Direct Message'}
            </Text>
            <Icon name="lock" size="sm" className="text-muted-foreground" />
          </Row>

          {thread.lastMessageAt && (
            <Text size="xs" variant="muted">
              {formatRelativeTime(thread.lastMessageAt)}
            </Text>
          )}
        </Row>

        {/* Last message preview */}
        <view className="w-full">
          <Text variant="muted" size="sm" className="line-clamp-2 italic">
            {previewMessage}
          </Text>
        </view>

        {/* Unread badge & metadata */}
        <Row className="items-center justify-between pt-2">
          {thread.unreadCount > 0 ? (
            <view className="px-2 py-1 bg-primary rounded-full">
              <Text size="xs" weight="semibold" className="text-primary-foreground">
                {thread.unreadCount} unread
              </Text>
            </view>
          ) : (
            <view />
          )}

          {/* Participants ring (shown when focused) */}
          {isFocused && (
            <Row className="items-center gap-1 animate-fadeIn">
              <Icon name="users" size="sm" className="text-muted-foreground" />
              <Text size="xs" variant="muted">
                {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
              </Text>
            </Row>
          )}
        </Row>
      </Column>
    </view>
  );
}
