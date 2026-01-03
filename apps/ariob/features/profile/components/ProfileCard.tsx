/**
 * ProfileCard - Simple profile display card
 *
 * Shows avatar and username in a tappable shell.
 */

import { StyleSheet } from 'react-native-unistyles';
import { Text, Avatar, Row, Stack } from '@ariob/andromeda';
import { Shell } from '@ariob/ripple';
import type { User } from '@ariob/core';

export interface ProfileCardProps {
  user: User;
  onPress?: () => void;
}

export function ProfileCard({ user, onPress }: ProfileCardProps) {
  const avatarChar = user.alias?.[0]?.toUpperCase() || '?';

  return (
    <Shell onPress={onPress} style={styles.shell}>
      <Row align="center" gap="md">
        <Avatar char={avatarChar} size="md" tint="accent" />
        <Stack gap="xs" style={styles.content}>
          <Text size="body" color="text" style={styles.name}>
            {user.alias || 'User'}
          </Text>
          <Row gap="md">
            <Text size="caption" color="dim">0 posts</Text>
            <Text size="caption" color="dim">0 connections</Text>
          </Row>
        </Stack>
      </Row>
    </Shell>
  );
}

const styles = StyleSheet.create((theme) => ({
  shell: {
    marginHorizontal: theme.space.lg,
    marginBottom: theme.space.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
  },
}));
