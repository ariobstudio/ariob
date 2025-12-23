/**
 * ProfileCard - X/LinkedIn style profile card
 *
 * Social-style profile card following the Node + Action architecture.
 * Uses useNodeBar hook for schema-driven actions.
 *
 * Layout:
 * ┌────────────────────────────────────┐
 * │ [Cover gradient / image]           │
 * ├────────────────────────────────────┤
 * │ ○ Avatar        [Edit/Connect btn] │
 * │ Name ✓                             │
 * │ @handle                            │
 * │ Bio text line one or two...        │
 * │                                    │
 * │ 42 Posts  ·  128 Connections       │
 * ├────────────────────────────────────┤
 * │ 💬 Message  ↗ Share  ⚙️ More      │
 * └────────────────────────────────────┘
 */

import { View, Pressable, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '../atoms/Text';
import { Button, type ButtonVariant } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Avatar } from '../molecules/Avatar';
import { Card } from '../organisms/Card';
import { Row, Stack } from '../layouts';

import type { ProfileNode, Variant } from '@ariob/ripple';
import { useNodeBar, NodeBarProvider, type NodeBarConfig } from '@ariob/ripple';

/**
 * Props for ProfileCard
 */
export interface ProfileCardProps {
  /** Profile node data */
  node: ProfileNode;

  /** Current user ID for ownership check */
  userId?: string;

  /** Render variant */
  variant?: Variant;

  /** Navigation callback */
  onNavigate?: NodeBarConfig['onNavigate'];

  /** Action callback */
  onAction?: NodeBarConfig['onAction'];

  /** Press on card to navigate to full profile */
  onPress?: () => void;

  /** Additional styles */
  style?: ViewStyle;
}

/**
 * ProfileCard component
 */
export function ProfileCard({
  node,
  userId,
  variant = 'card',
  onNavigate,
  onAction,
  onPress,
  style,
}: ProfileCardProps) {
  const { theme } = useUnistyles();

  // Get actions from registry via hook
  const bar = useNodeBar({
    node,
    userId,
    degree: node.degree,
    variant,
    onNavigate,
    onAction,
  });

  // Find primary action (edit for owner, connect for others)
  const primaryAction = bar.primary.find(
    (a) => a.meta.verb === (bar.context.isOwner ? 'edit' : 'connect')
  );

  // Derive display values
  const displayName = node.displayName || node.alias || 'User';
  const handle = node.handle ? `@${node.handle}` : node.alias ? `@${node.alias}` : '';
  const avatarChar = displayName[0]?.toUpperCase() || '?';

  // Stats display
  const stats = node.stats || { posts: 0, connections: 0 };

  return (
    <NodeBarProvider bar={bar}>
      <Card variant="elevated" noPadding onPress={onPress} style={style}>
        {/* Cover gradient */}
        <View style={styles.coverContainer}>
          {node.cover ? (
            <View style={[styles.cover, { backgroundColor: theme.colors.muted }]} />
          ) : (
            <LinearGradient
              colors={[theme.colors.muted, theme.colors.surface]}
              style={styles.cover}
            />
          )}
        </View>

        {/* Content */}
        <View style={[styles.content, { padding: theme.space.lg }]}>
          {/* Header: Avatar + Action */}
          <Row align="center" style={styles.header}>
            {/* Avatar with ring */}
            <View style={[styles.avatarRing, { borderColor: theme.colors.surface }]}>
              <Avatar char={avatarChar} size="lg" tint="accent" />
            </View>

            {/* Primary action button */}
            {primaryAction && (
              <Button
                variant={(primaryAction.meta.variant as ButtonVariant) || 'ghost'}
                tint={bar.context.isOwner ? 'default' : 'accent'}
                size="sm"
                icon={primaryAction.meta.icon as any}
                loading={bar.loading[primaryAction.meta.verb]}
                onPress={() => bar.execute(primaryAction.meta.verb)}
              >
                {primaryAction.meta.label}
              </Button>
            )}
          </Row>

          {/* Name + Verified */}
          <Row align="center" gap="sm" style={styles.nameRow}>
            <Text size="heading" color="text" style={styles.name}>
              {displayName}
            </Text>
            {node.verified && (
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} />
            )}
          </Row>

          {/* Handle */}
          {handle && (
            <Text size="body" color="dim" style={styles.handle}>
              {handle}
            </Text>
          )}

          {/* Bio */}
          {node.bio && (
            <Text size="body" color="dim" numberOfLines={2} style={styles.bio}>
              {node.bio}
            </Text>
          )}

          {/* Stats row */}
          <Row align="center" gap="lg" style={styles.statsRow}>
            <Pressable style={styles.stat}>
              <Text size="body" color="text" style={styles.statValue}>
                {stats.posts}
              </Text>
              <Text size="caption" color="dim">
                {' '}Posts
              </Text>
            </Pressable>
            <Text size="caption" color="dim">·</Text>
            <Pressable style={styles.stat}>
              <Text size="body" color="text" style={styles.statValue}>
                {stats.connections}
              </Text>
              <Text size="caption" color="dim">
                {' '}Connections
              </Text>
            </Pressable>
          </Row>

          {/* Secondary actions */}
          {bar.secondary.length > 0 && (
            <Row align="center" gap="sm" style={styles.actionBar}>
              {bar.secondary.map((action) => (
                <Button
                  key={action.meta.verb}
                  variant="ghost"
                  tint={action.meta.category === 'destructive' ? 'danger' : 'default'}
                  size="sm"
                  icon={action.meta.icon as any}
                  loading={bar.loading[action.meta.verb]}
                  onPress={() => bar.execute(action.meta.verb)}
                >
                  {action.meta.label}
                </Button>
              ))}
            </Row>
          )}
        </View>
      </Card>
    </NodeBarProvider>
  );
}

const styles = StyleSheet.create({
  coverContainer: {
    width: '100%',
    height: 80,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  content: {
    marginTop: -32, // Pull up to overlap cover
  },
  header: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  avatarRing: {
    borderWidth: 3,
    borderRadius: 999,
    padding: 2,
  },
  nameRow: {
    marginTop: 4,
  },
  name: {
    fontWeight: '600',
  },
  handle: {
    marginTop: 2,
  },
  bio: {
    marginTop: 8,
    lineHeight: 20,
  },
  statsRow: {
    marginTop: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '600',
  },
  actionBar: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    flexWrap: 'wrap',
  },
});
