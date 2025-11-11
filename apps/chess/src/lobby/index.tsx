/**
 * Lobby Feature
 *
 * Session listing and creation screen.
 * Uses Gun to sync active game sessions in real-time.
 */

import { useEffect, useState } from '@lynx-js/react';
import { useCollection, useAuth, useUserProfile, collection, type IGunChainReference } from '@ariob/core';
import { Button, Icon, Row, Column, Scrollable, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Stack, cn } from '@ariob/ui';
import type { NavigatorInstance } from '../components/Navigation';
import { SessionSchema, type Session } from '../types';
import { useSettings } from '../store/settings';

export interface LobbyFeatureProps {
  data?: any;
  navigator?: NavigatorInstance;
  graph: IGunChainReference;
}

/**
 * Session card component
 */
function SessionCard({
  session,
  onJoin,
  currentUserPub
}: {
  session: Session;
  onJoin: () => void;
  currentUserPub?: string;
}) {
  const playerCount = session.player2Pub ? 2 : 1;
  const isWaiting = session.status === 'waiting' || !session.player2Pub;
  const isActive = session.status === 'active' && session.player2Pub;

  // Check if current user is a player in this game
  const isPlayer1 = currentUserPub && session.player1Pub === currentUserPub;
  const isPlayer2 = currentUserPub && session.player2Pub === currentUserPub;
  const isPlayer = isPlayer1 || isPlayer2;

  // Determine button label and variant
  const buttonConfig = {
    label: isPlayer ? 'Resume match' : isWaiting ? 'Join match' : 'Watch game',
    variant: isPlayer || isWaiting ? 'default' : 'secondary',
    icon: isPlayer ? 'swords' : isWaiting ? 'log-in' : 'eye',
  } as const;

  const statusLabel = isPlayer ? 'Your match' : isWaiting ? 'Waiting for opponent' : 'Live table';
  const phaseLabel = isActive && session.phase === 'werera' ? 'Werera phase' : null;
  const statusBadgeVariant = isPlayer ? 'success' : isWaiting ? 'warning' : 'secondary';

  const opponentName = session.player2Alias || 'Awaiting player';

  // Get variant display name
  const variantName = session.variant === 'standard' ? 'Standard' : 'Senterej';

  return (
    <Card
      radius="lg"
      className={cn(
        'border-border/60 bg-card shadow-none',
        (isWaiting || isPlayer) && 'border-primary/60'
      )}
    >
      <CardContent className="flex flex-col gap-4">
        <Column spacing="xs">
          <text className="text-sm font-semibold text-foreground">
            {session.player1Alias} vs {opponentName}
          </text>
          <Row spacing="sm" align="center" className="text-xs">
            <Badge variant="outline">{variantName}</Badge>
            <Badge variant="secondary">
              <Icon name="users" size="sm" />
              <text>{playerCount}/2</text>
            </Badge>
            <Badge variant={statusBadgeVariant}>{statusLabel}</Badge>
          </Row>
        </Column>

        <Row className="items-center justify-between">
          <Column spacing="xs">
            {phaseLabel && (
              <Badge variant="secondary" className="w-min">
                ⚡ {phaseLabel}
              </Badge>
            )}
            <text className="text-xs text-muted-foreground">
              {isPlayer
                ? 'Resume your game in progress.'
                : isWaiting
                ? 'Join before the table fills up.'
                : 'Drop in and spectate the action.'}
            </text>
          </Column>

          <Button
            onTap={onJoin}
            size="sm"
            variant={buttonConfig.variant}
            prefix={<Icon name={buttonConfig.icon} size="sm" />}
          >
            {buttonConfig.label}
          </Button>
        </Row>
      </CardContent>
    </Card>
  );
}

/**
 * Lobby feature component
 */
export function LobbyFeature({ data, navigator, graph }: LobbyFeatureProps) {
  // Get authenticated user
  const { user, isLoggedIn } = useAuth(graph);

  // Get user profile for display name
  const { profile } = useUserProfile(graph);
  const displayName = useSettings((state) => state.displayName);

  // Use profile alias if available, otherwise fallback to Zustand settings
  const playerName = profile?.alias || displayName || 'Player';

  // Subscribe to sessions collection
  const sessionsCollection = useCollection<Session>('sessions');

  useEffect(() => {
    'background only';

    if (!graph) return;

    // Subscribe to Gun sessions collection
    const sessionsRef = graph.get('senterej').get('sessions');
    console.log('[Lobby] Subscribing to sessions collection');

    sessionsCollection.map(sessionsRef, SessionSchema);

    return () => {
      console.log('[Lobby] Unsubscribing from sessions');
      sessionsCollection.off();
    };
  }, [graph]);

  const joinSession = (sessionId: string) => {
    'background only';
    console.log('[Lobby] Joining session:', sessionId);
    if (navigator) {
      navigator.navigate('game', { sessionId, joining: true });
    }
  };

  const handleOpenSettings = () => {
    'background only';
    if (navigator) {
      navigator.navigate('settings');
    }
  };

  const handleCreateSession = () => {
    'background only';
    if (navigator) {
      navigator.navigate('variantSelector');
    }
  };

  const sessionsCount = sessionsCollection.items.length;
  const hasSessions = sessionsCount > 0;
  const isReady = !!user && isLoggedIn;

  return (
    <Column height="screen" spacing="none" className="bg-background text-foreground">
      <view className="border-b border-border/60 px-5 pb-3">
        <Row className="items-center justify-between">
          <Column spacing="xs">
            <text className="text-lg font-semibold">Lobby</text>
            <Row spacing="sm" align="center" className="text-xs text-muted-foreground">
              <text>{playerName}</text>
              <view
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isLoggedIn ? 'bg-primary' : 'bg-border'
                )}
              />
              <text>{hasSessions ? `${sessionsCount} tables` : 'No tables yet'}</text>
            </Row>
          </Column>

          <Button variant="ghost" size="icon" onTap={handleOpenSettings}>
            <Icon name="settings" size="sm" />
          </Button>
        </Row>
      </view>

      <Scrollable
        direction="vertical"
        className="flex-1"
        padding="lg"
      >
        <Column className="gap-5">
          <Button
            onTap={handleCreateSession}
            disabled={!isReady}
            size="lg"
            className="w-full"
            prefix={<Icon name="circle-plus" />}
          >
            {!isReady ? 'Connecting…' : 'Create Match'}
          </Button>

          {hasSessions ? (
            <Stack spacing="md">
              {sessionsCollection.items.map((item) => (
                <SessionCard
                  key={item.data.id}
                  session={item.data}
                  onJoin={() => joinSession(item.data.id)}
                  currentUserPub={user?.pub}
                />
              ))}
            </Stack>
          ) : (
            <Card
              radius="lg"
              className="border-dashed border-border/60 bg-transparent py-12"
            >
              <CardContent className="flex flex-col items-center gap-2 text-center">
                <Icon name="gamepad-2" className="text-muted-foreground" size="lg" />
                <text className="text-sm text-muted-foreground">
                  No active games yet. Start the first table.
                </text>
              </CardContent>
            </Card>
          )}
        </Column>
      </Scrollable>
    </Column>
  );
}
