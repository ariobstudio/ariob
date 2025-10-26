/**
 * MessageThread Screen
 *
 * Display a DM conversation with message history and input.
 */

import { useState, useEffect } from '@lynx-js/react';
import { Column, Row, Button, Text, Icon, useTheme, cn } from '@ariob/ui';
import { graph, useAuth, collection, type Item } from '@ariob/core';
import { MessageSchema, createThreadId, type Message, type ThreadMetadata } from '@ariob/ripple';

export interface MessageThreadProps {
  /** Thread ID to display */
  threadId?: string;
  /** Pre-loaded thread metadata (optional) */
  thread?: ThreadMetadata;
  /** Recipient public key (required if no threadId) */
  recipientPub?: string;
  /** Recipient alias for display */
  recipientAlias?: string;
  /** Current user's public key */
  currentUserPub?: string;
  /** Called when user wants to go back */
  onBack?: () => void;
}

/**
 * MessageThread displays a DM conversation
 */
export function MessageThread({
  threadId: initialThreadId,
  thread,
  recipientPub,
  recipientAlias,
  currentUserPub,
  onBack,
}: MessageThreadProps) {
  const { withTheme } = useTheme();
  const g = graph();
  const { user } = useAuth(g);

  const [messages, setMessages] = useState<Item<Message>[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine thread ID
  const threadId = initialThreadId || (user && recipientPub ? createThreadId(user.pub, recipientPub) : null);

  // Subscribe to messages
  useEffect(() => {
    'background only';

    if (!threadId) return;

    const collectionKey = `thread-${threadId}`;

    // Subscribe to thread messages
    const ref = g.get('threads').get(threadId).get('messages');
    collection(collectionKey).map(ref, MessageSchema);

    // Get messages from collection
    const unsubscribe = setInterval(() => {
      const items = collection(collectionKey).get();
      setMessages([...items].sort((a, b) => a.data.created - b.data.created));
    }, 500);

    return () => {
      clearInterval(unsubscribe);
      collection(collectionKey).off();
    };
  }, [threadId]);

  const handleBack = () => {
    'background only';
    if (onBack) onBack();
  };

  const handleSend = async () => {
    'background only';

    if (!user || !recipientPub || !threadId) {
      setError('Missing required information');
      return;
    }

    if (!messageText.trim()) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const message: Message = {
        type: 'message',
        text: messageText.trim(),
        from: user.pub,
        to: recipientPub,
        threadId,
        created: Date.now(),
        encrypted: true,
        read: false,
      };

      const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

      // Save message
      await new Promise<void>((resolve, reject) => {
        g.get('threads')
          .get(threadId)
          .get('messages')
          .get(messageId)
          .put(message as any, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err));
            } else {
              resolve();
            }
          });
      });

      // Update thread metadata
      await new Promise<void>((resolve, reject) => {
        g.get('threads')
          .get(threadId)
          .put(
            {
              lastMessage: message.text.substring(0, 100),
              lastMessageAt: message.created,
            } as any,
            (ack: any) => {
              if (ack.err) {
                reject(new Error(ack.err));
              } else {
                resolve();
              }
            }
          );
      });

      setMessageText('');
    } catch (err) {
      console.error('[MessageThread] Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (!threadId) {
    return (
      <page className={cn(withTheme('', 'dark'), "bg-background w-full h-full pb-safe-bottom pt-safe-top")}>
        <Column className="w-full h-full items-center justify-center" spacing="md">
          <Text variant="destructive">Thread ID not found</Text>
          <Button variant="outline" bindtap={handleBack}>
            Go Back
          </Button>
        </Column>
      </page>
    );
  }

  const displayName = recipientAlias || thread?.participants.find(p => p !== currentUserPub)?.substring(0, 16) + '...' || 'Unknown';

  return (
    <page className={withTheme('bg-background w-full h-full', 'dark bg-background w-full h-full')}>
      <Column className="w-full h-full" spacing="none">
        {/* Header */}
        <view className="w-full px-4 py-3 border-b border-border">
          <Row className="w-full items-center justify-between">
            <Row className="items-center" spacing="sm">
              <Button variant="ghost" size="sm" bindtap={handleBack}>
                <Icon name="arrow-left" size="sm" />
              </Button>
              <view className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon name="user" size="sm" />
              </view>
              <Text weight="semibold">{displayName}</Text>
            </Row>
            <Icon name="lock" size="sm" />
          </Row>
        </view>

        {/* Messages List */}
        <view className="flex-1 w-full overflow-auto px-4 py-4">
          {messages.length === 0 ? (
            <Column className="w-full h-full items-center justify-center" spacing="sm">
              <Text variant="muted">No messages yet</Text>
              <Text variant="muted" size="sm">Start the conversation below</Text>
            </Column>
          ) : (
            <Column spacing="md">
              {messages.map((item) => {
                const message = item.data;
                const isCurrentUser = message.from === user?.pub;
                const time = new Date(message.created).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                });

                return (
                  <view
                    key={item.id}
                    className={isCurrentUser ? 'w-full flex justify-end' : 'w-full flex justify-start'}
                  >
                    <view
                      className={withTheme(
                        isCurrentUser
                          ? 'max-w-[80%] p-3 rounded-lg bg-primary text-primary-foreground'
                          : 'max-w-[80%] p-3 rounded-lg bg-muted',
                        isCurrentUser
                          ? 'dark max-w-[80%] p-3 rounded-lg bg-primary text-primary-foreground'
                          : 'dark max-w-[80%] p-3 rounded-lg bg-muted'
                      )}
                    >
                      <Column spacing="xs">
                        <Text className="whitespace-pre-wrap">{message.text}</Text>
                        <Text size="xs" variant="muted" className="text-right">
                          {time}
                        </Text>
                      </Column>
                    </view>
                  </view>
                );
              })}
            </Column>
          )}
        </view>

        {/* Error Display */}
        {error && (
          <view className="w-full px-4 py-2">
            <view className="w-full p-2 rounded-lg bg-destructive/10 border border-destructive">
              <Text size="sm" variant="destructive">{error}</Text>
            </view>
          </view>
        )}

        {/* Message Input */}
        <view className="w-full px-4 py-3 border-t border-border">
          <Row className="w-full items-end" spacing="sm">
            <textarea
              className={withTheme(
                'flex-1 p-3 bg-muted rounded-lg border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring',
                'dark flex-1 p-3 bg-muted rounded-lg border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              placeholder="Type a message..."
              value={messageText}
              rows={1}
              bindinput={(e: any) => {
                'background only';
                setMessageText(e.detail.value || '');
              }}
            />
            <Button
              variant="default"
              size="sm"
              disabled={isSending || !messageText.trim()}
              bindtap={handleSend}
            >
              {isSending ? '...' : 'Send'}
            </Button>
          </Row>
        </view>
      </Column>
    </page>
  );
}
