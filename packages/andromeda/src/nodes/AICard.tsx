/**
 * AICard - Personal assistant card
 *
 * Compact card for AI assistant with topics preview.
 * Uses useNodeBar hook for schema-driven actions.
 *
 * Layout:
 * ┌────────────────────────────────────┐
 * │ 🤖 Claude        [More →] (ghost)  │
 * │ Personal Assistant                 │
 * ├────────────────────────────────────┤
 * │ Latest topic                       │
 * │ ─────────────                      │
 * │ 💬 Project Planning                │
 * │ "Working on the feed..."           │
 * ├────────────────────────────────────┤
 * │ [Chat ▪▪▪]  [New Topic]            │
 * └────────────────────────────────────┘
 */

import { View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Text } from '../atoms/Text';
import { Button, type ButtonVariant } from '../atoms/Button';
import { Avatar } from '../molecules/Avatar';
import { Card } from '../organisms/Card';
import { Row, Stack } from '../layouts';

import type { AINode, Variant, Topic } from '@ariob/ripple';
import { useNodeBar, NodeBarProvider, type NodeBarConfig } from '@ariob/ripple';

/**
 * Props for AICard
 */
export interface AICardProps {
  /** AI node data */
  node: AINode;

  /** Render variant */
  variant?: Variant;

  /** Navigation callback */
  onNavigate?: NodeBarConfig['onNavigate'];

  /** Action callback */
  onAction?: NodeBarConfig['onAction'];

  /** Press on card to navigate to full chat */
  onPress?: () => void;

  /** Additional styles */
  style?: ViewStyle;
}

/**
 * AICard component
 */
export function AICard({
  node,
  variant = 'card',
  onNavigate,
  onAction,
  onPress,
  style,
}: AICardProps) {
  const { theme } = useUnistyles();

  // Get actions from registry via hook
  const bar = useNodeBar({
    node,
    degree: node.degree,
    variant,
    onNavigate,
    onAction,
  });

  // Find specific actions
  const expandAction = bar.primary.find((a) => a.meta.verb === 'expand');
  const chatAction = bar.primary.find((a) => a.meta.verb === 'chat');
  const newTopicAction = bar.primary.find((a) => a.meta.verb === 'new-topic');

  // Get latest topic
  const latestTopic: Topic | undefined = node.topics?.[0];

  // Current thread preview
  const threadPreview = node.currentThread?.preview || latestTopic?.summary;

  return (
    <NodeBarProvider bar={bar}>
      <Card variant="elevated" noPadding onPress={onPress} style={style}>
        <View style={[styles.content, { padding: theme.space.lg }]}>
          {/* Header: Avatar + Name + Expand */}
          <Row align="center" style={styles.header}>
            <Row align="center" gap="md" style={styles.identity}>
              <Avatar char="🤖" size="md" tint="accent" />
              <View>
                <Text size="body" color="text" style={styles.name}>
                  {node.name}
                </Text>
                <Text size="caption" color="dim">
                  {node.subtitle}
                </Text>
              </View>
            </Row>

            {/* Ghost "More →" button */}
            {expandAction && (
              <Button
                variant="ghost"
                tint="default"
                size="sm"
                icon="chevron-forward"
                iconPosition="right"
                loading={bar.loading[expandAction.meta.verb]}
                onPress={() => bar.execute(expandAction.meta.verb)}
              >
                More
              </Button>
            )}
          </Row>

          {/* Topic preview section */}
          {(latestTopic || threadPreview) && (
            <View style={[styles.topicSection, { borderTopColor: theme.colors.borderSubtle }]}>
              {latestTopic && (
                <View style={styles.topicHeader}>
                  <Text size="caption" color="dim" style={styles.topicLabel}>
                    Latest topic
                  </Text>
                </View>
              )}

              <Row align="center" gap="sm" style={styles.topicRow}>
                <Ionicons
                  name={(latestTopic?.icon as any) || 'chatbubble-outline'}
                  size={16}
                  color={theme.colors.dim}
                />
                <Text size="body" color="text" style={styles.topicName}>
                  {latestTopic?.name || 'General'}
                </Text>
              </Row>

              {threadPreview && (
                <Text size="caption" color="dim" numberOfLines={1} style={styles.preview}>
                  "{threadPreview}"
                </Text>
              )}
            </View>
          )}

          {/* Action buttons */}
          <Row align="center" gap="sm" style={styles.actionRow}>
            {chatAction && (
              <Button
                variant="solid"
                tint="accent"
                size="md"
                icon="chatbubble-ellipses"
                loading={bar.loading[chatAction.meta.verb]}
                onPress={() => bar.execute(chatAction.meta.verb)}
                style={styles.chatButton}
              >
                Chat
              </Button>
            )}

            {newTopicAction && (
              <Button
                variant="ghost"
                tint="default"
                size="md"
                icon="add-circle-outline"
                loading={bar.loading[newTopicAction.meta.verb]}
                onPress={() => bar.execute(newTopicAction.meta.verb)}
              >
                New Topic
              </Button>
            )}
          </Row>
        </View>
      </Card>
    </NodeBarProvider>
  );
}

const styles = StyleSheet.create({
  content: {},
  header: {
    justifyContent: 'space-between',
  },
  identity: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
  },
  topicSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  topicHeader: {
    marginBottom: 8,
  },
  topicLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topicRow: {
    marginBottom: 4,
  },
  topicName: {
    fontWeight: '500',
  },
  preview: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  actionRow: {
    marginTop: 16,
  },
  chatButton: {
    flex: 1,
  },
});
