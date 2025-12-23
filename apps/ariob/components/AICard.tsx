/**
 * AICard - AI companion card for feed
 *
 * Shows Ripple AI status and tap to chat.
 */

import { StyleSheet } from 'react-native-unistyles';
import { Text, Avatar, Row, Stack } from '@ariob/andromeda';
import { Shell } from '@ariob/ripple';
import { useRippleAI, useAISettings } from '@ariob/ml';

export interface AICardProps {
  onPress?: () => void;
}

export function AICard({ onPress }: AICardProps) {
  const { isReady, isGenerating, downloadProgress } = useRippleAI({ preventLoad: true });
  const { profile, model } = useAISettings();

  // Determine status text
  let status: string;
  if (isGenerating) {
    status = 'Thinking...';
  } else if (!isReady && downloadProgress < 1) {
    status = `Downloading ${Math.round(downloadProgress * 100)}%`;
  } else if (isReady) {
    status = 'Ready to chat';
  } else {
    status = 'Tap to start';
  }

  return (
    <Shell onPress={onPress} style={styles.shell}>
      <Row align="center" gap="md">
        <Avatar char="✦" size="md" tint="accent" />
        <Stack gap="xs" style={styles.content}>
          <Text size="body" color="text" style={styles.name}>
            {profile.name}
          </Text>
          <Row gap="md">
            <Text size="caption" color="dim">{status}</Text>
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
