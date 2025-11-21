import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
      <Text style={styles.avatarText}>{friendName[0]}</Text>
      {isFriendTyping && (
        <View
          style={[
            styles.typingPill,
            { borderColor: palette.surface },
          ]}
        >
          <View style={[styles.typingDot, styles.typingDot1]} />
          <View style={[styles.typingDot, styles.typingDot2]} />
          <View style={[styles.typingDot, styles.typingDot3]} />
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
        style={styles.navButton}
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

const lightPalette = {
  surface: '#F7F7FA',
  title: '#1C1C1E',
  subtext: '#8E8E93',
  icon: '#1C1C1E',
  avatar: '#E0F0FF',
  accent: '#0A84FF',
  bubble: '#5AC8FA',
};

const darkPalette = {
  surface: '#000000',
  title: '#FFFFFF',
  subtext: '#AEAEB2',
  icon: '#FFFFFF',
  avatar: '#1C1C1E',
  accent: '#0A84FF',
  bubble: '#64D2FF',
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  navButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
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
    marginLeft: 12,
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
    color: '#007AFF',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8E8E93',
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
  liveBubble: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.85,
  },
  liveBubblePrimary: {
    width: 10,
    height: 10,
    top: -4,
    right: -2,
  },
  liveBubbleSecondary: {
    width: 6,
    height: 6,
    top: -10,
    right: 4,
  },
});
