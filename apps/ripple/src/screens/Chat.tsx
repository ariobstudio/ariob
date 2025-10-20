/**
 * Chat Screen
 *
 * Main app screen with 3 tabs:
 * - Friends: List of friends, add new friends
 * - Messages: List of conversations
 * - Profile: User profile and settings
 */

import { useState } from 'react';
import { Column, Row, Text, Button, Input, Icon, useTheme, cn, Tabs, TabsList, TabsTrigger, TabsContent } from '@ariob/ui';
import { graph, useAuth } from '@ariob/core';

interface ChatProps {
  onLogout?: () => void;
}

export function Chat({ onLogout }: ChatProps = {}) {
  const { withTheme } = useTheme();
  const g = graph();
  const { user, logout } = useAuth(g);

  const handleLogout = () => {
    'background only';
    logout();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <page className={cn(withTheme('', 'dark'), "bg-background w-full h-full flex flex-col pb-safe-bottom pt-safe-top")}>
      <Tabs defaultValue="messages" className="w-full h-full flex flex-col">
        {/* Header */}
        <view className="w-full px-6 py-4 border-b border-border">
          <Row className="items-center justify-between">
            <Text size="xl" weight="bold">
              Ripple
            </Text>
          </Row>
        </view>

        {/* Tab Content */}
        <view className="flex-1 w-full overflow-hidden">
          <TabsContent value="friends" className="h-full mt-0">
            <FriendsTab />
          </TabsContent>

          <TabsContent value="messages" className="h-full mt-0">
            <MessagesTab />
          </TabsContent>

          <TabsContent value="profile" className="h-full mt-0">
            <ProfileTab user={user} onLogout={handleLogout} />
          </TabsContent>
        </view>

        {/* Bottom Tab Navigation */}
        <view className="w-full border-t border-border bg-card">
          <TabsList className="w-full bg-transparent p-0 h-auto rounded-none gap-0">
            <TabsTrigger
              value="friends"
              className="flex-1 rounded-none py-4 data-[state=active]:bg-primary/10"
            >
              <Column className="items-center" spacing="xs">
                <Icon name="users" size="default" />
                <Text size="xs">Friends</Text>
              </Column>
            </TabsTrigger>

            <TabsTrigger
              value="messages"
              className="flex-1 rounded-none py-4 data-[state=active]:bg-primary/10"
            >
              <Column className="items-center" spacing="xs">
                <Icon name="message-circle" size="default" />
                <Text size="xs">Messages</Text>
              </Column>
            </TabsTrigger>

            <TabsTrigger
              value="profile"
              className="flex-1 rounded-none py-4 data-[state=active]:bg-primary/10"
            >
              <Column className="items-center" spacing="xs">
                <Icon name="user" size="default" />
                <Text size="xs">Profile</Text>
              </Column>
            </TabsTrigger>
          </TabsList>
        </view>
      </Tabs>
    </page>
  );
}

// Friends Tab
function FriendsTab() {
  const [searchInput, setSearchInput] = useState('');

  // TODO: Use createCollection('friends') here
  const friends: any[] = [];

  return (
    <Column className="w-full h-full p-6" spacing="md">
      {/* Search/Add friend */}
      <Column spacing="sm">
        <Input
          value={searchInput}
          onChange={(value) => {
            'background only';
            setSearchInput(value);
          }}
          placeholder="Enter friend's public key"
          className="w-full"
        />
        <Button
          onTap={() => {
            'background only';
            // TODO: Add friend logic
            console.log('Add friend:', searchInput);
          }}
          className="w-full"
          disabled={!searchInput.trim()}
        >
          Add Friend
        </Button>
      </Column>

      {/* Friends list */}
      {friends.length === 0 ? (
        <Column className="flex-1 items-center justify-center px-8" spacing="sm">
          <view className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-2">
            <Icon name="users" size="default" className="text-muted-foreground" />
          </view>
          <Text weight="semibold" className="text-center">
            No Friends Yet
          </Text>
          <Text variant="muted" size="sm" className="text-center max-w-xs">
            Add friends by entering their public key above
          </Text>
        </Column>
      ) : (
        <Column spacing="sm" className="flex-1">
          {friends.map((friend: any) => (
            <view key={friend.id} className="p-4 bg-card rounded-lg border border-border">
              <Row className="items-center justify-between">
                <Column>
                  <Text weight="bold">{friend.data.alias || 'Unknown'}</Text>
                  <Text size="xs" variant="muted" className="font-mono">
                    {friend.data.pub.substring(0, 20)}...
                  </Text>
                </Column>
                <Button variant="outline" size="sm">
                  Message
                </Button>
              </Row>
            </view>
          ))}
        </Column>
      )}
    </Column>
  );
}

// Messages Tab
function MessagesTab() {
  // TODO: Use createCollection('conversations') here
  const conversations: any[] = [];

  return (
    <Column className="w-full h-full p-6">
      {conversations.length === 0 ? (
        <Column className="flex-1 items-center justify-center px-8" spacing="sm">
          <view className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-2">
            <Icon name="message-circle" size="default" className="text-muted-foreground" />
          </view>
          <Text weight="semibold" className="text-center">
            No Messages Yet
          </Text>
          <Text variant="muted" size="sm" className="text-center max-w-xs">
            Add friends to start messaging
          </Text>
        </Column>
      ) : (
        <Column spacing="sm">
          {conversations.map((conv: any) => (
            <Button
              key={conv.id}
              variant="ghost"
              className="w-full p-4 justify-start"
              onTap={() => {
                'background only';
                // TODO: Navigate to conversation
                console.log('Open conversation:', conv.id);
              }}
            >
              <Row className="w-full items-center justify-between">
                <Column className="items-start">
                  <Text weight="bold">{conv.data.withUser}</Text>
                  <Text size="sm" variant="muted">
                    {conv.data.lastMessage}
                  </Text>
                </Column>
                {conv.data.unreadCount > 0 && (
                  <view className="px-2 py-1 bg-primary rounded-full">
                    <Text size="xs" className="text-primary-foreground">
                      {conv.data.unreadCount}
                    </Text>
                  </view>
                )}
              </Row>
            </Button>
          ))}
        </Column>
      )}
    </Column>
  );
}

// Profile Tab
function ProfileTab({ user, onLogout }: { user: any; onLogout: () => void }) {
  const { currentTheme, setTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [showThemeOptions, setShowThemeOptions] = useState(false);

  const handleCopyPubKey = () => {
    'background only';
    // TODO: Implement clipboard copy
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleThemeSelect = (theme: 'Light' | 'Dark' | 'Auto') => {
    'background only';
    setTheme(theme);
    setShowThemeOptions(false);
  };

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'Light':
        return 'sun';
      case 'Dark':
        return 'moon';
      case 'Auto':
        return 'monitor';
      default:
        return 'monitor';
    }
  };

  const getThemeLabel = () => {
    switch (currentTheme) {
      case 'Light':
        return 'Light';
      case 'Dark':
        return 'Dark';
      case 'Auto':
        return 'Auto';
      default:
        return 'Auto';
    }
  };

  return (
    <Column className="w-full h-full overflow-scroll">
      <Column className="w-full p-6" spacing="lg">
        {/* User info */}
        <Column spacing="md" className="items-center text-center pb-4">
          <view className="w-20 h-20 bg-primary rounded-full items-center justify-center">
            <Icon name="user" size="default" className="text-primary-foreground" />
          </view>

          <Column spacing="xs" className="items-center">
            <Text size="xl" weight="bold">
              {user?.alias || 'Anonymous'}
            </Text>
            <Text size="xs" variant="muted" className="font-mono">
              {user?.pub ? `${user.pub.substring(0, 16)}...` : 'No public key'}
            </Text>
          </Column>
        </Column>

        {/* Account Section */}
        <Column spacing="sm">
          <Text size="xs" weight="semibold" variant="muted" className="px-1 uppercase tracking-wider">
            Account
          </Text>

          <Button
            onTap={handleCopyPubKey}
            variant="outline"
            className="w-full justify-start"
          >
            <Row className="items-center gap-3">
              <Icon name={copied ? 'check' : 'copy'} size="sm" />
              <Text>{copied ? 'Copied!' : 'Copy Public Key'}</Text>
            </Row>
          </Button>
        </Column>

        {/* Display Settings Section */}
        <Column spacing="sm">
          <Text size="xs" weight="semibold" variant="muted" className="px-1 uppercase tracking-wider">
            Display
          </Text>

          <view className="w-full">
            <Button
              onTap={() => {
                'background only';
                setShowThemeOptions(!showThemeOptions);
              }}
              variant="outline"
              className="w-full justify-between"
            >
              <Row className="items-center gap-3">
                <Icon name="palette" size="sm" />
                <Text>Theme</Text>
              </Row>
              <Row className="items-center gap-2">
                <Icon name={getThemeIcon()} size="sm" className="text-muted-foreground" />
                <Text variant="muted">{getThemeLabel()}</Text>
              </Row>
            </Button>

            {showThemeOptions && (
              <Column spacing="xs" className="mt-2 p-2 bg-muted/50 rounded-lg">
                <Button
                  onTap={() => handleThemeSelect('Light')}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    currentTheme === 'Light' && "bg-primary/10"
                  )}
                >
                  <Row className="items-center gap-3 w-full">
                    <Icon name="sun" size="sm" />
                    <Text className={currentTheme === 'Light' ? 'text-primary font-semibold' : ''}>
                      Light
                    </Text>
                    {currentTheme === 'Light' && <Icon name="check" size="sm" className="ml-auto text-primary" />}
                  </Row>
                </Button>

                <Button
                  onTap={() => handleThemeSelect('Dark')}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    currentTheme === 'Dark' && "bg-primary/10"
                  )}
                >
                  <Row className="items-center gap-3 w-full">
                    <Icon name="moon" size="sm" />
                    <Text className={currentTheme === 'Dark' ? 'text-primary font-semibold' : ''}>
                      Dark
                    </Text>
                    {currentTheme === 'Dark' && <Icon name="check" size="sm" className="ml-auto text-primary" />}
                  </Row>
                </Button>

                <Button
                  onTap={() => handleThemeSelect('Auto')}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    currentTheme === 'Auto' && "bg-primary/10"
                  )}
                >
                  <Row className="items-center gap-3 w-full">
                    <Icon name="monitor" size="sm" />
                    <Text className={currentTheme === 'Auto' ? 'text-primary font-semibold' : ''}>
                      Auto (System)
                    </Text>
                    {currentTheme === 'Auto' && <Icon name="check" size="sm" className="ml-auto text-primary" />}
                  </Row>
                </Button>
              </Column>
            )}
          </view>
        </Column>

        {/* Actions Section */}
        <Column spacing="sm">
          <Text size="xs" weight="semibold" variant="muted" className="px-1 uppercase tracking-wider">
            Actions
          </Text>

          <Button
            onTap={() => {
              'background only';
              onLogout();
            }}
            variant="destructive"
            className="w-full justify-start"
          >
            <Row className="items-center gap-3">
              <Icon name="log-out" size="sm" />
              <Text>Logout</Text>
            </Row>
          </Button>
        </Column>

        {/* Privacy Info */}
        <view className="px-3 py-4 mt-2">
          <Column spacing="xs" className="items-center text-center">
            <Icon name="shield" size="sm" className="text-muted-foreground mb-1" />
            <Text size="xs" variant="muted">
              Your keys are stored locally and encrypted.
            </Text>
            <Text size="xs" variant="muted">
              Make sure to back them up securely.
            </Text>
          </Column>
        </view>

        {/* App Info */}
        <view className="pb-4">
          <Text variant="muted" size="xs" className="text-center">
            Ariob Ripple v0.1.0
          </Text>
        </view>
      </Column>
    </Column>
  );
}
