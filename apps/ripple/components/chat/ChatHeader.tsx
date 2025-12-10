/**
 * ChatHeader - Real-time chat header with presence indicators
 *
 * Displays chat partner info, typing indicators, and live presence status.
 * The header adapts to show different states based on the conversation
 * and friend's activity.
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
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme, colors } from '../../theme';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = isDark ? darkPalette : lightPalette;
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
    <View style={[styles.avatar, { backgroundColor: palette.avatar }]}>
      <Text style={[styles.avatarText, { color: palette.accent }]}>{friendName[0]}</Text>
      {isFriendTyping && (
        <View
          style={[
            styles.typingPill,
            { borderColor: palette.surface, backgroundColor: palette.surface },
          ]}
        >
          <View style={[styles.typingDot, styles.typingDot1, { backgroundColor: palette.subtext }]} />
          <View style={[styles.typingDot, styles.typingDot2, { backgroundColor: palette.subtext }]} />
          <View style={[styles.typingDot, styles.typingDot3, { backgroundColor: palette.subtext }]} />
        </View>
      )}
    </View>
  );

  const rightAccessory =
    friendPresence === 'live' ? (
      <View
        style={[
          styles.liveRing,
          { borderColor: palette.accent },
        ]}
      >
        {avatarCore}
      </View>
    ) : (
      avatarCore
    );

  return (
    <View style={[styles.header, { backgroundColor: palette.surface }]}>
      <TouchableOpacity
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={[styles.navButton, { backgroundColor: palette.navBg }]}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={24} color={palette.icon} />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Text style={[styles.headerName, { color: palette.title }]}>
          {friendName}
        </Text>
        <Text style={[styles.subLabel, { color: palette.subtext }]}>
          {stateLabel}
        </Text>
      </View>

      <View style={styles.avatarWrapper}>{rightAccessory}</View>
    </View>
  );
}

// Using theme tokens for palettes
const lightPalette = {
  surface: theme.colors.light.surface,
  title: theme.colors.light.text,
  subtext: theme.colors.light.textSecondary,
  icon: theme.colors.light.text,
  avatar: `${theme.colors.light.primary}20`,
  accent: theme.colors.light.primary,
  navBg: theme.colors.light.surface,
};

const darkPalette = {
  surface: theme.colors.background,
  title: theme.colors.text,
  subtext: theme.colors.textSecondary,
  icon: theme.colors.text,
  avatar: theme.colors.surfaceElevated,
  accent: theme.colors.primary,
  navBg: theme.colors.surfaceElevated,
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  navButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
    ...theme.shadows.md,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  subLabel: {
    fontSize: 13,
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
});
