/**
 * InputMode - Text input interface for the bar
 *
 * Renders a full-width text input with optional left action button
 * and send button. Used for replies, messages, and quick posts.
 *
 * @example
 * ```tsx
 * <InputMode
 *   value={text}
 *   onChangeText={setText}
 *   placeholder="Write a reply..."
 *   onSubmit={handleSend}
 *   inputLeft={{ name: 'camera', icon: 'camera', label: 'Add photo' }}
 * />
 * ```
 */

import { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
} from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { InputModeProps } from './types';
import { rippleSprings } from '../../styles/tokens';
import { inputModeStyles } from './inputMode.styles';

export function InputMode({
  value,
  onChangeText,
  placeholder,
  inputLeft,
  onInputLeftPress,
  onSubmit,
  autoFocus = true,
  animatedStyle,
}: InputModeProps) {
  const { theme } = useUnistyles();
  const inputRef = useRef<TextInput>(null);
  const sendScale = useSharedValue(1);
  // FIXED: Use shared value for send enabled state to keep animations on UI thread
  const sendEnabled = useSharedValue(0);

  const canSend = value.trim().length > 0;

  // Animate sendEnabled when canSend changes
  useEffect(() => {
    sendEnabled.value = withTiming(canSend ? 1 : 0, { duration: 150 });
  }, [canSend]);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // FIXED: Use shared values only in animated style - no JS values
  const sendButtonStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: sendScale.value }],
      opacity: interpolate(sendEnabled.value, [0, 1], [0.5, 1]),
    };
  });

  // FIXED: Animate background color smoothly with interpolateColor
  const sendButtonBgStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      backgroundColor: interpolateColor(
        sendEnabled.value,
        [0, 1],
        [theme.colors.borderStrong, theme.colors.accentGlow]
      ),
    };
  });

  // FIXED: Use withSequence instead of callback chain for pulse animation
  const handleSend = () => {
    if (canSend) {
      sendScale.value = withSequence(
        withSpring(0.9, rippleSprings.snappy),
        withSpring(1, rippleSprings.snappy)
      );
      onSubmit(value.trim());
    }
  };

  return (
    <Animated.View style={[inputModeStyles.container, animatedStyle]}>
      {/* Left side action */}
      <View style={inputModeStyles.side}>
        {inputLeft && (
          <Pressable style={inputModeStyles.sideButton} onPress={onInputLeftPress}>
            <Ionicons
              name={inputLeft.icon as any}
              size={20}
              color={theme.colors.textMuted}
            />
          </Pressable>
        )}
      </View>

      {/* Input field */}
      <View style={inputModeStyles.inputWrapper}>
        <TextInput
          ref={inputRef}
          style={inputModeStyles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={500}
          returnKeyType="default"
          blurOnSubmit={false}
        />
      </View>

      {/* Send button - uses animated styles for smooth 60fps transitions */}
      <View style={inputModeStyles.side}>
        <Animated.View style={[sendButtonStyle, sendButtonBgStyle, inputModeStyles.sendButton]}>
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Send"
            style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons
              name="arrow-up"
              size={18}
              color={theme.colors.background}
            />
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
