import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageBubble, type BubbleSize } from '../components/chat/MessageBubble';
import { ChatHeader } from '../components/chat/ChatHeader';

const FRIEND_NAME = 'Alex';
const FRIEND_SCRIPT = [
  'This is what a chat on Honk looks like. Type a reply to see',
  "that's why ur answer seems off",
  'np!',
];
const IDLE_DELAY = 5000;
const LEAVE_DELAY = 9000;
const MAX_CHAR_COUNT = 160;

type ToolbarIconName = ComponentProps<typeof FontAwesome6>['name'];
type TimeoutHandle = ReturnType<typeof setTimeout>;

const ACTIONS: { icon: ToolbarIconName; label: string }[] = [
  { icon: 'grip', label: 'App drawer' },
  { icon: 'face-smile', label: 'Reactions' },
  { icon: 'camera', label: 'Camera' },
  { icon: 'image', label: 'Media' },
  { icon: 'microphone', label: 'Voice' },
];

type HonkState = 'idle' | 'me' | 'friend';
type FriendPresence = 'live' | 'left';
type Role = 'me' | 'friend';

const friendHeights: Record<BubbleSize, number> = {
  small: 70,
  medium: 130,
  large: 200,
};

const myHeights: Record<BubbleSize, number> = {
  small: 80,
  medium: 140,
  large: 220,
};

const getSectionTargetHeight = (
  role: Role,
  size: BubbleSize,
  isTyping: boolean,
) => {
  const base = role === 'friend' ? friendHeights[size] : myHeights[size];
  return base + (isTyping ? 20 : 0);
};

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = isDark ? darkPalette : lightPalette;
  const insets = useSafeAreaInsets();

  const inputRef = useRef<TextInput>(null);
  const myTypingTimer = useRef<TimeoutHandle | null>(null);
  const leaveTimer = useRef<TimeoutHandle | null>(null);

  const [myMessage, setMyMessage] = useState('');
  const [isMyTyping, setIsMyTyping] = useState(false);
  const [friendMessageIndex, setFriendMessageIndex] = useState(0);
  const [friendMessage, setFriendMessage] = useState(FRIEND_SCRIPT[0]);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [friendPresence, setFriendPresence] = useState<FriendPresence>('live');
  const composerPadding = insets.bottom + 12;

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const clearLeaveTimer = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  const markFriendLive = () => {
    clearLeaveTimer();
    setFriendPresence('live');
  };

  const scheduleFriendLeave = () => {
    clearLeaveTimer();
    leaveTimer.current = setTimeout(() => {
      setFriendPresence('left');
      setFriendMessage('');
    }, LEAVE_DELAY);
  };

  useEffect(() => {
    let idleTimer: TimeoutHandle | null = null;
    let typingTimer: TimeoutHandle | null = null;

    const startTyping = () => {
      const nextIndex = (friendMessageIndex + 1) % FRIEND_SCRIPT.length;
      const target = FRIEND_SCRIPT[nextIndex];
      let cursor = 0;

      markFriendLive();
      setIsFriendTyping(true);
      setFriendMessage('');

      const typeNext = () => {
        cursor += 1;
        setFriendMessage(target.slice(0, cursor));
        if (cursor < target.length) {
          typingTimer = setTimeout(typeNext, 55 + Math.random() * 45);
        } else {
          setIsFriendTyping(false);
          setFriendMessageIndex(nextIndex);
          scheduleFriendLeave();
        }
      };

      typingTimer = setTimeout(typeNext, 120);
    };

    idleTimer = setTimeout(startTyping, IDLE_DELAY);

    return () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
    };
  }, [friendMessageIndex]);

  useEffect(() => {
    return () => {
      if (myTypingTimer.current) {
        clearTimeout(myTypingTimer.current);
      }
      clearLeaveTimer();
    };
  }, []);

  const honkState: HonkState = useMemo(() => {
    if (friendPresence !== 'left' && isFriendTyping) return 'friend';
    if (isMyTyping) return 'me';
    return 'idle';
  }, [friendPresence, isFriendTyping, isMyTyping]);

  const { friendBubbleSize, myBubbleSize } = useMemo(() => {
    const determineSize = (role: 'me' | 'friend'): BubbleSize => {
      if (friendPresence === 'left' && role === 'friend') {
        return 'small';
      }
      if (isFriendTyping && isMyTyping) {
        return 'medium';
      }
      if (isFriendTyping) {
        return role === 'friend' ? 'large' : 'small';
      }
      if (isMyTyping) {
        return role === 'me' ? 'large' : 'small';
      }
      return 'medium';
    };

    return {
      friendBubbleSize: determineSize('friend'),
      myBubbleSize: determineSize('me'),
    };
  }, [friendPresence, isFriendTyping, isMyTyping]);

  const handleMyTextChange = (value: string) => {
    const nextValue = value.slice(0, MAX_CHAR_COUNT);
    setMyMessage(nextValue);
    setIsMyTyping(true);

    if (myTypingTimer.current) {
      clearTimeout(myTypingTimer.current);
    }

    myTypingTimer.current = setTimeout(() => {
      setIsMyTyping(false);
    }, 1200);
  };

  const handleBlur = () => {
    if (myTypingTimer.current) {
      clearTimeout(myTypingTimer.current);
      myTypingTimer.current = null;
    }
    if (myMessage.trim().length === 0) {
      setIsMyTyping(false);
    }
  };

  const clearDraft = () => {
    setMyMessage('');
    setIsMyTyping(false);
    if (myTypingTimer.current) {
      clearTimeout(myTypingTimer.current);
      myTypingTimer.current = null;
    }
    inputRef.current?.focus();
  };

  const handleSend = () => {
    if (!myMessage.trim()) {
      return;
    }
    clearDraft();
  };

  const { friendSectionHeight, mySectionHeight } = useMemo(() => {
    const friendBase =
      friendPresence === 'left'
        ? 60
        : getSectionTargetHeight('friend', friendBubbleSize, isFriendTyping);
    const myBase = getSectionTargetHeight('me', myBubbleSize, isMyTyping);

    return {
      friendSectionHeight: friendBase,
      mySectionHeight: myBase,
    };
  }, [
    friendBubbleSize,
    friendPresence,
    isFriendTyping,
    isMyTyping,
    myBubbleSize,
  ]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.surface }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.screen}>
          <View style={styles.headerBlock}>
            <ChatHeader
              friendName={FRIEND_NAME}
              friendPresence={friendPresence}
              honkState={honkState}
              isFriendTyping={isFriendTyping}
            />
          </View>

          <View style={styles.body}>
            <View style={styles.threadContainer}>
              <View
                style={[styles.friendSection, { minHeight: friendSectionHeight }]}
              >
                <MessageBubble
                  variant="friend"
                  text={friendMessage}
                  size={friendBubbleSize}
                  centerContent
                  isTyping={isFriendTyping}
                />
              </View>

              <View
                style={[
                  styles.composerSection,
                  { paddingBottom: composerPadding },
                ]}
              >
                <View style={[styles.mySection, { minHeight: mySectionHeight }]}>
                  <MessageBubble
                    variant="me"
                    text={myMessage}
                    placeholder="Type something"
                    onChangeText={handleMyTextChange}
                    inputRef={inputRef}
                    size={myBubbleSize}
                    centerContent
                    onFocus={() => setIsMyTyping(true)}
                    onBlur={handleBlur}
                    isTyping={isMyTyping}
                    maxLength={MAX_CHAR_COUNT}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                  />
                </View>

                <View style={styles.toolbarRow}>
                  <View style={styles.toolbarIcons}>
                    {ACTIONS.map((action, index) => {
                      const isPrimary = index === 0;
                      return (
                        <TouchableOpacity
                          key={action.icon}
                          style={[
                            styles.actionButton,
                            isPrimary && { backgroundColor: palette.accentSoft },
                          ]}
                          accessibilityLabel={action.label}
                          activeOpacity={0.9}
                        >
                          <FontAwesome6
                            name={action.icon}
                            size={20}
                            color={isPrimary ? '#FFFFFF' : palette.mutedIcon}
                          />
                          {isPrimary && (
                            <View
                              style={[
                                styles.activeIndicator,
                                { backgroundColor: palette.accent },
                              ]}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <TouchableOpacity
                    onPress={clearDraft}
                    style={[
                      styles.actionButton,
                      styles.trashButton,
                      { backgroundColor: palette.destructiveBg },
                    ]}
                    accessibilityLabel="Clear draft"
                    activeOpacity={0.8}
                  >
                    <FontAwesome6
                      name="trash-can"
                      size={16}
                      color={palette.destructive}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  shadow: 'rgba(60,60,67,0.12)',
  accentSoft: '#0A84FF',
  mutedIcon: '#C7C7CC',
  destructive: '#FF3B30',
  destructiveBg: 'rgba(255,59,48,0.12)',
};

const darkPalette = {
  surface: '#000000',
  title: '#FFFFFF',
  subtext: '#AEAEB2',
  icon: '#FFFFFF',
  avatar: '#1C1C1E',
  accent: '#0A84FF',
  bubble: '#64D2FF',
  shadow: 'rgba(0,0,0,0.4)',
  accentSoft: 'rgba(10,132,255,0.25)',
  mutedIcon: '#8E8E93',
  destructive: '#FF453A',
  destructiveBg: 'rgba(255,69,58,0.2)',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  headerBlock: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  threadContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  friendSection: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexShrink: 0,
    paddingBottom: 8,
  },
  mySection: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexShrink: 0,
    paddingTop: 8,
    paddingBottom: 8,
  },
  composerSection: {
    gap: 16,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    alignSelf: 'stretch',
    marginTop: 4,
  },
  toolbarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: 12,
    flex: 1,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 6,
  },
  trashButton: {
    width: 44,
    marginLeft: 'auto',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
