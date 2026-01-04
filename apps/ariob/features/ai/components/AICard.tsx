/**
 * AICard - AI companion card for feed
 *
 * Shows Ripple AI and tap to chat.
 * Note: Currently using fallback mode until ExecuTorch bug is fixed.
 */

import { StyleSheet } from 'react-native-unistyles';
import { Text, Avatar, Row, Stack } from '@ariob/andromeda';
import { Shell } from '@ariob/ripple';
import { useAISettings } from '@ariob/ml';

export interface AICardProps {
  onPress?: () => void;
}

export function AICard({ onPress }: AICardProps) {
  const { profile, model } = useAISettings();

  return (
    <Shell onPress={onPress} style={styles.shell}>
      <Row align="center" gap="md">
        <Avatar char="✦" size="md" tint="accent" />
        <Stack gap="xs" style={styles.content}>
          <Text size="body" color="text" style={styles.name}>
            {profile.name}
          </Text>
          <Row gap="md">
            <Text size="caption" color="dim">Tap to chat</Text>
            <Text size="caption" color="dim">•</Text>
            <Text size="caption" color="dim">{model.name}</Text>
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
