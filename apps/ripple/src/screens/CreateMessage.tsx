/**
 * CreateMessage Screen
 *
 * Compose and send direct messages to other users.
 */

import { useState } from '@lynx-js/react';
import { Column, Row, Button, Text, useTheme } from '@ariob/ui';
import { graph, useAuth } from '@ariob/core';
import { useFeed, createThreadId, type Message } from '@ariob/ripple';

export interface CreateMessageProps {
  /** Recipient public key (optional - can be selected in UI) */
  recipientPub?: string;
  /** Recipient alias/name for display */
  recipientAlias?: string;
  /** Called when message is successfully sent */
  onSuccess?: () => void;
  /** Called when user cancels */
  onCancel?: () => void;
}

/**
 * CreateMessage allows users to compose and send direct messages
 */
export function CreateMessage({
  recipientPub,
  recipientAlias,
  onSuccess,
  onCancel,
}: CreateMessageProps) {
  const { withTheme } = useTheme();
  const g = graph();
  const { user } = useAuth(g);

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { sendMessage } = useFeed({ degree: '1' }); // DMs are degree 1

  const handleCancel = () => {
    'background only';
    if (onCancel) onCancel();
  };

  const handleSend = async () => {
    'background only';

    if (!user) {
      setError('You must be logged in to send messages');
      return;
    }

    if (!recipientPub) {
      setError('Please select a recipient');
      return;
    }

    if (!messageText.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const threadId = createThreadId(user.pub, recipientPub);

      const messageData: Omit<Message, 'type' | 'created' | 'encrypted' | 'read' | '#'> = {
        text: messageText.trim(),
        from: user.pub,
        to: recipientPub,
        threadId,
      };

      const result = await sendMessage(messageData);

      if (result.ok) {
        console.log('[CreateMessage] Message sent:', result.value);
        if (onSuccess) onSuccess();
      } else {
        console.error('[CreateMessage] Error sending message:', result.error);
        setError(result.error.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('[CreateMessage] Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'Unexpected error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const characterCount = messageText.length;
  const maxCharacters = 5000;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <page className={withTheme('bg-background w-full h-full', 'dark bg-background w-full h-full')}>
      <Column className="w-full h-full" spacing="none">
        {/* Header */}
        <view className="w-full px-4 py-3 border-b border-border">
          <Row className="w-full items-center justify-between">
            <Button variant="ghost" size="sm" bindtap={handleCancel}>
              Cancel
            </Button>
            <Text weight="semibold">New Message</Text>
            <Button
              variant="default"
              size="sm"
              disabled={isSending || !messageText.trim() || !recipientPub || isOverLimit}
              bindtap={handleSend}
            >
              {isSending ? 'Sending...' : 'Send'}
            </Button>
          </Row>
        </view>

        {/* Content Area */}
        <Column className="flex-1 w-full px-4 py-4" spacing="md">
          {/* Recipient Display */}
          {recipientPub ? (
            <view className="w-full p-3 rounded-lg bg-muted border border-input">
              <Row className="items-center" spacing="sm">
                <Text size="sm" variant="muted">To:</Text>
                <Text size="sm" weight="medium">
                  {recipientAlias || recipientPub.substring(0, 16) + '...'}
                </Text>
              </Row>
            </view>
          ) : (
            <view className="w-full p-3 rounded-lg bg-muted border border-input">
              <Text size="sm" variant="muted">Select a recipient to start messaging</Text>
            </view>
          )}

          {/* Message Input */}
          <textarea
            className={withTheme(
              'w-full h-48 p-3 bg-muted rounded-lg border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring',
              'dark w-full h-48 p-3 bg-muted rounded-lg border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring'
            )}
            placeholder="Type your message..."
            value={messageText}
            maxlength={maxCharacters}
            bindinput={(e: any) => {
              'background only';
              setMessageText(e.detail.value || '');
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

          {/* Info Box */}
          <view className="w-full p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Column spacing="xs">
              <Text size="sm" weight="medium">End-to-end encrypted</Text>
              <Text size="xs" variant="muted">
                Your messages are encrypted and only visible to you and the recipient
              </Text>
            </Column>
          </view>

          {/* Error Message */}
          {error && (
            <view className="w-full p-3 rounded-lg bg-destructive/10 border border-destructive">
              <Text size="sm" variant="destructive">{error}</Text>
            </view>
          )}
        </Column>
      </Column>
    </page>
  );
}
