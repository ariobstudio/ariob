/**
 * MessageBubble - Animated chat bubble with input support
 *
 * A versatile chat bubble component that supports both display and input modes.
 * Features smooth height and typography animations as content changes.
 *
 * @example
 * ```tsx
 * // Display friend's message
 * <MessageBubble
 *   variant="friend"
 *   text="Hello!"
 *   size="medium"
 * />
 *
 * // Editable input for user's message
 * <MessageBubble
 *   variant="me"
 *   text={message}
 *   size="large"
 *   placeholder="Type a message..."
 *   onChangeText={setMessage}
 *   inputRef={inputRef}
 * />
 *
 * // With typing state
 * <MessageBubble
 *   variant="me"
 *   text={message}
 *   size="medium"
 *   isTyping={true}
 * />
 * ```
 *
 * **Variants:**
 * - `me` - Blue bubble with TextInput (editable)
 * - `friend` - Gray bubble with Text (read-only)
 *
 * **Sizes:**
 * - `small` - 70-80px height, 18px font
 * - `medium` - 130-140px height, 22px font
 * - `large` - 200-220px height, 26px font
 *
 * **Animations:**
 * - Height transitions with cubic easing (260ms)
 * - Typography scales with cubic easing (220ms)
 * - Typing state adds 20px height boost
 *
 * @see ChatHeader - Companion header component
 */
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import {
  Animated,
  Easing,
  Text,
  TextInput,
  type TextInputProps,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { theme } from '../../theme';

export type BubbleSize = 'small' | 'medium' | 'large';

type MessageBubbleProps = {
  variant: 'friend' | 'me';
  text: string;
  size: BubbleSize;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  inputRef?: RefObject<TextInput | null>;
  centerContent?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  isTyping?: boolean;
  maxLength?: number;
  onSubmitEditing?: () => void;
  returnKeyType?: TextInputProps['returnKeyType'];
};

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export function MessageBubble({
  variant,
  text,
  size,
  placeholder,
  onChangeText,
  inputRef,
  centerContent,
  onFocus,
  onBlur,
  isTyping,
  maxLength,
  onSubmitEditing,
  returnKeyType,
}: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isMe = variant === 'me';
  const targetTypography = useMemo(
    () => getTypographyForSize(size),
    [size],
  );
  const shouldCenter = centerContent;

  const targetHeight = useMemo(() => {
    const heights = isMe
      ? { small: 80, medium: 140, large: 220 }
      : { small: 70, medium: 130, large: 200 };
    const typingBoost = isTyping ? 20 : 0;
    return heights[size] + typingBoost;
  }, [isMe, size, isTyping]);

  const animatedHeight = useRef(new Animated.Value(targetHeight)).current;
  const animatedFontSize = useRef(
    new Animated.Value(targetTypography.fontSize),
  ).current;
  const animatedLineHeight = useRef(
    new Animated.Value(targetTypography.lineHeight),
  ).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: targetHeight,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animatedHeight, targetHeight]);

  useEffect(() => {
    Animated.timing(animatedFontSize, {
      toValue: targetTypography.fontSize,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    Animated.timing(animatedLineHeight, {
      toValue: targetTypography.lineHeight,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [
    animatedFontSize,
    animatedLineHeight,
    targetTypography.fontSize,
    targetTypography.lineHeight,
  ]);

  const animatedStyle = {
    height: animatedHeight,
  };
  const animatedTypography = {
    fontSize: animatedFontSize,
    lineHeight: animatedLineHeight,
  };

  if (!isMe) {
    return (
      <AnimatedView
        style={[
          styles.bubbleBase,
          styles.friendBubble,
          isDark && styles.friendBubbleDark,
          animatedStyle,
        ]}
      >
        <AnimatedText
          style={[
            styles.friendText,
            isDark && styles.friendTextDark,
            shouldCenter && styles.centerText,
            animatedTypography,
          ]}
        >
          {text}
        </AnimatedText>
      </AnimatedView>
    );
  }

  return (
    <AnimatedView
      style={[
        styles.bubbleBase,
        styles.meBubble,
        animatedStyle,
      ]}
    >
      <AnimatedTextInput
        ref={inputRef}
        value={text}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={`${theme.colors.text}99`}
        style={[
          styles.input,
          styles.inputFullHeight,
          shouldCenter && styles.centerText,
          animatedTypography,
        ]}
        multiline
        scrollEnabled={size === 'large'}
        textAlign="center"
        textAlignVertical="center"
        keyboardAppearance={isDark ? 'dark' : 'light'}
        autoCorrect
        autoCapitalize="sentences"
        selectionColor={`${theme.colors.text}E6`}
        maxLength={maxLength}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={Boolean(onSubmitEditing)}
        returnKeyType={returnKeyType}
      />
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  bubbleBase: {
    borderRadius: theme.radii.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginHorizontal: theme.spacing.xl,
    maxWidth: undefined,
  },
  friendBubble: {
    backgroundColor: theme.colors.light.surfaceElevated,
  },
  friendBubbleDark: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  meBubble: {
    backgroundColor: theme.colors.primary,
  },
  friendText: {
    color: theme.colors.light.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  friendTextDark: {
    color: theme.colors.text,
  },
  input: {
    color: theme.colors.text,
    fontWeight: '500',
    flex: 1,
  },
  inputFullHeight: {
    minHeight: 60,
  },
  centerText: {
    textAlign: 'center',
  },
});

function getTypographyForSize(size: BubbleSize) {
  switch (size) {
    case 'large':
      return { fontSize: 26, lineHeight: 32 };
    case 'small':
      return { fontSize: 18, lineHeight: 24 };
    default:
      return { fontSize: 22, lineHeight: 28 };
  }
}
