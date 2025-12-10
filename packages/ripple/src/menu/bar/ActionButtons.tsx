/**
 * ActionButtons - Interactive buttons for action mode
 *
 * Renders action buttons with press scale animations and glow effects.
 * The center button features a prominent white background with cyan glow.
 *
 * @example
 * ```tsx
 * <ActionButton
 *   act={{ name: 'create', icon: 'add', label: 'Create' }}
 *   onPress={() => handleAction('create')}
 *   position="center"
 * />
 * ```
 */

import { Pressable } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { ActionButtonProps } from './types';
import { rippleSprings } from '../../styles/tokens';
import { actionButtonStyles } from './actionButtons.styles';

export function ActionButton({
  act,
  onPress,
  position,
  animatedStyle,
}: ActionButtonProps) {
  const { theme } = useUnistyles();
  const scale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // FIXED: Cancel any running animation before starting new one
  // This ensures clean interrupts on rapid presses
  const handlePressIn = () => {
    cancelAnimation(scale);
    scale.value = withSpring(0.9, rippleSprings.snappy);
  };

  const handlePressOut = () => {
    cancelAnimation(scale);
    scale.value = withSpring(1, rippleSprings.snappy);
  };

  const isCenter = position === 'center';

  return (
    <Animated.View style={[buttonStyle, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[actionButtonStyles.button, isCenter && actionButtonStyles.centerButton]}
        accessibilityRole="button"
        accessibilityLabel={act.label}
      >
        <Ionicons
          name={act.icon as any}
          size={isCenter ? 24 : 20}
          color={isCenter ? theme.colors.background : theme.colors.textPrimary}
        />
      </Pressable>
    </Animated.View>
  );
}
