/**
 * Settings Screen
 *
 * User settings and configuration:
 * - Profile management (name, bio, avatar)
 * - User info (pub key)
 * - Network configuration (peers)
 * - Logout button
 * - App version/about
 */

import { useState, useEffect } from '@lynx-js/react';
import { Column, Row, Text, Button, Icon, Input } from '@ariob/ui';
import { PageLayout } from '../components/Layout';
import type { IGunChainReference } from '@ariob/core';
import { useAuth, logout as logoutFn, getPeers, addPeer, removePeer, addPeersToGraph } from '@ariob/core';
import { useProfile, saveProfile, type UserProfile } from '../utils/profile';

interface SettingsProps {
  graph: IGunChainReference;
  onLogout?: () => void;
  onBack?: () => void;
}

export function Settings({ graph, onLogout, onBack }: SettingsProps) {
  const { user, isLoggedIn } = useAuth(graph);
  const { profile, loading: profileLoading } = useProfile(graph);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({
    alias: '',
    bio: '',
    location: '',
    website: '',
  });

  // Load profile data into form when available
  useEffect(() => {
    'background only';

    if (profile && !isEditingProfile) {
      setProfileForm({
        alias: profile.alias || user?.alias || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
      });
    }
  }, [profile, user, isEditingProfile]);

  // Peer management state
  const [peers, setPeersState] = useState<string[]>(() => getPeers());
  const [newPeerUrl, setNewPeerUrl] = useState('');
  const [peersChanged, setPeersChanged] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleLogout = () => {
    'background only';
    setIsLoggingOut(true);

    // Call logout function
    logoutFn(graph);

    // Small delay to show feedback, then call onLogout
    setTimeout(() => {
      'background only';
      setIsLoggingOut(false);
      onLogout?.(); // Notify parent that logout occurred
    }, 500);
  };

  const handleBack = () => {
    'background only';
    onBack?.();
  };

  const handleEditProfile = () => {
    'background only';
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    'background only';
    // Restore original profile data
    setProfileForm({
      alias: profile?.alias || user?.alias || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || '',
    });
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    'background only';

    setIsSavingProfile(true);

    try {
      const now = Date.now();
      const profileData: Partial<UserProfile> = {
        alias: profileForm.alias || user?.alias || '',
        bio: profileForm.bio,
        location: profileForm.location,
        website: profileForm.website,
        updatedAt: now,
        // Add createdAt if this is the first time saving
        ...((!profile || !profile.createdAt) && { createdAt: now }),
      };

      const result = await saveProfile(graph, profileData);

      if (result.ok) {
        console.log('[Settings] ✓ Profile saved successfully');
        setIsEditingProfile(false);
      } else {
        console.error('[Settings] Profile save failed:', result.error);
      }
    } catch (error) {
      console.error('[Settings] Error saving profile:', error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddPeer = () => {
    'background only';

    if (!newPeerUrl.trim()) {
      return;
    }

    // Support multiple peers separated by comma, semicolon, or newline
    const peerUrls = newPeerUrl
      .split(/[,;\n]/)
      .map(url => url.trim())
      .filter(url => url.length > 0);

    // Validate each URL
    for (const url of peerUrls) {
      if (!url.startsWith('ws://') && !url.startsWith('wss://') && !url.startsWith('http://') && !url.startsWith('https://')) {
        console.warn('[Settings] Invalid peer URL format:', url);
        continue;
      }
      addPeer(url);
    }

    setPeersState(getPeers());
    setNewPeerUrl('');
    setPeersChanged(true);
  };

  const handleRemovePeer = (peer: string) => {
    'background only';
    removePeer(peer);
    setPeersState(getPeers());
    setPeersChanged(true);
  };

  const handleApplyPeers = () => {
    'background only';

    setIsApplying(true);

    try {
      console.log('[Settings] Applying new peer configuration:', peers);

      // Add peers to the existing Gun instance
      addPeersToGraph(peers);

      setPeersChanged(false);
      console.log('[Settings] ✓ Peers added to Gun instance');
    } catch (error) {
      console.error('[Settings] Error applying peer changes:', error);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <PageLayout>
      <Column className="w-full h-full" spacing="none">
        {/* Header with back button */}
        <view className="w-full px-4 py-3 border-b border-border">
          <Row className="items-center justify-between">
            <Button
              onTap={handleBack}
              variant="ghost"
              size="icon"
              className="-ml-2"
            >
              <Icon name="chevron-left" size="default" />
            </Button>
            <Text size="lg" weight="semibold">
              Settings
            </Text>
            <view className="w-10" /> {/* Spacer for centering */}
          </Row>
        </view>

        {/* Content */}
        <scroll-view
          className="flex-1 w-full"
          scroll-orientation="vertical"
          enable-scroll={true}
          scroll-bar-enable={false}
        >
          <Column className="w-full p-4 pb-20" spacing="lg">
            {/* Profile Section */}
            {isLoggedIn && user && (
              <view className="w-full p-4 bg-muted/30 rounded-lg border border-border">
                <Column spacing="md">
                  <Row className="items-center justify-between">
                    <Text size="lg" weight="semibold">
                      Profile
                    </Text>
                    {!isEditingProfile && (
                      <Button
                        onTap={handleEditProfile}
                        variant="ghost"
                        size="sm"
                      >
                        <Icon name="settings" size="sm" />
                      </Button>
                    )}
                  </Row>

                  <Row className="items-center gap-3">
                    {/* Avatar */}
                    <view className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                      <Text size="2xl" weight="bold" className="text-white">
                        {(profileForm.alias || user.alias)?.[0]?.toUpperCase() || 'U'}
                      </Text>
                    </view>

                    {/* User details */}
                    <Column spacing="xs" className="flex-1">
                      {!isEditingProfile ? (
                        <>
                          <Text size="xl" weight="semibold">
                            {profile?.alias || user.alias}
                          </Text>
                          {profile?.bio && (
                            <Text size="sm" variant="muted">
                              {profile.bio}
                            </Text>
                          )}
                          {profile?.location && (
                            <Row className="items-center gap-1">
                              <Icon name="map-pin" size="sm" />
                              <Text size="xs" variant="muted">
                                {profile.location}
                              </Text>
                            </Row>
                          )}
                        </>
                      ) : (
                        <Column spacing="sm" className="w-full">
                          <Column spacing="xs">
                            <Text size="xs" weight="semibold" variant="muted">
                              Display Name
                            </Text>
                            <Input
                              value={profileForm.alias}
                              onChange={(val) => setProfileForm({...profileForm, alias: val})}
                              placeholder="Your display name"
                              className="w-full"
                            />
                          </Column>

                          <Column spacing="xs">
                            <Text size="xs" weight="semibold" variant="muted">
                              Bio
                            </Text>
                            <Input
                              value={profileForm.bio}
                              onChange={(val) => setProfileForm({...profileForm, bio: val})}
                              placeholder="Tell us about yourself"
                              className="w-full"
                            />
                          </Column>

                          <Column spacing="xs">
                            <Text size="xs" weight="semibold" variant="muted">
                              Location
                            </Text>
                            <Input
                              value={profileForm.location}
                              onChange={(val) => setProfileForm({...profileForm, location: val})}
                              placeholder="City, Country"
                              className="w-full"
                            />
                          </Column>

                          <Column spacing="xs">
                            <Text size="xs" weight="semibold" variant="muted">
                              Website
                            </Text>
                            <Input
                              value={profileForm.website}
                              onChange={(val) => setProfileForm({...profileForm, website: val})}
                              placeholder="https://your-website.com"
                              className="w-full"
                            />
                          </Column>

                          <Row className="gap-2 mt-2">
                            <Button
                              onTap={handleSaveProfile}
                              variant="default"
                              size="sm"
                              className="flex-1"
                              disabled={isSavingProfile}
                            >
                              {isSavingProfile ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              onTap={handleCancelEdit}
                              variant="ghost"
                              size="sm"
                              className="flex-1"
                              disabled={isSavingProfile}
                            >
                              Cancel
                            </Button>
                          </Row>
                        </Column>
                      )}
                    </Column>
                  </Row>

                  {/* Full public key (copyable) */}
                  <view className="mt-2 p-3 bg-background rounded-md border border-border">
                    <Column spacing="xs">
                      <Text size="xs" weight="semibold" variant="muted" className="uppercase tracking-wide">
                        Public Key
                      </Text>
                      <Text size="xs" className="font-mono break-all leading-relaxed">
                        {user.pub}
                      </Text>
                    </Column>
                  </view>
                </Column>
              </view>
            )}

            {/* Network Configuration Section */}
            <view className="w-full p-4 bg-muted/30 rounded-lg border border-border">
              <Column spacing="md">
                <Row className="items-center justify-between">
                  <Column spacing="xs" className="flex-1">
                    <Text size="lg" weight="semibold">
                      Network Configuration
                    </Text>
                    <Text size="sm" variant="muted">
                      Configure Gun.js relay peers for P2P synchronization.
                    </Text>
                  </Column>
                  {peersChanged && (
                    <Button
                      onTap={handleApplyPeers}
                      variant="default"
                      size="sm"
                      disabled={isApplying}
                    >
                      {isApplying ? 'Applying...' : 'Apply Changes'}
                    </Button>
                  )}
                </Row>

                {/* Peer List */}
                <Column spacing="xs">
                  <Text size="sm" weight="semibold" variant="muted" className="uppercase tracking-wide">
                    Active Peers ({peers.length})
                  </Text>

                  {peers.length === 0 ? (
                    <view className="p-3 bg-background rounded-md border border-border/50">
                      <Text size="sm" variant="muted">
                        No peers configured. Add a peer to enable synchronization.
                      </Text>
                    </view>
                  ) : (
                    <Column spacing="xs">
                      {peers.map((peer, index) => (
                        <view
                          key={`peer-${index}`}
                          className="p-3 bg-background rounded-md border border-border flex-row items-center justify-between"
                        >
                          <Text size="sm" className="font-mono flex-1 break-all pr-2">
                            {peer}
                          </Text>
                          <Button
                            onTap={() => handleRemovePeer(peer)}
                            variant="ghost"
                            size="sm"
                            className="flex-shrink-0"
                          >
                            <Icon name="x" size="sm" />
                          </Button>
                        </view>
                      ))}
                    </Column>
                  )}
                </Column>

                {/* Add Peer Input */}
                <Column spacing="xs">
                  <Text size="sm" weight="semibold" variant="muted" className="uppercase tracking-wide">
                    Add New Peer
                  </Text>
                  <Row className="gap-2">
                    <view className="flex-1">
                      <Input
                        value={newPeerUrl}
                        onChange={setNewPeerUrl}
                        placeholder="ws://localhost:8765/gun"
                        className="w-full"
                      />
                    </view>
                    <Button
                      onTap={handleAddPeer}
                      variant="default"
                      size="default"
                      disabled={!newPeerUrl.trim()}
                    >
                      <Icon name="plus" size="default" />
                    </Button>
                  </Row>
                  <Text size="xs" variant="muted">
                    Supported protocols: ws://, wss://, http://, https://. Separate multiple peers with commas.
                  </Text>
                </Column>
              </Column>
            </view>

            {/* Settings Options */}
            <Column spacing="sm">
              {/* Logout Button */}
              <Button
                onTap={handleLogout}
                variant="destructive"
                size="lg"
                className="w-full"
                disabled={isLoggingOut}
              >
                <Row className="items-center gap-2">
                  <Icon name="log-out" size="default" />
                  <Text>{isLoggingOut ? 'Logging out...' : 'Logout'}</Text>
                </Row>
              </Button>
            </Column>

            {/* App Info Section */}
            <view className="mt-auto w-full p-4 bg-muted/20 rounded-lg border border-border/50">
              <Column spacing="xs" className="items-center">
                <Text size="sm" weight="semibold">
                  Ripple
                </Text>
                <Text size="xs" variant="muted">
                  Decentralized Social Network
                </Text>
                <Text size="xs" variant="muted" className="mt-2">
                  Version 1.0.0
                </Text>
              </Column>
            </view>
          </Column>
        </scroll-view>
      </Column>
    </PageLayout>
  );
}
