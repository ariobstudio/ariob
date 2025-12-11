/**
 * ChatHeader - Real-time chat header with presence indicators
 *
 * Displays chat partner info, typing indicators, and live presence status.
 * The header adapts to show different states based on the conversation
 * and friend's activity.
 * Refactored to use Unistyles for theme reactivity
 *
 * @example
 * ```tsx
 * <ChatHeader
 *   friendName="Alice"
 *   friendPresence="live"
 *   honkState="idle"
 *   isFriendTyping={false}
 * />
 *
 * // With typing indicator
 * <ChatHeader
 *   friendName="Bob"
 *   friendPresence="live"
 *   honkState="friend"
 *   isFriendTyping={true}
 * />
 * ```
 *
 * **Presence States:**
 * - `live` - Friend is actively in chat (cyan ring around avatar)
 * - `left` - Friend has left the conversation
 *
 * **Honk States:**
 * - `idle` - Shows "Live Chat"
 * - `me` - Shows "You're typing..."
 * - `friend` - Shows "{name} is typing..."
 *
 * **Visual Elements:**
 * - Back navigation button with shadow
 * - Centered name and status label
 * - Avatar with optional live ring and typing dots
 *
 * @see MessageBubble - Chat message components
 * @see ImmersiveView - Parent container for chat
 */
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type FriendPresence = 'live' | 'left';
type HonkState = 'idle' | 'me' | 'friend';

interface ChatHeaderProps {
  friendName: string;
  friendPresence: FriendPresence;
  honkState: HonkState;
  isFriendTyping: boolean;
}

export function ChatHeader({
  friendName,
  friendPresence,
  honkState,
  isFriendTyping,
}: ChatHeaderProps) {
  const { theme } = useUnistyles();
  const router = useRouter();

  const stateLabel = (() => {
    if (friendPresence === 'left') {
      return 'Left the Chat';
    }

    switch (honkState) {
      case 'me':
        return "You're typing...";
      case 'friend':
        return `${friendName} is typing...`;
      default:
        return 'Live Chat';
    }
  })();

  const avatarCore = (
    <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceElevated }]}>
      <Text style={[styles.avatarText, { color: theme.colors.accent }]}>{friendName[0]}</Text>
      {isFriendTyping && (
        <View
          style={[
            styles.typingPill,
            { borderColor: theme.colors.surface, backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={[styles.typingDot, styles.typingDot1, { backgroundColor: theme.colors.textSecondary }]} />
          <View style={[styles.typingDot, styles.typingDot2, { backgroundColor: theme.colors.textSecondary }]} />
          <View style={[styles.typingDot, styles.typingDot3, { backgroundColor: theme.colors.textSecondary }]} />
        </View>
      )}
    </View>
  );

  const rightAccessory =
    friendPresence === 'live' ? (
      <View
        style={[
          styles.liveRing,
          { borderColor: theme.colors.accent },
        ]}
      >
        {avatarCore}
      </View>
    ) : (
      avatarCore
    );

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={styles.navButton}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Text style={styles.headerName}>
          {friendName}
        </Text>
        <Text style={styles.subLabel}>
          {stateLabel}
        </Text>
      </View>

      <View style={styles.avatarWrapper}>{rightAccessory}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  navButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceElevated,
    ...theme.effects.shadow.subtle,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: {
    ...theme.typography.heading,
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  subLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  avatarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  typingPill: {
    position: 'absolute',
    bottom: -4,
    right: -6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 2,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  typingDot1: {
    opacity: 0.6,
  },
  typingDot2: {
    opacity: 0.8,
  },
  typingDot3: {
    opacity: 1,
  },
  liveRing: {
    padding: 3,
    borderRadius: 24,
    borderWidth: 2,
    position: 'relative',
  },
}));
