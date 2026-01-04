/**
 * Bar.Button - Action button primitive
 *
 * A pressable button with scale animation for use in Bar.Actions.
 * Center position gets a prominent filled style.
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
import { rippleSprings } from '../../styles/tokens';
import { actionButtonStyles } from './actionButtons.styles';

export interface BarButtonProps {
  /** Ionicons icon name */
  icon: string;
  /** Optional text label (for accessibility) */
  label?: string;
  /** Press handler */
  onPress: () => void;
  /** Position in the bar (affects styling) */
  position?: 'left' | 'center' | 'right';
  /** Disable the button */
  disabled?: boolean;
}

export function BarButton({
  icon,
  label,
  onPress,
  position = 'center',
  disabled = false,
}: BarButtonProps) {
  const { theme } = useUnistyles();
  const scale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scale.value }],
    };
  });

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
    <Animated.View style={buttonStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          actionButtonStyles.button,
          isCenter && actionButtonStyles.centerButton,
          disabled && { opacity: 0.5 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={label || icon}
      >
        <Ionicons
          name={icon as any}
          size={isCenter ? 24 : 20}
          color={isCenter ? theme.colors.background : theme.colors.textPrimary}
        />
      </Pressable>
    </Animated.View>
  );
}
