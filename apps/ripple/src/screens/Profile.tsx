/**
 * Profile Screen
 *
 * Display user profile, settings, and account management.
 */

import { useState } from '@lynx-js/react';
import { Column, Row, Button, Text, Icon } from '@ariob/ui';
import { PageLayout } from '../components/Layout';
import type { IGunChainReference } from '@ariob/core';
import { useAuth } from '@ariob/core';
import { useProfile } from '../utils/profile';

export interface ProfileProps {
  /** Gun graph instance */
  graph: IGunChainReference;
  /** Called when user logs out */
  onLogout?: () => void;
  /** Called when user wants to go back */
  onBack?: () => void;
}

/**
 * Profile displays user information and settings
 */
export function Profile({ graph, onLogout, onBack }: ProfileProps) {
  const { user, logout } = useAuth(graph);
  const { profile, loading: profileLoading } = useProfile(graph);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    'background only';

    console.log('>>>>> [Profile] ========== LOGOUT ATTEMPT ==========');
    console.log('>>>>> [Profile] User pub:', user?.pub ? user.pub.substring(0, 50) + '...' : 'N/A');

    if (!confirm('Are you sure you want to log out?')) {
      console.log('>>>>> [Profile] Logout cancelled by user');
      console.log('>>>>> [Profile] =================================================');
      return;
    }

    console.log('>>>>> [Profile] Logout confirmed, calling logout()...');
    setIsLoggingOut(true);

    try {
      await logout();
      console.log('>>>>> [Profile] ✅ User logged out successfully');
      console.log('>>>>> [Profile] Calling onLogout callback...');
      console.log('>>>>> [Profile] =================================================');
      if (onLogout) onLogout();
    } catch (err) {
      console.log('>>>>> [Profile] ❌ Logout FAILED');
      console.log('>>>>> [Profile] Error:', err instanceof Error ? err.message : String(err));
      console.log('>>>>> [Profile] =================================================');
      alert('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleBack = () => {
    'background only';
    if (onBack) onBack();
  };

  if (!user) {
    return (
      <PageLayout>
        <Column className="w-full h-full items-center justify-center" spacing="md">
          <Text variant="muted">No user logged in</Text>
          <Button variant="outline" bindtap={handleBack}>
            Go Back
          </Button>
        </Column>
      </PageLayout>
    );
  }

  const pubKeyShort = user.pub.substring(0, 16) + '...' + user.pub.substring(user.pub.length - 16);

  return (
    <PageLayout>
      <Column className="w-full h-full" spacing="none">
        {/* Header */}
        <view className="w-full px-4 py-3 border-b border-border">
          <Row className="w-full items-center justify-between">
            <Row className="items-center" spacing="sm">
              {onBack && (
                <Button variant="ghost" size="sm" bindtap={handleBack}>
                  <Icon name="arrow-left" size="sm" />
                </Button>
              )}
              <Text weight="semibold">Profile</Text>
            </Row>
          </Row>
        </view>

        {/* Content */}
        <view className="flex-1 w-full overflow-auto">
          <Column className="w-full p-6" spacing="lg">
            {/* Profile Header */}
            <Column className="w-full items-center" spacing="md">
              <view className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon name="user" size="lg" />
              </view>
              <Column className="items-center" spacing="xs">
                <Text size="xl" weight="bold">
                  {profile?.alias || user.alias || 'Anonymous User'}
                </Text>
                <Text size="sm" variant="muted" className="font-mono">
                  {pubKeyShort}
                </Text>
                {profile?.bio && (
                  <Text size="sm" variant="muted" className="text-center max-w-md mt-2">
                    {profile.bio}
                  </Text>
                )}
                {(profile?.location || profile?.website) && (
                  <Row className="mt-2 gap-3" spacing="sm">
                    {profile.location && (
                      <Row spacing="xs" className="items-center">
                        <Icon name="map-pin" size="sm" />
                        <Text size="xs" variant="muted">{profile.location}</Text>
                      </Row>
                    )}
                    {profile.website && (
                      <Row spacing="xs" className="items-center">
                        <Icon name="link" size="sm" />
                        <Text size="xs" variant="muted">{profile.website}</Text>
                      </Row>
                    )}
                  </Row>
                )}
              </Column>
            </Column>

            {/* Account Info */}
            <Column spacing="md">
              <Text size="sm" weight="semibold" variant="muted">
                ACCOUNT INFORMATION
              </Text>

              <view className="w-full p-4 rounded-lg bg-muted border border-input">
                <Column spacing="sm">
                  <Row className="justify-between">
                    <Text size="sm" variant="muted">Username</Text>
                    <Text size="sm" weight="medium">
                      {profile?.alias || user.alias || 'Not set'}
                    </Text>
                  </Row>
                  <Row className="justify-between">
                    <Text size="sm" variant="muted">Public Key</Text>
                    <Text size="xs" className="font-mono">
                      {user.pub.substring(0, 24)}...
                    </Text>
                  </Row>
                  <Row className="justify-between">
                    <Text size="sm" variant="muted">Encryption</Text>
                    <Row spacing="xs">
                      <Icon name="lock" size="sm" />
                      <Text size="sm" weight="medium">End-to-end</Text>
                    </Row>
                  </Row>
                  {profile?.createdAt && (
                    <Row className="justify-between">
                      <Text size="sm" variant="muted">Member Since</Text>
                      <Text size="sm" weight="medium">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </Text>
                    </Row>
                  )}
                </Column>
              </view>
            </Column>

            {/* Settings Section */}
            <Column spacing="md">
              <Text size="sm" weight="semibold" variant="muted">
                SETTINGS
              </Text>

              {/* Theme Setting */}
              <view className="w-full p-4 rounded-lg bg-muted border border-input">
                <Row className="justify-between items-center">
                  <Column spacing="xs">
                    <Text size="sm" weight="medium">Theme</Text>
                    <Text size="xs" variant="muted">
                      Automatically matches system preferences
                    </Text>
                  </Column>
                  <Icon name="sun-moon" size="sm" />
                </Row>
              </view>

              {/* Notifications Setting */}
              <view className="w-full p-4 rounded-lg bg-muted border border-input">
                <Row className="justify-between items-center">
                  <Column spacing="xs">
                    <Text size="sm" weight="medium">Notifications</Text>
                    <Text size="xs" variant="muted">
                      Coming soon
                    </Text>
                  </Column>
                  <Icon name="bell" size="sm" />
                </Row>
              </view>

              {/* Privacy Setting */}
              <view className="w-full p-4 rounded-lg bg-muted border border-input">
                <Row className="justify-between items-center">
                  <Column spacing="xs">
                    <Text size="sm" weight="medium">Privacy</Text>
                    <Text size="xs" variant="muted">
                      All content is encrypted by default
                    </Text>
                  </Column>
                  <Icon name="shield" size="sm" />
                </Row>
              </view>
            </Column>

            {/* About Section */}
            <Column spacing="md">
              <Text size="sm" weight="semibold" variant="muted">
                ABOUT
              </Text>

              <view className="w-full p-4 rounded-lg bg-muted border border-input">
                <Column spacing="sm">
                  <Text size="sm" weight="medium">Ripple</Text>
                  <Text size="xs" variant="muted">
                    Decentralized social network powered by Gun.js
                  </Text>
                  <Text size="xs" variant="muted">
                    Version 1.0.0
                  </Text>
                </Column>
              </view>
            </Column>

            {/* Logout Button */}
            <view className="w-full pt-4">
              <Button
                variant="destructive"
                className="w-full"
                disabled={isLoggingOut}
                bindtap={handleLogout}
              >
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </Button>
            </view>

            {/* Spacer */}
            <view className="h-8" />
          </Column>
        </view>
      </Column>
    </PageLayout>
  );
}
