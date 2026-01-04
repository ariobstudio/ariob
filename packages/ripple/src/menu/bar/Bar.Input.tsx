/**
 * Bar.Input - Input slot component
 *
 * Full-width text input with optional side buttons.
 * Used as a slot inside Bar when mode === 'input'.
 */

import { useRef, useEffect } from 'react';
import { View, TextInput, Pressable, Platform } from 'react-native';
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
import { rippleSprings } from '../../styles/tokens';
import { inputModeStyles } from './inputMode.styles';

export interface BarInputProps {
  /** Controlled input value */
  value?: string;
  /** Value change handler */
  onChangeText?: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Submit handler (called when send button is pressed) */
  onSubmit?: (text: string) => void;
  /** Cancel handler (for closing input mode) */
  onCancel?: () => void;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Left action button */
  leftButton?: {
    icon: string;
    onPress: () => void;
  };
  /** Right action button (replaces send button if provided) */
  rightButton?: {
    icon: string;
    onPress: () => void;
  };
  /** Show send button (default: true) */
  showSendButton?: boolean;
}

export function BarInput({
  value = '',
  onChangeText,
  placeholder = 'Message...',
  onSubmit,
  onCancel,
  autoFocus = true,
  leftButton,
  rightButton,
  showSendButton = true,
}: BarInputProps) {
  const { theme } = useUnistyles();
  const inputRef = useRef<TextInput>(null);
  const sendScale = useSharedValue(1);
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

  const sendButtonStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: sendScale.value }],
      opacity: interpolate(sendEnabled.value, [0, 1], [0.5, 1]),
    };
  });

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

  const handleSend = () => {
    if (canSend && onSubmit) {
      sendScale.value = withSequence(
        withSpring(0.9, rippleSprings.snappy),
        withSpring(1, rippleSprings.snappy)
      );
      onSubmit(value.trim());
    }
  };

  return (
    <View style={inputModeStyles.container}>
      {/* Left side action */}
      <View style={inputModeStyles.side}>
        {leftButton && (
          <Pressable style={inputModeStyles.sideButton} onPress={leftButton.onPress}>
            <Ionicons
              name={leftButton.icon as any}
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

      {/* Right side - either send button or custom action */}
      <View style={inputModeStyles.side}>
        {showSendButton && !rightButton ? (
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
        ) : rightButton ? (
          <Pressable style={inputModeStyles.sideButton} onPress={rightButton.onPress}>
            <Ionicons
              name={rightButton.icon as any}
              size={20}
              color={theme.colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

// Mark as slot for Bar to identify
BarInput.displayName = 'Bar.Input';
BarInput.__isBarSlot = 'input';
